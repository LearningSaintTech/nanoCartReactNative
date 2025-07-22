import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../config/apiConfig';
import { useColorScheme } from 'react-native';

const PartnerReturnOrderScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const token = useSelector((state) => state.auth.token);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [returnSpecificReason, setReturnSpecificReason] = useState('');
  const [pickupAddressId, setPickupAddressId] = useState('');
  const [addresses, setAddresses] = useState([]);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme(); // Detect light or dark mode

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

  // Fetch order details and addresses
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) throw new Error('No authentication token found');

      // Fetch order
      const orderResponse = await fetch(`${BASE_URL}/partner/order/${orderId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const orderData = await orderResponse.json();
      console.log('Fetched orderData:', JSON.stringify(orderData, null, 2));
      if (!orderData.success) throw new Error(orderData.message || 'Failed to fetch order');
      setOrder(orderData.data.order);

      // Fetch addresses
      const addressResponse = await fetch(`${BASE_URL}/partner/address/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const addressData = await addressResponse.json();
      console.log('Fetched addressData:', JSON.stringify(addressData, null, 2));

      if (!addressData?.addresses?.addressDetail) {
        throw new Error('Invalid address data structure');
      }

      const fetchedAddresses = addressData.addresses.addressDetail;
      setAddresses(fetchedAddresses);

      if (orderData.data.order?.shippingAddressId) {
        const shippingAddressId = orderData.data.order.shippingAddressId;
        const matchingAddress = fetchedAddresses.find(
          (addr) => addr._id === shippingAddressId
        );
        if (matchingAddress) {
          setPickupAddressId(shippingAddressId);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err.message);
      setError(
        err.message.includes('401')
          ? 'Session expired. Please log in again.'
          : 'Failed to load data. Please check your network and try again.'
      );
      if (err.message.includes('401')) navigation.navigate('Login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orderId]);

  // Handle item detail selection
  const toggleItemDetailSelection = (itemId, color, size, skuId) => {
    const itemKey = `${itemId}|${color}|${size}|${skuId}`;
    console.log('Constructed itemKey:', itemKey, { itemId, color, size, skuId });
    setSelectedItems((prev) =>
      prev.includes(itemKey)
        ? prev.filter((key) => key !== itemKey)
        : [...prev, itemKey]
    );
  };

  // Parse selected item details
  const parseItemKey = (key) => {
    const [itemId, color, size, skuId] = key.split('|');
    console.log('Parsed itemKey:', { itemId, color, size, skuId });
    return { itemId, color, size, skuId };
  };

  // Submit return request
  const handleSubmitReturn = async () => {
    if (!selectedItems.length) return alert('Please select at least one item to return.');
    if (!returnReason) return alert('Please select a reason for return.');
    if (!returnSpecificReason.trim()) return alert('Please provide a specific reason for return.');
    if (!pickupAddressId) return alert('Please select a pickup address.');

    try {
      setLoading(true);
      const reason = `${returnReason}, ${returnSpecificReason.trim()}`;
      const response = await fetch(`${BASE_URL}/partner/order/return-refund`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          reason: reason,
          pickupLocationId: pickupAddressId,
        }),
      });
      const data = await response.json();
      console.log('Return response:', JSON.stringify(data, null, 2));
      if (!data.success) throw new Error(data.message || 'Failed to initiate return');
      alert('Return request submitted successfully!');
      navigation.goBack();
    } catch (err) {
      console.error('Return error:', err.message);
      alert(err.message || 'Failed to submit return request.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D6722F" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
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
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Return Product</Text>
      </View>
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.orderId}>Order ID: {order.orderId}</Text>

        {/* Select Items */}
        <View style={styles.section}>
          <Text style={styles.subTitle}>Select Items to Return</Text>
          {order.orderProductDetails.map((item) => (
            <View key={item.itemId._id} style={styles.itemContainer}>
              <Text style={styles.itemName}>{item.itemId.name || 'Unknown Item'}</Text>
              {item.orderDetails.map((detail) =>
                detail.sizeAndQuantity.map((sizeQty, idx) => {
                  const itemKey = `${item.itemId._id}|${detail.color}|${sizeQty.size}|${sizeQty.skuId}`;
                  return (
                    <TouchableOpacity
                      key={`${detail._id}-${sizeQty.skuId}`}
                      style={[
                        styles.itemRow,
                        selectedItems.includes(itemKey) && styles.itemRowSelected,
                      ]}
                      onPress={() =>
                        toggleItemDetailSelection(item.itemId._id, detail.color, sizeQty.size, sizeQty.skuId)
                      }
                    >
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemDetail}>Color: {detail.color}</Text>
                        <Text style={styles.itemDetail}>Size: {sizeQty.size}</Text>
                        <Text style={styles.itemDetail}>Qty: {sizeQty.quantity}</Text>
                        <Text style={styles.itemDetail}>SKU: {sizeQty.skuId}</Text>
                      </View>
                      <Text style={styles.selectionText}>
                        {selectedItems.includes(itemKey) ? '✔ Selected' : 'Select'}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          ))}
        </View>

        {/* Reason for Return */}
        <View style={styles.section}>
          <Text style={styles.subTitle}>Reason for Return</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={returnReason}
              onValueChange={(value) => setReturnReason(value)}
              style={[styles.reasonPicker, { backgroundColor: '#FFF' }]}
              itemStyle={[styles.pickerItem, { color: '#000' }]}
            >
              <Picker.Item label="Select a reason" value="" />
              {validReturnReasons.map((reason) => (
                <Picker.Item key={reason} label={reason} value={reason} color="#000" />
              ))}
            </Picker>
          </View>
          <TextInput
            style={[styles.reasonInput, { backgroundColor: '#FFF', color: '#000' }]}
            value={returnSpecificReason}
            onChangeText={setReturnSpecificReason}
            placeholder="Enter specific reason for return (e.g., item is too tight)"
            placeholderTextColor="#666"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Pickup Address */}
        <View style={styles.section}>
          <Text style={styles.subTitle}>Pickup Address</Text>
          {addresses.length === 0 ? (
            <Text style={styles.noAddressText}>No addresses found. Please add an address.</Text>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={pickupAddressId}
                onValueChange={(value) => setPickupAddressId(value)}
                style={[styles.addressPicker, { backgroundColor: '#FFF' }]}
                itemStyle={[styles.pickerItem, { color: '#000' }]}
              >
                <Picker.Item label="Select an address" value="" />
                {addresses.map((addr) => (
                  <Picker.Item
                    key={addr._id}
                    label={`${addr.name}, ${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.cityTown}, ${addr.state}, ${addr.pincode}`}
                    value={addr._id}
                    color="#000"
                  />
                ))}
              </Picker>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmitReturn}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Return Request'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 10,
  },
  orderId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  itemContainer: {
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#FFF',
  },
  itemRowSelected: {
    backgroundColor: '#FFF8F0',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  itemDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  selectionText: {
    fontSize: 12,
    color: '#D6722F',
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#FFF', // Ensure consistent background
  },
  reasonPicker: {
    height: 50,
    backgroundColor: '#FFF', // Explicit white background
  },
  addressPicker: {
    height: 50,
    backgroundColor: '#FFF', // Explicit white background
    borderColor: '#D6722F',
  },
  pickerItem: {
    fontSize: 14,
    color: '#000', // Explicit black text for Picker items
    height: 50,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    color: '#000', // Explicit black text
    backgroundColor: '#FFF', // Explicit white background
    textAlignVertical: 'top',
  },
  noAddressText: {
    fontSize: 14,
    color: '#E74C3C',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#D6722F',
    padding: 15,
    alignItems: 'center',
    margin: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#F0A500',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#D6722F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PartnerReturnOrderScreen;