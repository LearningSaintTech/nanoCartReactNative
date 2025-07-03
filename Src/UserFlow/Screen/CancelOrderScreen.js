import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../config/apiConfig';

const CancelOrderScreen = ({ route, navigation }) => {
  const { orderId } = route.params; // Extract orderId from navigation params
  const token = useSelector((state) => state.auth.token); // Get JWT token from Redux
  const [order, setOrder] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  // Submit cancellation request
  const handleCancelOrder = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for cancellation.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${BASE_URL}/user/order/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          refundReason: reason,
        }),
      });

      const responseData = await response.json();
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to cancel order');
      }

      Alert.alert('Success', 'Order cancelled successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Error cancelling order:', err.message);
      Alert.alert('Error', err.message || 'Failed to cancel order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

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
        <Text style={styles.headerTitle}>CANCEL ORDER</Text>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Order Details */}
        <View style={styles.subSection}>
          <Text style={styles.subTitle}>Order Items</Text>
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
              <View style={styles.details}>
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
            </View>
          ))}
        </View>

        {/* Reason Input */}
        <Text style={styles.reasonLabel}>
          Reason for cancellation <Text style={{ color: 'red' }}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={reason}
          onChangeText={setReason}
          placeholder="Enter your reason..."
          multiline
          accessibilityLabel="Cancellation reason"
        />
      </ScrollView>

      {/* Cancel Button */}
      <TouchableOpacity
        style={[styles.cancelButton, submitting && { opacity: 0.6 }]}
        onPress={handleCancelOrder}
        disabled={submitting}
        accessibilityLabel="Cancel order"
      >
        <Text style={styles.cancelButtonText}>
          {submitting ? 'CANCELLING...' : 'CANCEL ORDER'}
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
  backArrow: { fontSize: 18, marginRight: 10 },
  headerTitle: { fontWeight: 'bold', fontSize: 16 },
  scroll: { padding: 14 },
  subSection: { marginBottom: 16 },
  subTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 6 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  image: { width: 60, height: 70, borderRadius: 4 },
  details: { flex: 1, marginHorizontal: 10 },
  name: { fontWeight: 'bold', fontSize: 13 },
  category: { fontSize: 11, color: '#555' },
  detail: { fontSize: 12, color: '#555' },
  price: { fontSize: 12, marginTop: 4 },
  strike: { textDecorationLine: 'line-through', color: '#999' },
  bold: { fontWeight: 'bold' },
  reasonLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  cancelButton: {
    backgroundColor: '#D6722F',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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

export default CancelOrderScreen;