import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../../config/apiConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TrackOrderScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const token = useSelector((state) => state.auth.token);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!token) throw new Error('No authentication token found');

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
      console.log('order track', responseData);

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
      if (err.message.includes('401')) navigation.navigate('Login');
    } finally {
      setLoading(false);
    }
  };

  // Map order status to UI steps
  const getStatusSteps = (status) => {
    const steps = [
      { label: 'Confirmed', completed: false, date: order?.createdAt },
      { label: 'Out for delivery', completed: false, date: null },
      { label: 'Delivered', completed: false, date: order?.deliveryDate },
      { label: 'Returned', completed: false, date: order?.refund?.requestDate || null },
    ];

    if (['Confirmed', 'Dispatched', 'Delivered', 'Returned'].includes(status)) {
      steps[0].completed = true;
    }
    if (['Dispatched', 'Delivered', 'Returned'].includes(status)) {
      steps[1].completed = true;
    }
    if (['Delivered', 'Returned'].includes(status)) {
      steps[2].completed = true;
    }
    if (status === 'Returned') {
      steps[3].completed = true;
    }
    if (status === 'Cancelled') {
      steps.forEach((step) => (step.completed = false));
    }

    return steps;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  // Download invoice
  const handleDownloadInvoice = () => {
    console.log('Downloading invoice for order:', orderId);
    // Implement invoice download (e.g., API call to generate PDF)
  };

  // WhatsApp support
  const handleWhatsAppSupport = () => {
    const phoneNumber = '1234567890'; // Replace with actual support number
    const message = `Hi, I need help with my order ${orderId}`;
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`);
  };

  // Check if return is in progress
  const isReturnInProgress = order?.orderDetails.some(
    (item) => item.isReturn && item.returnInfo?.refundStatus === 'Processing'
  );

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <ActivityIndicator size="large" color="#D6722F" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
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
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <Text style={styles.errorText}>Order not found.</Text>
      </View>
    );
  }

  const statusSteps = getStatusSteps(order.orderStatus);

  console.log('Order Payment Status:', order.paymentStatus, 'Order Status:', order.orderStatus);

  const getButtonText = (status) => {
    switch (status) {
      case 'Confirmed':
      case 'Dispatched':
        return 'Track Order';
      case 'Delivered':
        return 'Rate & Review';
      case 'Cancelled':
        return 'View Details';
      case 'Exchanged':
        return 'View Exchange';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ORDER HISTORY</Text>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Confirmation */}
        <View style={styles.section}>
          <Text style={styles.statusTitle}>
            {order.orderStatus === 'Confirmed'
              ? '✅ Order Confirmed'
              : order.orderStatus === 'Dispatched'
              ? '🚚 Out for Delivery'
              : order.orderStatus === 'Delivered'
              ? '📦 Delivered'
              : order.orderStatus === 'Returned'
              ? '🔄 Return in Progress'
              : order.orderStatus === 'Exchanged'
              ? '🔁 Exchanged'
              : '❌ Cancelled'}
          </Text>
          <Text style={styles.statusDesc}>
            {order.orderStatus === 'Confirmed' &&
              'Under Processing. Your order is confirmed & is being processed by our internal team.'}
            {order.orderStatus === 'Dispatched' && 'Your order is out for delivery.'}
            {order.orderStatus === 'Delivered' && 'Your order has been delivered.'}
            {order.orderStatus === 'Returned' &&
              'A return request has been initiated. Awaiting pickup and processing.'}
            {order.orderStatus === 'Cancelled' && 'Your order has been cancelled.'}
          </Text>
          <Text style={styles.orderId}>Order ID: {order.orderId}</Text>
        </View>

        {/* Return Details (if applicable) */}
        {isReturnInProgress && (
          <View style={styles.section}>
            <Text style={styles.subTitle}>Return Details</Text>
            {order.orderDetails
              .filter((item) => item.isReturn)
              .map((item, index) => (
                <View key={index} style={styles.returnInfo}>
                  <Text style={styles.returnText}>
                    Item: {item.itemId.name || 'Unknown Item'}
                  </Text>
                  <Text style={styles.returnText}>
                    Return Status: {item.returnInfo?.refundStatus || 'N/A'}
                  </Text>
                  <Text style={styles.returnText}>
                    Reason: {item.returnInfo?.returnReason || 'N/A'}
                  </Text>
                  <Text style={styles.returnText}>
                    Details: {item.returnInfo?.specificReturnReason || 'N/A'}
                  </Text>
                  <Text style={styles.returnText}>
                    Requested: {formatDate(item.returnInfo?.requestDate)}
                  </Text>
                  {order.paymentMethod === 'Online' && item.returnInfo?.bankDetails && (
                    <Text style={styles.returnText}>
                      Refund to: {item.returnInfo.bankDetails.accountHolderName} (
                      {item.returnInfo.bankDetails.accountNumber.slice(-4)})
                    </Text>
                  )}
                </View>
              ))}
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() =>
                navigation.navigate('ReturnConfirmation', {
                  orderId,
                  returnType: 'refund',
                  itemIds: order.orderDetails
                    .filter((item) => item.isReturn)
                    .map((item) => item._id),
                })
              }
            >
              <Text style={styles.viewDetailsText}>View Return Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order Details */}
        <View style={styles.subSection}>
          <Text style={styles.subTitle}>Order Details</Text>
          {order.orderDetails.map((item, index) => (
            <View key={index} style={styles.orderCard}>
              <Image
                source={
                  item.itemId.image
                    ? { uri: item.itemId.image }
                    : { uri: 'https://via.placeholder.com/90' }
                }
                style={styles.productImg}
              />
              <View style={styles.productInfo}>
                <Text style={styles.name}>{item.itemId.name || 'Unknown Item'}</Text>
                <Text style={styles.detail}>Category: N/A</Text>
                <Text style={styles.detail}>
                  Size: {item.size || 'N/A'} Color: {item.color || 'N/A'} Qty: {item.quantity || 1}
                </Text>
                <Text style={styles.price}>
                  MRP <Text style={styles.strike}>₹{item.itemId.MRP.toFixed(2)}</Text>{' '}
                  <Text style={styles.bold}>₹{item.itemId.discountedPrice.toFixed(2)}</Text>
                </Text>
                <Text style={styles.placed}>Placed on {formatDate(order.createdAt)}</Text>
                {item.isReturn && (
                  <Text style={styles.returnStatus}>
                    Return Status: {item.returnInfo?.refundStatus || 'N/A'}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Other Items */}
        {order.orderDetails.length > 1 && (
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>Other Items in This Order</Text>
            {order.orderDetails.slice(1).map((item, index) => (
              <View key={index} style={styles.otherItem}>
                <Image
                  source={
                    item.itemId.image
                      ? { uri: item.itemId.image }
                      : { uri: 'https://via.placeholder.com/50' }
                  }
                  style={styles.otherImg}
                />
                <Text style={styles.otherName}>{item.itemId.name || 'Unknown Item'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Help / Invoice */}
        <View style={styles.section}>
          <Text style={styles.helpText}>
            Need help with this order?{' '}
            <Text style={styles.link} onPress={handleWhatsAppSupport}>
              WhatsApp Us
            </Text>
          </Text>
          <TouchableOpacity onPress={handleDownloadInvoice}>
            <Text style={styles.download}>Download Invoice ⬇️</Text>
          </TouchableOpacity>
        </View>

        {/* Order Status */}
        <View style={styles.subSection}>
          <Text style={styles.subTitle}>Order Status</Text>
          {statusSteps.map((step, index) => (
            <Text
              key={index}
              style={step.completed ? styles.stepDone : styles.stepDisabled}
            >
              {step.completed ? '🟧' : '⬜'} {step.label} {step.date ? `(${formatDate(step.date)})` : ''}
            </Text>
          ))}
        </View>

        {/* Action Buttons */}
        {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Returned' && (
          <TouchableOpacity  onPress={()=>navigation.navigate('Cart')}   style={styles.orderAgain}>
            <Text style={styles.orderAgainText}>ORDER AGAIN</Text>
          </TouchableOpacity>
        )}

        {order.orderStatus === 'Confirmed' && (
          <TouchableOpacity onPress={() => navigation.navigate('CancelOrder', { orderId })}>
            <Text style={styles.cancelOrder}>CANCEL ORDER</Text>
          </TouchableOpacity>
        )}

        {order.paymentStatus === 'Paid' && order.orderStatus === 'Delivered' && !isReturnInProgress && (
          <TouchableOpacity onPress={() => navigation.navigate('ReturnExchange', { orderId })}>
            <Text style={styles.cancelOrder}>RETURN/EXCHANGE ORDER</Text>
          </TouchableOpacity>
        )}

        {/* Delivery Address */}
        <View style={styles.subSection}>
          <Text style={styles.subTitle}>Delivery Address</Text>
          {order.shippingAddressId ? (
            <Text style={styles.address}>
              {order.shippingAddressId.name || 'Unknown'}{'\n'}
              {order.shippingAddressId.addressLine1 || ''}{'\n'}
              {order.shippingAddressId.addressLine2 || ''}{'\n'}
              {order.shippingAddressId.cityTown || 'N/A'}, {order.shippingAddressId.state || 'N/A'},{' '}
              {order.shippingAddressId.pincode || 'N/A'}
            </Text>
          ) : (
            <Text style={styles.address}>No delivery address available.</Text>
          )}
        </View>

        {/* Bill Summary */}
        <View style={styles.subSection}>
          <Text style={styles.subTitle}>Total Bill Summary ({order.orderDetails.length} items)</Text>
          <View style={styles.billRow}>
            <Text>Cart Total</Text>
            <Text>
              ₹{order.orderDetails.reduce((sum, item) => sum + item.itemId.MRP * item.quantity, 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text>Discounted Price</Text>
            <Text>
              ₹
              {order.orderDetails
                .reduce((sum, item) => sum + item.itemId.discountedPrice * item.quantity, 0)
                .toFixed(2)}
            </Text>
          </View>
          {order.invoice.map((entry, index) => (
            <View key={index} style={styles.billRow}>
              <Text>{entry.key.charAt(0).toUpperCase() + entry.key.slice(1)}</Text>
              <Text>{entry.key === 'shipping charge' && entry.value === 0 ? 'FREE' : `₹${entry.value.toFixed(2)}`}</Text>
            </View>
          ))}
          <View style={[styles.billRow, { marginTop: 10 }]}>
            <Text style={{ fontWeight: 'bold' }}>Total Amount</Text>
            <Text style={{ fontWeight: 'bold' }}>₹{order.totalAmount.toFixed(2)}</Text>
          </View>
          <Text style={styles.savings}>
            Hooray! You are saving ₹
            {(
              order.orderDetails.reduce((sum, item) => sum + item.itemId.MRP * item.quantity, 0) -
              order.totalAmount
            ).toFixed(2)}
            /- with this order!
          </Text>
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.payment}>
            Payment Method: <Text style={styles.bold}>{order.paymentMethod}  </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    backgroundColor: '#fff',
  },
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
  scrollContent: {
    padding: 12,
    paddingBottom: 20,
  },
  section: {
    padding: 10,
    backgroundColor: '#FAF2EE',
    borderRadius: 6,
    marginBottom: 12,
  },
  subSection: {
    marginBottom: 16,
  },
  subTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
  },
  statusTitle: {
    fontWeight: 'bold',
    color: '#D6722F',
  },
  statusDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  orderId: {
    fontSize: 12,
    marginTop: 6,
    color: '#333',
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  productImg: {
    width: 90,
    height: 90,
    borderRadius: 6,
  },
  productInfo: {
    marginLeft: 10,
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  detail: {
    fontSize: 12,
    color: '#555',
  },
  price: {
    fontSize: 12,
    marginTop: 4,
  },
  strike: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  bold: {
    fontWeight: 'bold',
  },
  placed: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  returnStatus: {
    fontSize: 12,
    color: '#D6722F',
    marginTop: 4,
  },
  otherItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  otherImg: {
    width: 50,
    height: 60,
    marginRight: 10,
    borderRadius: 4,
  },
  otherName: {
    fontSize: 12,
    color: '#444',
  },
  helpText: {
    fontSize: 12,
  },
  link: {
    color: '#D6722F',
    fontWeight: 'bold',
  },
  download: {
    color: '#D6722F',
    fontSize: 12,
    marginTop: 8,
  },
  stepDone: {
    fontSize: 13,
    color: '#D6722F',
    marginBottom: 6,
  },
  stepDisabled: {
    fontSize: 13,
    color: '#999',
    marginBottom: 6,
  },
  orderAgain: {
    backgroundColor: '#D6722F',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  orderAgainText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelOrder: {
    textAlign: 'center',
    color: '#E86363',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  address: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  savings: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  payment: {
    fontSize: 13,
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
  returnInfo: {
    marginTop: 8,
    paddingLeft: 10,
  },
  returnText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  viewDetailsButton: {
    borderWidth: 1,
    borderColor: '#D6722F',
    borderRadius: 4,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  viewDetailsText: {
    color: '#D6722F',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default TrackOrderScreen;