import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

const PaymentScreen = ({ navigation }) => {
  const token = useSelector((state) => state.auth.token);
  const cartItems = useSelector((state) => state.cart.items);
  const [address, setAddress] = useState(null);
  const [invoice, setInvoice] = useState([]);
  const [invoiceData, setInvoiceData] = useState({
    gst: '0%',
    coupon_discount: '₹0',
    shipping_charge: '₹0',
    total_amount: '₹0',
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI');
  const [isCODSelected, setIsCODSelected] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [razorpayModalVisible, setRazorpayModalVisible] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalMRP = cartItems.reduce((total, item) => total + (item.itemId.MRP * item.quantity), 0);
  const discountedTotal = cartItems.reduce((total, item) => total + (item.itemId.discountedPrice * item.quantity), 0);

  const totalAmount = React.useMemo(() => {
    const gstPercentage = parseFloat(invoiceData.gst.replace('%', '')) || 0;
    const couponDiscount = parseFloat(invoiceData.coupon_discount.replace('₹', '')) || 0;
    const shippingCharge = parseFloat(invoiceData.shipping_charge.replace('₹', '')) || 0;
    const codCharge = isCODSelected
      ? parseFloat(invoice.find((item) => item.key === 'cod charges')?.value || '0')
      : 0;
    const gstAmount = discountedTotal * (gstPercentage / 100);
    return (discountedTotal + gstAmount + shippingCharge + codCharge - couponDiscount).toFixed(2);
  }, [discountedTotal, invoiceData, invoice, isCODSelected]);

  const savings = cartTotalMRP - discountedTotal - parseFloat(invoiceData.coupon_discount.replace('₹', ''));

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await fetch('http://192.168.1.20 :4000/api/user/address', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await response.json();
        if (response.ok && json.addresses?.addressDetail?.length > 0) {
          const defaultAddress = json.addresses.addressDetail.find((a) => a.isDefault) || json.addresses.addressDetail[0];
          setAddress(defaultAddress);
        } else {
          console.warn('No addresses found:', json);
        }
      } catch (err) {
        console.error('Error fetching address:', err);
      }
    };

    if (token) fetchAddress();
  }, [token]);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const res = await fetch('http://192.168.1.20 :4000/api/invoice', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        console.log('Raw Invoice Response:', JSON.stringify(json, null, 2));
        if (res.ok && json.success) {
          const invoice = json.data[0].invoice;
          setInvoice(invoice);
          // Pick the latest value for each key
          const getLatestValue = (key) => {
            const items = invoice.filter((item) => item.key === key);
            return items.length > 0 ? items[items.length - 1].value : 0;
          };

          const gstValue = getLatestValue('gst'); // e.g., 4 (%)
          const couponDiscount = getLatestValue('coupon discount'); // e.g., 5 (₹)
          const shippingCharge = getLatestValue('shipping charges') || getLatestValue('shipping charge'); // e.g., 3 (₹)

          setInvoiceData({
            gst: `${gstValue}%`,
            coupon_discount: `₹${couponDiscount.toFixed(2)}`,
            shipping_charge: shippingCharge === 0 ? '₹0' : `₹${shippingCharge.toFixed(2)}`,
            total_amount: `₹${totalAmount}`,
          });
        } else {
          console.warn('Failed to fetch invoice:', json.message);
        }
      } catch (err) {
        console.error('Error fetching invoice:', err.message);
      }
    };

    if (token) fetchInvoiceData();
  }, [token, totalAmount]);

  const createOrder = async () => {
    try {
      const orderDetails = cartItems.map((item) => ({
        itemId: item.itemId._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        skuId: item.skuId,
      }));

      const transformedInvoice = invoice.map((item) => ({
        key: item.key,
        value:(item.value), // Changed from item.values to item.value
        _id: item._id,
      }));

      const shippingAddressId = address?._id;
      const paymentMethod = isCODSelected ? 'COD' : selectedPaymentMethod;

      console.log('=== createOrder Payload Parameters ===');
      console.log('orderDetails:', JSON.stringify(orderDetails, null, 2));
      console.log('transformedInvoice:', JSON.stringify(transformedInvoice, null, 2));
      console.log('shippingAddressId:', shippingAddressId);
      console.log('paymentMethod:', paymentMethod);
      console.log('totalAmount:', totalAmount);
      console.log('token:', token);

      if (!orderDetails.length) {
        throw new Error('No items in cart.');
      }
      if (!transformedInvoice.length) {
        throw new Error('Invoice data is missing.');
      }
      if (!shippingAddressId) {
        throw new Error('Shipping address is missing.');
      }
      if (isNaN(totalAmount) || totalAmount <= 0) {
        throw new Error('Total amount is invalid or zero.');
      }

      const payload = {
        orderDetails,
        invoice: transformedInvoice,
        shippingAddressId,
        paymentMethod,
        totalAmount: parseFloat(totalAmount),
      };

      console.log('Full Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch('http://192.168.1.20 :4000/api/user/order/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);

      const data = await response.json();
      console.log('Response Data:', JSON.stringify(data, null, 2));

      if (response.ok) {
        return { success: true, data };
      } else {
        console.error('Failed to create order:', data.message || data.success);
        return { success: false, message: data.message || 'Failed to create order' };
      }
    } catch (error) {
      console.error('Error creating order:', error.message);
      return { success: false, message: 'Error creating order: ' + error.message };
    }
  };

  const handleContinuePayment = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Add items to proceed.');
      return;
    }

    if (!address) {
      alert('Please select a delivery address.');
      return;
    }

    if (isCODSelected) {
      const orderResult = await createOrder();
      if (orderResult.success) {
        navigation.navigate('OrderConfirmation', { orderData: orderResult.data });
      } else {
        alert(orderResult.message || 'Failed to create order');
      }
    } else {
      setRazorpayModalVisible(true);
    }
  };

  const handleRazorpayPayment = async () => {
    setPaymentStatus('processing');

    // Mock Razorpay payment (since actual module is commented out)
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag', // Razorpay test key
      amount: parseFloat(totalAmount) * 100, // Convert to paise
      currency: 'INR',
      name: 'Demo App',
      description: 'Order Payment',
      prefill: {
        name: address?.name || 'John Doe',
        email: 'johndoe@example.com',
        contact: address?.contact || '9876543210',
      },
      theme: { color: '#f37022' },
    };

    console.log('Razorpay Options:', options);

    // Simulate payment (replace with actual RazorpayCheckout.open when integrated)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const paymentSuccess = Math.random() > 0.5;

    if (paymentSuccess) {
      setPaymentStatus('success');
      const orderResult = await createOrder();
      if (orderResult.success) {
        setTimeout(() => {
          setRazorpayModalVisible(false);
          navigation.navigate('OrderConfirmation', { orderData: orderResult.data });
        }, 1500);
      } else {
        setPaymentStatus('failed');
        alert(orderResult.message || 'Failed to create order after payment');
      }
    } else {
      setPaymentStatus('failed');
    }
  };

  const toggleAccordion = () => {
    setAccordionOpen(!accordionOpen);
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    if (method === 'COD') {
      setIsCODSelected(true);
    } else {
      setIsCODSelected(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Delivery')}>
          <Icon name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PAYMENT</Text>
      </View>

      <View style={styles.stepIndicator}>
        <Text style={styles.stepActive}>■ CART DETAILS</Text>
        <Text style={styles.stepActive}>■ ADDRESS</Text>
        <Text style={styles.stepActive}>■ PAYMENT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.deliverBox}>
          <View style={styles.deliverRow}>
            <Text style={styles.deliverToLabel}>Deliver to:</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Delivery')}
              style={styles.changeButton}>
              <Text style={styles.changeText}>CHANGE</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.deliverToName}>{address?.name || 'Loading...'}</Text>
          <Text style={styles.deliverToAddress}>{address ? `${address.cityTown}, ${address.pincode}` : ''}</Text>
          <Text style={styles.deliverToAddress}>{address?.state}</Text>
        </View>

        <TouchableOpacity onPress={toggleAccordion} style={styles.accordionHeader}>
          <Text style={styles.accordionTitle}>Payment Options</Text>
          <Icon name={accordionOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#000" />
        </TouchableOpacity>

        {accordionOpen && (
          <View style={styles.accordionContent}>
            {!isCODSelected && (
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === 'UPI' && styles.selectedOption,
                ]}
                onPress={() => handlePaymentMethodSelect('UPI')}>
                <Text style={styles.optionText}>UPI</Text>
                {selectedPaymentMethod === 'UPI' && (
                  <Icon name="checkmark-circle" size={20} color="#f37022" />
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'Card' && styles.selectedOption,
              ]}
              onPress={() => handlePaymentMethodSelect('Card')}>
              <Text style={styles.optionText}>Credit/Debit Card</Text>
              {selectedPaymentMethod === 'Card' && (
                <Icon name="checkmark-circle" size={20} color="#f37022" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'NetBanking' && styles.selectedOption,
              ]}
              onPress={() => handlePaymentMethodSelect('NetBanking')}>
              <Text style={styles.optionText}>Net Banking</Text>
              {selectedPaymentMethod === 'NetBanking' && (
                <Icon name="checkmark-circle" size={20} color="#f37022" />
              )}
            </TouchableOpacity>

            <View style={styles.paymentOption}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handlePaymentMethodSelect('COD')}>
                <View style={[styles.checkbox, isCODSelected && styles.checkboxSelected]}>
                  {isCODSelected && <Icon name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.optionText}>Cash on Delivery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {cartItems.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Price Details ({totalCartCount} items)</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Cart Total</Text>
              <Text style={styles.strike}>₹{cartTotalMRP.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Discounted Price</Text>
              <Text style={styles.value}>₹{discountedTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.discount}>Coupon Discount</Text>
              <Text style={styles.discount}>- {invoiceData.coupon_discount}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>GST ({invoiceData.gst})</Text>
              <Text style={styles.value}>₹{(discountedTotal * (parseFloat(invoiceData.gst.replace('%', '')) / 100)).toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Shipping Charges</Text>
              <Text style={styles.free}>{invoiceData.shipping_charge === '₹0' ? 'FREE' : invoiceData.shipping_charge}</Text>
            </View>
            {isCODSelected && (
              <View style={styles.row}>
                <Text style={styles.label}>COD Charges</Text>
                <Text style={styles.value}>₹{(invoice.find((item) => item.key === 'cod charges')?.value || 0).toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{totalAmount}</Text>
            </View>
            <View style={styles.savingBox}>
              <Text style={styles.savingText}>
                Hooray! You are saving <Text style={styles.highlight}>₹{savings.toFixed(2)}/-</Text> with this order!
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCartMessage}>
            <Text style={styles.emptyCartText}>Your cart is empty. Add items to proceed.</Text>
          </View>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinuePayment}>
          <Text style={styles.continueText}>CONTINUE PAYMENT</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={razorpayModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRazorpayModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Razorpay Payment Gateway</Text>
            <Text style={styles.modalSubtitle}>
              Amount: ₹{totalAmount}
            </Text>

            {paymentStatus === 'processing' ? (
              <View style={styles.paymentProcessing}>
                <ActivityIndicator size="large" color="#f37022" />
                <Text style={styles.paymentStatusText}>Processing Payment...</Text>
              </View>
            ) : paymentStatus === 'success' ? (
              <View style={styles.paymentSuccess}>
                <Icon name="checkmark-circle" size={50} color="green" />
                <Text style={styles.paymentStatusText}>Payment Successful!</Text>
              </View>
            ) : paymentStatus === 'failed' ? (
              <View style={styles.paymentFailed}>
                <Icon name="close-circle" size={50} color="red" />
                <Text style={styles.paymentStatusText}>Payment Failed!</Text>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={handleRazorpayPayment}>
                  <Text style={styles.retryBtnText}>Retry Payment</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.modalInfo}>Pay using {selectedPaymentMethod}</Text>
                <TouchableOpacity
                  style={styles.payNowBtn}
                  onPress={handleRazorpayPayment}>
                  <Text style={styles.payNowText}>Pay Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setRazorpayModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  stepActive: {
    color: '#f37022',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  deliverBox: {
    backgroundColor: '#fdf0e7',
    padding: 15,
    borderRadius: 6,
    marginBottom: 16,
  },
  deliverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  deliverToLabel: {
    color: '#000',
    fontWeight: '600',
  },
  deliverToName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  deliverToAddress: {
    fontSize: 12,
    color: '#666',
  },
  changeButton: {
    backgroundColor: '#f37022',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  changeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 16,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  accordionContent: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#f37022',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#f37022',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOption: {
    backgroundColor: '#fff5f0',
  },
  card: {
    backgroundColor: '#fff5f0',
    padding: 16,
    borderRadius: 6,
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#333',
  },
  value: {
    color: '#000',
  },
  strike: {
    color: '#aaa',
    textDecorationLine: 'line-through',
  },
  discount: {
    color: '#f37022',
  },
  free: {
    color: 'green',
    fontWeight: '600',
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalValue: {
    fontWeight: 'bold',
  },
  savingBox: {
    backgroundColor: '#fbeee6',
    padding: 10,
    borderRadius: 4,
    marginTop: 12,
  },
  savingText: {
    fontSize: 12,
    color: '#333',
  },
  highlight: {
    color: '#f37022',
    fontWeight: 'bold',
  },
  emptyCartMessage: {
    padding: 16,
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    color: '#666',
  },
  continueBtn: {
    backgroundColor: '#f37022',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  modalInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  payNowBtn: {
    backgroundColor: '#f37022',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 6,
    marginBottom: 10,
  },
  payNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    paddingVertical: 10,
  },
  cancelText: {
    color: '#f37022',
    fontSize: 14,
  },
  paymentProcessing: {
    alignItems: 'center',
  },
  paymentSuccess: {
    alignItems: 'center',
  },
  paymentFailed: {
    alignItems: 'center',
  },
  paymentStatusText: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#f37022',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});