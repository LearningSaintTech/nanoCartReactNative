import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../config/apiConfig';

const ReturnExchangeScreen = ({ route, navigation }) => {
  const { orderId } = route.params; // Extract orderId from navigation params
  const token = useSelector((state) => state.auth.token); // Get JWT token from Redux
  const [order, setOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [reason, setReason] = useState(''); // For returnReason dropdown
  const [issue, setIssue] = useState(''); // For specificReturnReason
  const [returnType, setReturnType] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [itemDetail, setItemDetail] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // Valid return reasons matching backend
  const validReturnReasons = [
    'Size too small',
    'Size too big',
    "Don't like the fit",
    "Don't like the quality",
    'Not same as the catalogue',
    'Product is damaged',
    'Wrong product is received',
    'Product arrived too late',
  ];

  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}/user/order/${orderId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to fetch order details');
      }

      setOrder(responseData.data);
    } catch (err) {
      console.error('Error fetching order details:', err.message);
      setError(
        err.message.includes('401')
          ? 'Session expired. Please log in again.'
          : 'Failed to load order details. Please check your network and try again.'
      );
      if (err.message.includes('401')) {
        navigation.navigate('Login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchItemDetail = async (itemId) => {
    try {
      const response = await fetch(`${BASE_URL}/itemDetails/${itemId}`);
      const json = await response.json();
      if (json.data && json.data.length > 0) {
        setItemDetail(json.data[0]);
        // Set default color and size
        if (json.data[0].imagesByColor && json.data[0].imagesByColor.length > 0) {
          setSelectedColor(json.data[0].imagesByColor[0].color);
          if (json.data[0].imagesByColor[0].sizes && json.data[0].imagesByColor[0].sizes.length > 0) {
            setSelectedSize(json.data[0].imagesByColor[0].sizes[0].size);
          } else {
            setSelectedSize('');
          }
        }
      } else {
        setItemDetail(null);
      }
    } catch (err) {
      setItemDetail(null);
    }
  };

  // Handle return/exchange submission
  const handleConfirmPickup = async () => {
    if (!reason) {
      Alert.alert('Error', 'Please select a reason for return/exchange.');
      return;
    }
    if (!returnType) {
      Alert.alert('Error', 'Please select whether you want a refund or exchange.');
      return;
    }
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please select at least one item.');
      return;
    }
    if (returnType === 'refund') {
      const { accountNumber, ifscCode, bankName, accountHolderName } = bankDetails;
      if (!accountNumber || !ifscCode || !bankName || !accountHolderName) {
        Alert.alert('Error', 'Please provide complete bank details for refund.');
        return;
      }
    }

    // Only for exchange: check orderStatus and paymentStatus
    if (returnType === 'exchange') {
      const selectedOrderItem = order.orderDetails.find((item) => item._id === selectedItems[0]);
      if (!selectedOrderItem) {
        Alert.alert('Error', 'No item selected for exchange.');
        return;
      }
      // if (
      //   !['Delivered', 'Exchanged'].includes(selectedOrderItem.orderStatus) ||
      //   selectedOrderItem.paymentStatus !== 'Paid'
      // ) {
      //   Alert.alert('Error', 'Exchange is only allowed for delivered and paid items.');
      //   return;
      // }
    }

    try {
      setSubmitting(true);
      let endpoint =
        returnType === 'refund'
          ? `${BASE_URL}/user/order/return-refund`
          : `${BASE_URL}/user/order/return-exchange`;

      let body = {
        orderId,
        pickupLocationId: order.shippingAddressId?._id || '',
      };

      if (returnType === 'refund') {
        body.itemIds = selectedItems;
        body.returnReason = reason;
        body.specificReturnReason = issue.trim() || 'No additional details provided';
        body.bankDetails = bankDetails;
      } else if (returnType === 'exchange') {
        // Build itemIds array for exchange
        body.itemIds = selectedItems.map((selId) => {
          const orderItem = order.orderDetails.find((item) => item._id === selId);
          return {
            itemId: orderItem.itemId._id,
            desiredColor: selectedColor,
            desiredSize: selectedSize,
            exchangeReason: reason,
            exchangeSpecificReason: issue.trim() || 'No additional details provided',
          };
        });
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Failed to initiate return/exchange');
      }

      if (returnType === 'exchange') {
        navigation.replace('ReturnConfirm', { data: responseData.data, orderId });
        return;
      }

      Alert.alert('Success', 'Return/Exchange request initiated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Error submitting return/exchange:', err.message);
      Alert.alert('Error', err.message || 'Failed to process request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(order.orderDetails.map((item) => item._id));
    }
    setSelectAll(!selectAll);
  };

  // Toggle individual item
  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // Custom checkbox component
  const CustomCheckbox = ({ checked, onPress, accessibilityLabel }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.checkbox}
      accessibilityLabel={accessibilityLabel}
    >
      {checked && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    if (returnType === 'exchange' && order && selectedItems.length > 0) {
      // Get the first selected item
      const selectedOrderItem = order.orderDetails.find((item) => item._id === selectedItems[0]);
      if (selectedOrderItem) {
        fetchItemDetail(selectedOrderItem.itemId._id);
      }
    }
  }, [returnType, selectedItems, order]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D6722F" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>RETURN / EXCHANGE</Text>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Select All */}
        <View style={styles.selectAllRow}>
          <Text style={styles.label}>Select all</Text>
          <CustomCheckbox
            checked={selectAll}
            onPress={toggleSelectAll}
            accessibilityLabel="Select all items"
          />
        </View>

        {/* Items List */}
        {order.orderDetails.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Image
              source={
                item.itemId.image
                  ? { uri: item.itemId.image }
                  : { uri: 'https://via.placeholder.com/60' }
              }
              style={styles.image}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.itemId.name || 'Unknown Item'}</Text>
              <Text style={styles.category}>Category: N/A</Text>
              <Text style={styles.detail}>
                Size: {item.size || 'N/A'} Color: {item.color || 'N/A'} Qty: {item.quantity || 1}
              </Text>
              <Text style={styles.price}>
                MRP <Text style={styles.strike}>₹{item.itemId.MRP.toFixed(2)}</Text>{' '}
                <Text style={styles.bold}>₹{item.itemId.discountedPrice.toFixed(2)}</Text>
              </Text>
            </View>
            <CustomCheckbox
              checked={selectedItems.includes(item._id)}
              onPress={() => toggleItem(item._id)}
              accessibilityLabel={`Select ${item.itemId.name}`}
            />
          </View>
        ))}

        {/* Reason Dropdown */}
        <Text style={styles.sectionLabel}>
          Reason for Return / Exchange <Text style={{ color: 'red' }}>*</Text>
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={reason}
            onValueChange={(itemValue) => setReason(itemValue)}
            style={styles.picker}
            accessibilityLabel="Return or exchange reason"
          >
            <Picker.Item label="Select a reason" value="" />
            {validReturnReasons.map((reasonOption) => (
              <Picker.Item key={reasonOption} label={reasonOption} value={reasonOption} />
            ))}
          </Picker>
        </View>

        {/* Issue Description */}
        <Text style={styles.sectionLabel}>Tell us more about the issue</Text>
        <TextInput
          placeholder="Describe the issue (Max 500 words)"
          value={issue}
          onChangeText={(text) => setIssue(text.slice(0, 500))}
          style={[styles.input, { height: 100 }]}
          multiline
          accessibilityLabel="Issue description"
        />

        {/* Bank Details (only for refund) */}
        {returnType === 'refund' && (
          <View>
            <Text style={styles.sectionLabel}>
              Bank Details for Refund <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              placeholder="Account Number"
              value={bankDetails.accountNumber}
              onChangeText={(text) => setBankDetails({ ...bankDetails, accountNumber: text })}
              style={styles.input}
              accessibilityLabel="Bank account number"
            />
            <TextInput
              placeholder="IFSC Code"
              value={bankDetails.ifscCode}
              onChangeText={(text) => setBankDetails({ ...bankDetails, ifscCode: text })}
              style={styles.input}
              accessibilityLabel="IFSC code"
            />
            <TextInput
              placeholder="Bank Name"
              value={bankDetails.bankName}
              onChangeText={(text) => setBankDetails({ ...bankDetails, bankName: text })}
              style={styles.input}
              accessibilityLabel="Bank name"
            />
            <TextInput
              placeholder="Account Holder Name"
              value={bankDetails.accountHolderName}
              onChangeText={(text) => setBankDetails({ ...bankDetails, accountHolderName: text })}
              style={styles.input}
              accessibilityLabel="Account holder name"
            />
          </View>
        )}

        {/* Return / Exchange Options */}
        <Text style={styles.sectionLabel}>How do you want to proceed?</Text>
        <TouchableOpacity style={styles.radioBox} onPress={() => setReturnType('refund')}>
          <CustomCheckbox
            checked={returnType === 'refund'}
            onPress={() => setReturnType('refund')}
            accessibilityLabel="Select refund"
          />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.bold}>Return & Refund</Text>
            <Text style={styles.desc}>
              Our pickup partner will collect the item within 2–3 days. After quality check, refund
              will be processed in 5–7 business days.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.radioBox} onPress={() => setReturnType('exchange')}>
          <CustomCheckbox
            checked={returnType === 'exchange'}
            onPress={() => setReturnType('exchange')}
            accessibilityLabel="Select exchange"
          />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.bold}>Exchange</Text>
            <Text style={styles.desc}>
              If you opt for exchange, our pickup partner will collect & deliver simultaneously.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Pickup Address */}
        {order.shippingAddressId && (
          <View style={styles.addressBox}>
            <View style={styles.addressHeader}>
              <Text style={styles.sectionLabel}>Pickup Address</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddressSelection', { orderId })}
              >
                <Text style={styles.change}>CHANGE</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.addressText}>
              {order.shippingAddressId.name || 'Unknown'}{'\n'}
              {order.shippingAddressId.addressLine1 || ''}{'\n'}
              {order.shippingAddressId.addressLine2 || ''}{'\n'}
              {order.shippingAddressId.cityTown || 'N/A'}, {order.shippingAddressId.state || 'N/A'},{' '}
              {order.shippingAddressId.pincode || 'N/A'}
            </Text>
          </View>
        )}

        {console.log('itemDetail:', itemDetail, 'returnType:', returnType, 'selectedItems:', selectedItems)}

        {returnType === 'exchange' && itemDetail && (
          <View style={{ marginTop: 10, marginBottom: 10 }}>
            <Text style={styles.sectionLabel}>Choose a color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {itemDetail.imagesByColor.map((colorObj) => (
                <TouchableOpacity
                  key={colorObj.color}
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: colorObj.hexCode,
                    borderRadius: 4,
                    marginRight: 10,
                    borderWidth: selectedColor === colorObj.color ? 2 : 1,
                    borderColor: selectedColor === colorObj.color ? '#D6722F' : '#ccc',
                  }}
                  onPress={() => {
                    setSelectedColor(colorObj.color);
                    // Set default size for this color
                    if (colorObj.sizes && colorObj.sizes.length > 0) {
                      setSelectedSize(colorObj.sizes[0].size);
                    } else {
                      setSelectedSize('');
                    }
                  }}
                />
              ))}
            </ScrollView>
            <Text style={styles.sectionLabel}>Choose a size</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {itemDetail.imagesByColor
                .find((c) => c.color === selectedColor)?.sizes
                .map((szObj) => (
                  <TouchableOpacity
                    key={szObj.size}
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderColor: selectedSize === szObj.size ? '#D6722F' : '#ccc',
                      borderRadius: 4,
                      marginRight: 10,
                      marginBottom: 10,
                      backgroundColor: szObj.stock === 0 ? '#eee' : '#fff',
                      opacity: szObj.stock === 0 ? 0.5 : 1,
                    }}
                    onPress={() => szObj.stock > 0 && setSelectedSize(szObj.size)}
                    disabled={szObj.stock === 0}
                  >
                    <Text style={{ color: szObj.stock === 0 ? '#aaa' : '#222' }}>
                      {szObj.size}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Confirm Button */}
      <TouchableOpacity
        style={[styles.confirmButton, submitting && { opacity: 0.6 }]}
        onPress={handleConfirmPickup}
        disabled={submitting}
        accessibilityLabel="Confirm pickup"
      >
        <Text style={styles.confirmText}>
          {submitting ? 'SUBMITTING...' : 'CONFIRM PICKUP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  backArrow: { fontSize: 18, marginRight: 10,marginTop:25 },
  title: { fontWeight: 'bold', fontSize: 16,marginTop:25 },
  scroll: { padding: 14 },
  selectAllRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: { fontSize: 14 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  image: { width: 60, height: 70, borderRadius: 4 },
  info: { flex: 1, marginHorizontal: 10 },
  name: { fontWeight: 'bold', fontSize: 13 },
  category: { fontSize: 11, color: '#555' },
  detail: { fontSize: 12, color: '#555' },
  price: { fontSize: 12, marginTop: 4 },
  strike: { textDecorationLine: 'line-through', color: '#999' },
  bold: { fontWeight: 'bold' },
  sectionLabel: { fontWeight: '600', fontSize: 13, marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  radioBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 12,
  },
  desc: { fontSize: 12, color: '#555', marginTop: 4 },
  addressBox: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 12,
    marginTop: 10,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  change: { color: '#D6722F', fontWeight: 'bold', fontSize: 12 },
  addressText: { fontSize: 12, color: '#444', marginTop: 4 },
  confirmButton: {
    backgroundColor: '#D6722F',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D6722F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#D6722F',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#E86363',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#D6722F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ReturnExchangeScreen;