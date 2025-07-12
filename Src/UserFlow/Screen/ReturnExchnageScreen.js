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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ReturnExchnageScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const token = useSelector((state) => state.auth.token);
  const [order, setOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isExchangeSelected, setIsExchangeSelected] = useState(false);
  const [desiredSize, setDesiredSize] = useState('S');
  const [desiredColor, setDesiredColor] = useState('Maroon');
  const [reason, setReason] = useState('');
  const [issue, setIssue] = useState('');
  const [returnType, setReturnType] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: '',
  });
  const [itemDetail, setItemDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Static sizes and colors (from first code)
  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
  const colors = ['Maroon', 'Black', 'Blue', 'Yellow'];

  // Valid return reasons (from second code)
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

      const responseText = await response.text();
      console.log('Order Details Response Status:', response.status);
      console.log('Order Details Response Text:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON Parse Error (Order Details):', jsonError.message);
        throw new Error(`Failed to parse response: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! Status: ${response.status}`);
      }

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

  // Fetch item details for exchange
  const fetchItemDetail = async (itemId) => {
    try {
      const response = await fetch(`${BASE_URL}/itemDetails/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const responseText = await response.text();
      console.log('Item Detail Response Status:', response.status);
      console.log('Item Detail Response Text:', responseText);

      let json;
      try {
        json = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON Parse Error (Item Detail):', jsonError.message);
        setItemDetail(null);
        return;
      }

      if (json.data && json.data.length > 0) {
        setItemDetail(json.data[0]);
        if (json.data[0].imagesByColor && json.data[0].imagesByColor.length > 0) {
          setDesiredColor(json.data[0].imagesByColor[0].color);
          if (json.data[0].imagesByColor[0].sizes && json.data[0].imagesByColor[0].sizes.length > 0) {
            setDesiredSize(json.data[0].imagesByColor[0].sizes[0].size);
          } else {
            setDesiredSize('S');
          }
        }
      } else {
        setItemDetail(null);
      }
    } catch (err) {
      console.error('Error fetching item details:', err.message);
      setItemDetail(null);
    }
  };

  // Handle Confirm Pickup
  const handleConfirmPickup = async () => {
    console.log('handleConfirmPickup called with:', {
      orderId,
      selectedItems,
      reason,
      issue,
      returnType,
      bankDetails,
      desiredColor,
      desiredSize,
    });

    if (!returnType) {
      Alert.alert('Error', 'Please select whether you want a refund or exchange.');
      return;
    }

    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please select at least one item.');
      return;
    }

    if (!reason) {
      Alert.alert('Error', 'Please select a reason for return/exchange.');
      return;
    }

    if (returnType === 'refund') {
      const { accountNumber, ifscCode, bankName, accountHolderName } = bankDetails;
      if (!accountNumber || !ifscCode || !bankName || !accountHolderName) {
        Alert.alert('Error', 'Please provide complete bank details for refund.');
        return;
      }
    }

    if (returnType === 'exchange' && isExchangeSelected) {
      if (!desiredColor || !desiredSize) {
        Alert.alert('Error', 'Please select a color and size for exchange.');
        return;
      }
    }

    try {
      setSubmitting(true);
      let endpoint =
        returnType === 'refund'
          ? `${BASE_URL}/user/order/return-refund`
          : `${BASE_URL}/user/order/return-exchange`;

      let body = {
        orderId,
        pickupLocationId: order.shippingAddressId?._id || '686e5f732246a81c29bf079d',
      };

      if (returnType === 'refund') {
        body.itemIds = selectedItems.map((selId) => {
          const orderItem = order.orderDetails.find((item) => item._id === selId);
          return orderItem?.itemId?._id || '6870ee66e047b34a9de09a6e';
        }).filter(Boolean);
        body.returnReason = reason;
        body.specificReturnReason = issue.trim() || 'No additional details provided';
        body.bankDetails = bankDetails;
      } else if (returnType === 'exchange' && isExchangeSelected) {
        body.itemIds = selectedItems.map((selId) => {
          const orderItem = order.orderDetails.find((item) => item._id === selId);
          return {
            itemId: orderItem?.itemId?._id || '6870ee66e047b34a9de09a6e',
            desiredColor,
            desiredSize,
            exchangeReason: reason,
            exchangeSpecificReason: issue.trim() || 'Not fit in body',
          };
        }).filter(Boolean);
      }

      console.log('Request URL:', endpoint);
      console.log('Request Body:', JSON.stringify(body, null, 2));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('Response Status:', response.status);
      const responseText = await response.text();
      console.log('Response Text:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON Parse Error (Submission):', jsonError.message);
        throw new Error(`Failed to parse response as JSON: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! Status: ${response.status}`);
      }

      if (!responseData.success) {
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
    if (returnType === 'exchange' && isExchangeSelected && order && selectedItems.length > 0) {
      const selectedOrderItem = order.orderDetails.find((item) => item._id === selectedItems[0]);
      if (selectedOrderItem) {
        fetchItemDetail(selectedOrderItem.itemId._id);
      }
    }
  }, [returnType, isExchangeSelected, selectedItems, order]);

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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RETURN / EXCHANGE</Text>
        </View>
      </SafeAreaView>

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

        <TouchableOpacity style={styles.radioBox} onPress={() => {
          setReturnType('exchange');
          setIsExchangeSelected(true);
        }}>
          <CustomCheckbox
            checked={returnType === 'exchange' && isExchangeSelected}
            onPress={() => {
              setReturnType('exchange');
              setIsExchangeSelected(true);
            }}
            accessibilityLabel="Select exchange"
          />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.bold}>Exchange</Text>
            <Text style={styles.desc}>
              If you opt for an exchange, our pickup partner will collect the item within 2–3 days.
              Once verified, the replacement product will be dispatched and delivered within 5–7
              days, depending on availability.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Bank Details (for refund) */}
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

        {/* Size and Color Selection (for exchange) */}
        {returnType === 'exchange' && isExchangeSelected && (
          <View style={styles.selectionContainer}>
            <Text style={styles.sectionLabel}>Choose a size</Text>
            {itemDetail && itemDetail.imagesByColor && itemDetail.imagesByColor.find((c) => c.color === desiredColor)?.sizes ? (
              <View style={styles.sizeContainer}>
                {itemDetail.imagesByColor
                  .find((c) => c.color === desiredColor)
                  ?.sizes.map((szObj) => (
                    <TouchableOpacity
                      key={szObj.size}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        backgroundColor: szObj.stock === 0 ? '#eee' : desiredSize === szObj.size ? '#D6722F' : '#f0f0f0',
                        borderRadius: 4,
                        marginRight: 8,
                        marginBottom: 8,
                        opacity: szObj.stock === 0 ? 0.5 : 1,
                      }}
                      onPress={() => szObj.stock > 0 && setDesiredSize(szObj.size)}
                      disabled={szObj.stock === 0}
                    >
                      <Text style={styles.sizeText}>{szObj.size}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            ) : (
              <View style={styles.sizeContainer}>
                {sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeButton,
                      desiredSize === size && styles.selectedSizeButton,
                    ]}
                    onPress={() => setDesiredSize(size)}
                  >
                    <Text style={styles.sizeText}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.sectionLabel}>Choose a color</Text>
            {itemDetail && itemDetail.imagesByColor && itemDetail.imagesByColor.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {itemDetail.imagesByColor.map((colorObj) => (
                  <TouchableOpacity
                    key={colorObj.color}
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: colorObj.hexCode || '#ccc',
                      borderRadius: 4,
                      marginRight: 10,
                      borderWidth: desiredColor === colorObj.color ? 2 : 1,
                      borderColor: desiredColor === colorObj.color ? '#D6722F' : '#ccc',
                    }}
                    onPress={() => {
                      setDesiredColor(colorObj.color);
                      if (colorObj.sizes && colorObj.sizes.length > 0) {
                        setDesiredSize(colorObj.sizes[0].size);
                      } else {
                        setDesiredSize('S');
                      }
                    }}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.colorContainer}>
                {colors.map((color) => {
                  let backgroundColor;
                  switch (color) {
                    case 'Maroon': backgroundColor = '#800000'; break;
                    case 'Black': backgroundColor = '#000000'; break;
                    case 'Blue': backgroundColor = '#0000FF'; break;
                    case 'Yellow': backgroundColor = '#FFFF00'; break;
                    default: backgroundColor = '#ccc';
                  }
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorButton,
                        desiredColor === color && styles.selectedColorButton,
                        { backgroundColor },
                      ]}
                      onPress={() => setDesiredColor(color)}
                    />
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Pickup Address */}
        {order.shippingAddressId && (
          <View style={styles.addressBox}>
            <View style={styles.addressHeader}>
              <Text style={styles.sectionLabel}>Pickup Address</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddNewAddress', { orderId })}
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
      </ScrollView>

      {/* Confirm Pickup Button */}
      <TouchableOpacity
        style={[styles.confirmButton, submitting && { opacity: 0.6 }]}
        onPress={handleConfirmPickup}
        disabled={submitting}
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
  safeArea: { backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
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
  selectionContainer: { marginTop: 10 },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  sizeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedSizeButton: {
    backgroundColor: '#D6722F',
  },
  sizeText: { fontSize: 14, color: '#333' },
  colorContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedColorButton: {
    borderColor: '#D6722F',
    borderWidth: 2,
  },
  addressBox: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 12,
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

export default ReturnExchnageScreen;