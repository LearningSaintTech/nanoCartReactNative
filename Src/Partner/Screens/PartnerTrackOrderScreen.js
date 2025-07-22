import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useWindowDimensions} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {BASE_URL} from '../../config/apiConfig';

const TrackOrderScreen = ({route, navigation}) => {
  const {orderId} = route.params;
  const token = useSelector(state => state.auth.token);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const [isExpanded, setIsExpanded] = useState(false); // State for expansion

  // Scaling function based on reference width (375px, e.g., iPhone SE)
  const scale = size => (width / 375) * size;

  // Log insets for debugging
  console.log('TrackOrderScreen - Safe Area Insets:', insets);

  console.log("this is orderID",orderId);

  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(
        `${BASE_URL}/partner/order/${orderId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('For address', response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`,
        );
      }
      const responseData = await response.json();
      console.log('order track', responseData);

      if (!responseData.success) {
        throw new Error(
          responseData.message || 'Failed to fetch order details',
        );
      }

      setOrder(responseData.data.order);
      console.log("this is order details",responseData)
    } catch (err) {
      console.error('Error fetching order details:', err.message);
      setError(
        err.message.includes('401')
          ? 'Session expired. Please log in again.'
          : 'Failed to load order details. Please check your network and try again.',
      );
      if (err.message.includes('401')) navigation.navigate('Login');
    } finally {
      setLoading(false);
    }
  };

  // Map order status to UI steps
  const getStatusSteps = status => {
    const steps = [
      {label: 'Processing', completed: false, date: order?.createdAt},
      {label: 'Confirmed', completed: false, date: null},
      {label: 'Ready for Dispatch', completed: false, date: null},
      {label: 'In transit', completed: false, date: null},
      {label: 'Dispatched', completed: false, date: null},
      {label: 'Delivered', completed: false, date: order?.deliveredAt},
    ];

    if (
      [
        'Processing',
        'Confirmed',
        'Ready for Dispatch',
        'In transit',
        'Dispatched',
        'Delivered',
      ].includes(status)
    ) {
      steps[0].completed = true;
    }
    if (
      [
        'Confirmed',
        'Ready for Dispatch',
        'In transit',
        'Dispatched',
        'Delivered',
      ].includes(status)
    ) {
      steps[1].completed = true;
    }
    if (
      ['Ready for Dispatch', 'In transit', 'Dispatched', 'Delivered'].includes(
        status,
      )
    ) {
      steps[2].completed = true;
    }
    if (['In transit', 'Dispatched', 'Delivered'].includes(status)) {
      steps[3].completed = true;
    }
    if (['Dispatched', 'Delivered'].includes(status)) {
      steps[4].completed = true;
    }
    if (status === 'Delivered') {
      steps[5].completed = true;
    }

    return steps;
  };

  // Format date
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
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

  // Check if return is in progress
  const isReturnInProgress =
    order?.isOrderReturned && order?.returnInfo?.refundStatus === 'Processing';

  // Check if return is within 7-day window (optional, keeping for reference)
  const isReturnEligible = () => {
    if (!order?.deliveredAt) return false;
    const deliveryDate = new Date(order.deliveredAt);
    const currentDate = new Date();
    const returnWindowDays = 7;
    const maxReturnDate = new Date(deliveryDate);
    maxReturnDate.setDate(deliveryDate.getDate() + returnWindowDays);
    return (
      currentDate <= maxReturnDate &&
      order.orderStatus === 'Delivered' &&
      !isReturnInProgress
    );
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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchOrderDetails}>
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

  const statusSteps = getStatusSteps(order.orderStatus);

  // Calculate total quantity for an item
  const getItemTotalQuantity = item => {
    return item.orderDetails.reduce(
      (sum, detail) =>
        sum + detail.sizeAndQuantity.reduce((q, s) => q + s.quantity, 0),
      0,
    );
  };

  // Calculate savings percentage
  const calculateSavingsPercentage = (mrp, discountedPrice) => {
    if (!mrp || !discountedPrice || mrp <= 0) return 0;
    return Math.round(((mrp - discountedPrice) / mrp) * 100);
  };

  // Handle order again navigation
  const handleOrderAgain = () => {
    if (order.orderProductDetails.length > 0) {
      navigation.navigate('PartnerProductDetail', {
        itemId: order.orderProductDetails[0].itemId._id || order.orderProductDetails[0].itemId,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#FFF"
        barStyle="dark-content"
        translucent={false}
      />
      <SafeAreaView style={{backgroundColor: '#FFF', flex: 0}}>
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: scale(16),
              paddingVertical: scale(14),
            },
          ]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={scale(22)} color="#000" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {marginLeft: scale(8)}]}>
            ORDER TRACKING
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Confirmation */}
        <View
          style={[
            styles.section,
            order.orderStatus === 'In transit' && styles.inTransitSection,
          ]}>
          <Text style={styles.statusTitle}>
            {order.orderStatus === 'Processing'
              ? '⚙️ Processing'
              : order.orderStatus === 'Confirmed'
              ? '✅ Order Confirmed'
              : order.orderStatus === 'Ready for Dispatch'
              ? '📋 Ready for Dispatch'
              : order.orderStatus === 'In transit'
              ? '🚚 In Transit'
              : order.orderStatus === 'Dispatched'
              ? '🚚 Dispatched'
              : order.orderStatus === 'Delivered'
              ? '📦 Delivered'
              : order.orderStatus === 'Order Returned'
              ? '🔄 Return in Progress'
              : '❓ Unknown Status'}
          </Text>
          <Text style={styles.statusDesc}>
            {order.orderStatus === 'Processing' &&
              'Your order is currently being processed.'}
            {order.orderStatus === 'Confirmed' &&
              'Your order has been confirmed by our team.'}
            {order.orderStatus === 'Ready for Dispatch' &&
              'Your order is ready for dispatch and will be shipped soon.'}
            {order.orderStatus === 'In transit' &&
              'Your order is on its way to the delivery address.'}
            {order.orderStatus === 'Dispatched' &&
              'Your order has been dispatched from our facility.'}
            {order.orderStatus === 'Delivered' &&
              'Your order has been successfully delivered.'}
            {order.orderStatus === 'Order Returned' &&
              'A return request has been initiated. Awaiting pickup and processing.'}
          </Text>
          <Text style={styles.orderId}>Order ID: {order.orderId}</Text>
        </View>

        {/* Return Details (if applicable) */}
        {isReturnInProgress && (
          <View style={styles.section}>
            <Text style={styles.subTitle}>Return Details</Text>
            <View style={styles.returnInfo}>
              <Text style={styles.returnText}>
                Return Status: {order.returnInfo?.refundStatus || 'N/A'}
              </Text>
              <Text style={styles.returnText}>
                Reason: {order.returnInfo?.reason || 'N/A'}
              </Text>
              <Text style={styles.returnText}>
                Requested: {formatDate(order.returnInfo?.requestDate)}
              </Text>
              <Text style={styles.returnText}>
                Refund Amount: ₹
                {order.returnInfo?.refundAmount?.toFixed(2) || 'N/A'}
              </Text>
              {order.returnInfo?.pickupLocation && (
                <Text style={styles.returnText}>
                  Pickup Address: {order.returnInfo.pickupLocation.name},{' '}
                  {order.returnInfo.pickupLocation.addressLine1},{' '}
                  {order.returnInfo.pickupLocation.cityTown},{' '}
                  {order.returnInfo.pickupLocation.state},{' '}
                  {order.returnInfo.pickupLocation.pincode}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() =>
                navigation.navigate('PartnerReturnOrderScreen', {
                  orderId,
                  returnType: 'refund',
                })
              }>
              <Text style={styles.viewDetailsText}>View Return Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order Details */}
        <View style={styles.subSection}>
          <Text style={[styles.subTitle, styles.beigeTitle]}>
            Order Details
          </Text>
          {order.orderProductDetails.slice(0, isExpanded ? undefined : 1).map((item, index) => (
            <View key={index} style={styles.orderCard}>
              <Image
                source={
                  item.itemId.image
                    ? {uri: item.itemId.image}
                    : {uri: 'https://via.placeholder.com/90'}
                }
                style={styles.productImg}
              />
              <View style={styles.productInfo}>
                <Text style={styles.name}>
                  {item.itemId.name || 'Unknown Item'}
                </Text>
                {item.orderDetails.map((detail, idx) => (
                  <Text key={idx} style={styles.detail}>
                    Color: {detail.color} | Size:{' '}
                    {detail.sizeAndQuantity.map(s => s.size).join(', ')}
                  </Text>
                ))}
                <Text style={styles.detail}>
                  Qty: {getItemTotalQuantity(item)}
                </Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>MRP </Text>
                  <Text style={styles.strike}>₹{item.itemId.MRP}</Text>
                  <Text style={styles.discountedPrice}>
                    {' '}
                    ₹{item.itemId.discountedPrice}
                  </Text>
                  <Text style={styles.savingsText}>
                    {calculateSavingsPercentage(
                      item.itemId.MRP,
                      item.itemId.discountedPrice,
                    )}
                    % OFF
                  </Text>
                </View>
                <Text style={styles.placed}>
                  Placed on {formatDate(order.createdAt)}
                </Text>
              </View>
            </View>
          ))}
          {order.orderProductDetails.length > 1 && (
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() => setIsExpanded(!isExpanded)}>
              <Text style={styles.viewMoreText}>
                {isExpanded ? 'VIEW LESS' : 'VIEW MORE'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Other Items */}
        {order.orderProductDetails.length > 1 && !isExpanded && (
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>Other Items in This Order</Text>
            {order.orderProductDetails.slice(1).map((item, index) => (
              <View key={index} style={styles.otherItem}>
                <Image
                  source={
                    item.itemId.image
                      ? {uri: item.itemId.image}
                      : {uri: 'https://via.placeholder.com/50'}
                  }
                  style={styles.otherImg}
                />
                <Text style={styles.otherName}>
                  {item.itemId.name || 'Unknown Item'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Help / Invoice */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleDownloadInvoice}>
            <Text style={styles.download}>Download Invoice ⬇️</Text>
          </TouchableOpacity>
        </View>

        {/* Order Status */}
        <View style={styles.subSection}>
          <Text style={[styles.subTitle, styles.beigeTitle]}>Order Status</Text>
          <View style={styles.timelineContainer}>
            {statusSteps.map((step, index) => (
              <View key={index} style={styles.timelineStep}>
                <View style={styles.timelineIconContainer}>
                  <View style={styles.timelineIcon}>
                    <View
                      style={[
                        styles.iconBackground,
                        step.completed
                          ? styles.iconBackgroundCompleted
                          : styles.iconBackgroundPending,
                      ]}
                    />
                    <View
                      style={[
                        styles.iconForeground,
                        step.completed
                          ? styles.iconForegroundCompleted
                          : styles.iconForegroundPending,
                      ]}
                    />
                  </View>
                  {index < statusSteps.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        step.completed && statusSteps[index + 1].completed
                          ? styles.timelineLineCompleted
                          : styles.timelineLinePending,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.stepLabel,
                      step.completed
                        ? styles.stepLabelCompleted
                        : styles.stepLabelPending,
                    ]}>
                    {step.label}
                  </Text>
                  {step.date && step.completed && (
                    <Text style={styles.stepDate}>{formatDate(step.date)}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        {order.orderStatus === 'Delivered' && (
          <TouchableOpacity
            style={styles.returnButton}
            onPress={() =>
              navigation.navigate('PartnerReturnOrderScreen', {
                orderId,
              })
            }>
            <Text style={styles.returnButtonText}>RETURN ORDER</Text>
          </TouchableOpacity>
        )}

        {/* Delivery Address */}
          <View style={styles.subSection}>
            <Text style={[styles.subTitle, styles.beigeTitle]}>
              Delivery Address
            </Text>
            {order.shippingAddress ? (
              <View>
                <Text style={styles.addressName}>
                  {order.shippingAddress.name || 'Unknown'}
                </Text>
                <Text style={styles.address}>
                  {order.shippingAddress.addressLine1 || ''},{' '}
                  {order.shippingAddress.addressLine2 || ''},{' '}
                  {order.shippingAddress.cityTown || 'N/A'},{' '}
                  {order.shippingAddress.state || 'N/A'},{' '}
                  {order.shippingAddress.pincode || 'N/A'}
                </Text>
              </View>
            ) : (
              <Text style={styles.address}>No delivery address available.</Text>
            )}
          </View>

        {/* Bill Summary */}
        <View style={styles.subSection}>
          <Text style={[styles.subTitle, styles.beigeTitle]}>
            TOTAL BILL SUMMARY ({order.orderProductDetails.length} items)
          </Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Cart Total Price</Text>
            <Text style={styles.billValue}>
              ₹
              {order.invoice.find(entry => entry.key === 'carttotal')?.values ||
                '0.00'}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Discounted Price</Text>
            <Text style={styles.billValue}>
              ₹
              {order.invoice.find(entry => entry.key === 'discountedprice')
                ?.values || '0.00'}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Wallet Money</Text>
            <Text style={styles.billValue}>
              -₹
              {order.invoice.find(entry => entry.key === 'walletmoney')
                ?.values || '0.00'}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.couponLabel}>COUPON DISCOUNT</Text>
            <Text style={styles.couponValue}>
              -₹
              {order.invoice.find(entry => entry.key === 'coupondiscount')
                ?.values || '0.00'}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>COD CHARGES</Text>
            <Text style={styles.billValue}>
              ₹
              {order.invoice.find(entry => entry.key === 'codcharges')
                ?.values || '0.00'}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>GST</Text>
            <Text style={styles.billValue}>
              ₹
              {order.invoice.find(entry => entry.key === 'gst')?.values ||
                '0.00'}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Shipping Charges</Text>
            <Text style={styles.billValue}>
              {parseFloat(
                order.invoice.find(entry => entry.key === 'shippingcharges')
                  ?.values || 0,
              ) === 0
                ? 'FREE'
                : `₹${
                    order.invoice.find(entry => entry.key === 'shippingcharges')
                      ?.values || '0.00'
                  }`}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              ₹{parseFloat(order.totalAmount).toFixed(2)}
            </Text>
          </View>
          <Text style={styles.savings}>
            HOORAY! YOU ARE SAVING ₹
            {order.invoice.find(entry => entry.key === 'savings')?.values ||
              '0.00'}
            /- WITH THIS ORDER!
          </Text>
          <TouchableOpacity style={styles.orderAgainButton} onPress={handleOrderAgain}>
            <Text style={styles.orderAgainText}>ORDER AGAIN</Text>
          </TouchableOpacity>
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.payment}>
            Payment Method:{' '}
            <Text style={styles.bold}>
              {order.isOnlinePayment
                ? 'Online'
                : order.isCodPayment
                ? 'Cash on Delivery'
                : order.isChequePayment
                ? 'Cheque'
                : order.isWalletPayment
                ? 'Wallet'
                : 'Unknown'}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'left',
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 10,
    marginBottom: 10,
  },
  inTransitSection: {
    backgroundColor: '#FFF8F0',
  },
  subSection: {
    backgroundColor: '#FFF',
    padding: 10,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textTransform: 'uppercase',
    backgroundColor: 'transparent',
    padding: 0,
  },
  beigeTitle: {
    backgroundColor: '#FFF8F0',
    padding: 5,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D6722F',
  },
  statusDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    lineHeight: 18,
  },
  orderId: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
    fontWeight: '500',
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 0,
    padding: 10,
    marginBottom: 10,
    borderWidth: 0,
  },
  productImg: {
    width: 60,
    height: 60,
    borderRadius: 0,
    backgroundColor: '#F0F0F0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  detail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
  },
  strike: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginHorizontal: 4,
  },
  discountedPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D6722F',
    marginHorizontal: 4,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2ECC71',
    marginLeft: 4,
  },
  placed: {
    fontSize: 12,
    color: '#666',
  },
  viewMoreButton: {
    borderWidth: 1,
    borderColor: '#D6722F',
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewMoreText: {
    color: '#D6722F',
    fontSize: 12,
    fontWeight: '600',
  },
  otherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0,
  },
  otherImg: {
    width: 40,
    height: 40,
    borderRadius: 0,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
  otherName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  download: {
    color: '#D6722F',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  timelineContainer: {
    marginVertical: 5,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  timelineIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  iconBackground: {
    width: 20,
    height: 20,
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 0,
  },
  iconBackgroundCompleted: {
    backgroundColor: 'rgba(217, 119, 6, 0.3)',
  },
  iconBackgroundPending: {
    backgroundColor: 'rgba(120, 113, 108, 0.3)',
  },
  iconForeground: {
    width: 12,
    height: 12,
    position: 'absolute',
    left: 4,
    top: 4,
    borderRadius: 0,
  },
  iconForegroundCompleted: {
    backgroundColor: '#D97706',
  },
  iconForegroundPending: {
    backgroundColor: '#78716C',
  },
  timelineLine: {
    width: 2,
    height: 30,
    position: 'absolute',
    top: 20,
    left: 9,
  },
  timelineLineCompleted: {
    backgroundColor: '#D6722F',
  },
  timelineLinePending: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#999',
  },
  timelineContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: '#D6722F',
  },
  stepLabelPending: {
    color: '#999',
  },
  stepDate: {
    fontSize: 10,
    color: '#D6722F',
    marginTop: 2,
  },
  returnButton: {
    alignItems: 'center',
    marginVertical: 10,
  },
  returnButtonText: {
    color: '#D6722F',
    fontSize: 14,
    fontWeight: '600',
  },
  addressName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  address: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  billLabel: {
    fontSize: 12,
    color: '#333',
  },
  couponLabel: {
    fontSize: 12,
    color: '#D6722F',
  },
  billValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  couponValue: {
    fontSize: 12,
    color: '#D6722F',
    fontWeight: '500',
  },
  divider: {
    height: 0,
  },
  totalRow: {
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  savings: {
    fontSize: 12,
    color: '#D6722F',
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'left',
  },
  orderAgainButton: {
    backgroundColor: '#D6722F',
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  orderAgainText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  payment: {
    fontSize: 12,
    color: '#333',
  },
  bold: {
    fontWeight: '600',
    color: '#D6722F',
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
    fontSize: 14,
    color: '#E74C3C',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#D6722F',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 0,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  returnInfo: {
    padding: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 0,
    marginTop: 5,
  },
  returnText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  viewDetailsButton: {
    borderWidth: 1,
    borderColor: '#D6722F',
    borderRadius: 0,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  viewDetailsText: {
    color: '#D6722F',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TrackOrderScreen;