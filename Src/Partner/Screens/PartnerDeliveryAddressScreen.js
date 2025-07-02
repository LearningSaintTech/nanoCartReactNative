import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

const PartnerDeliveryAddressScreen = ({ navigation, route }) => {
  const token = useSelector((state) => state.auth.token);
  const [address, setAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [invoiceData, setInvoiceData] = useState({
    cartTotal: '0.00',
    discountedPrice: '0.00',
    walletMoney: '0.00',
    couponDiscount: '0.00',
    codCharges: '0.00',
    gst: '0.0',
    shippingCharges: 'FREE',
    totalAmount: '0.0',
    savings: '0.00',
  });

  // Extract navigation params
  const {
    totalItems = 0,
    cartItems = [],
    appliedWalletAmount = 0,
    couponDiscount = 0,
    invoiceData: passedInvoiceData = {},
  } = route.params || {};

  // Set initial invoiceData with passed values
  useEffect(() => {
    setInvoiceData((prev) => ({ ...prev, ...passedInvoiceData }));
  }, [passedInvoiceData]);

  // Calculation functions (aligned with PartnerCartScreen)
  const calculateTotalQty = (orderDetails) =>
    orderDetails.reduce(
      (total, colorObj) =>
        total + colorObj.sizeAndQuantity.reduce((sum, s) => sum + s.quantity, 0),
      0
    );

  const calculateTotalPrice = (orderDetails, pricePerUnit) =>
    calculateTotalQty(orderDetails) * pricePerUnit;

  // Calculate cartTotal and discountedPrice
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + calculateTotalQty(item.orderDetails) * item.itemId.MRP,
    0
  );
  const discountedPrice = cartItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  useEffect(() => {
    const fetchAddress = async () => {
      if (!token) {
        console.warn('No token available, skipping fetchAddress');
        setLoadingAddress(false);
        return;
      }
      try {
        console.log('Fetching address with token:', token);
        const response = await fetch('http://192.168.1.17:4000/api/partner/address', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await response.json();
        console.log('Address API response:', JSON.stringify(json, null, 2));
        if (response.ok && json.addresses?.addressDetail?.length > 0) {
          const defaultAddress = json.addresses.addressDetail.find((a) => a.isDefault) || json.addresses.addressDetail[0];
          setAddress(defaultAddress);
        } else {
          console.warn('No addresses found');
          Alert.alert('No Address', 'Please add an address to proceed.');
        }
      } catch (err) {
        console.error('Error fetching address:', err.message);
        Alert.alert('Error', 'Failed to load address. Please try again.');
      } finally {
        setLoadingAddress(false);
      }
    };

    const fetchInvoiceData = async () => {
      if (!token) {
        console.warn('No token available, skipping fetchInvoiceData');
        return;
      }
      try {
        console.log('Fetching invoice data...');
        const res = await fetch('http://192.168.1.17:4000/api/invoice', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        console.log('Invoice API response:', JSON.stringify(json, null, 2));

        if (res.ok && json.success && Array.isArray(json.data) && json.data[0]?.invoice) {
          const invoice = json.data[0].invoice;
          const getLatestValue = (key) => {
            const items = invoice.filter((item) => item.key.toLowerCase() === key.toLowerCase());
            return items.length > 0 ? parseFloat(items[items.length - 1].value) || 0 : 0;
          };

          const walletMoney = getLatestValue('wallet money') || appliedWalletAmount;
          const couponDiscountValue = getLatestValue('coupon discount') || couponDiscount;
          const codCharges = getLatestValue('cod charges') || 0;
          const gstValue = getLatestValue('gst') || 0;
          const shippingCharges = getLatestValue('shipping charges') || getLatestValue('shipping charge') || 0;
          const totalAmount = discountedPrice - walletMoney - couponDiscountValue + codCharges + gstValue;
          const savings = (cartTotal - discountedPrice) + couponDiscountValue + walletMoney;

          setInvoiceData({
            cartTotal: cartTotal.toFixed(2),
            discountedPrice: discountedPrice.toFixed(2),
            walletMoney: walletMoney.toFixed(2),
            couponDiscount: couponDiscountValue.toFixed(2),
            codCharges: codCharges.toFixed(2),
            gst: gstValue.toFixed(1),
            shippingCharges: shippingCharges === 0 ? 'FREE' : `₹${shippingCharges.toFixed(2)}`,
            totalAmount: totalAmount.toFixed(1),
            savings: savings.toFixed(2),
          });
        } else {
          console.warn('Invalid invoice data, using computed values');
          const walletMoney = appliedWalletAmount;
          const couponDiscountValue = couponDiscount;
          const codCharges = 0;
          const gstValue = 0;
          const shippingCharges = 0;
          const totalAmount = discountedPrice - walletMoney - couponDiscountValue + codCharges + gstValue;
          const savings = (cartTotal - discountedPrice) + couponDiscountValue + walletMoney;

          setInvoiceData({
            cartTotal: cartTotal.toFixed(2),
            discountedPrice: discountedPrice.toFixed(2),
            walletMoney: walletMoney.toFixed(2),
            couponDiscount: couponDiscountValue.toFixed(2),
            codCharges: codCharges.toFixed(2),
            gst: gstValue.toFixed(1),
            shippingCharges: shippingCharges === 0 ? 'FREE' : `₹${shippingCharges.toFixed(2)}`,
            totalAmount: totalAmount.toFixed(1),
            savings: savings.toFixed(2),
          });
        }
      } catch (err) {
        console.error('Error fetching invoice:', err.message);
        const walletMoney = appliedWalletAmount;
        const couponDiscountValue = couponDiscount;
        const codCharges = 0;
        const gstValue = 0;
        const shippingCharges = 0;
        const totalAmount = discountedPrice - walletMoney - couponDiscountValue + codCharges + gstValue;
        const savings = (cartTotal - discountedPrice) + couponDiscountValue + walletMoney;

        setInvoiceData({
          cartTotal: cartTotal.toFixed(2),
          discountedPrice: discountedPrice.toFixed(2),
          walletMoney: walletMoney.toFixed(2),
          couponDiscount: couponDiscountValue.toFixed(2),
          codCharges: codCharges.toFixed(2),
          gst: gstValue.toFixed(1),
          shippingCharges: shippingCharges === 0 ? 'FREE' : `₹${shippingCharges.toFixed(2)}`,
          totalAmount: totalAmount.toFixed(1),
          savings: savings.toFixed(2),
        });
      }
    };

    fetchAddress();
    fetchInvoiceData();
  }, [token, cartItems, appliedWalletAmount, couponDiscount]);

  const handleContinue = () => {
    if (!address && !loadingAddress) {
      Alert.alert('Error', 'Please add an address to proceed.');
      return;
    }
    navigation.navigate('PartnerPayment', {
      totalItems,
      cartItems,
      appliedWalletAmount,
      couponDiscount,
      invoiceData,
    });
  };

  // Validation checks for rendering
  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Authentication Required. Please log in.</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!totalItems || !Array.isArray(cartItems) || !cartItems.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Cart details are missing. Please return to the cart.</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('PartnerCart')}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>Back to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('PartnerHome')}>
          <Icon name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PARTNER DELIVERY ADDRESS</Text>
      </View>

      <View style={styles.stepRow}>
        <View style={styles.stepContainer}>
          <View style={[styles.square, styles.activeSquare]} />
          <Text style={styles.activeStep}>CART DETAILS</Text>
        </View>
        <View style={styles.dottedLine} />
        <View style={styles.stepContainer}>
          <View style={[styles.square, styles.activeSquare]} />
          <Text style={styles.activeStep}>ADDRESS</Text>
        </View>
        <View style={styles.dottedLine} />
        <View style={styles.stepContainer}>
          <View style={styles.square} />
          <Text style={styles.inactiveStep}>PAYMENT</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.deliverBox}>
          <View style={styles.stickyHeader}>
            <Text style={styles.deliverToLabel}>Deliver to:</Text>
            {address && (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('PartnerSavedAddress', {
                    isEdit: true,
                    addressId: address?._id,
                    address,
                  });
                }}
                style={styles.changeButton}
              >
                <Text style={styles.changeText}>CHANGE</Text>
              </TouchableOpacity>
            )}
          </View>
          {loadingAddress ? (
            <Text style={styles.deliverToName}>Loading...</Text>
          ) : address ? (
            <>
              <Text style={styles.deliverToName}>{address.name}</Text>
              <Text style={styles.deliverToAddress}>{`${address.cityTown}, ${address.pincode}`}</Text>
              <Text style={styles.deliverToAddress}>{address.state}</Text>
            </>
          ) : (
            <Text style={styles.deliverToName}>No address available</Text>
          )}
        </View>

        {!address && !loadingAddress && (
          <TouchableOpacity
            onPress={() => navigation.navigate('PartnerAddNewAddress')}
            style={styles.addAddressBtn}
          >
            <Text style={styles.addAddressText}>ADD ADDRESS</Text>
          </TouchableOpacity>
        )}

        <View style={styles.card}>
          <View style={styles.priceDetailsHeader}>
            <Text style={styles.cardTitle}>Price Details ({totalItems} items)</Text>
          </View>
          <View style={styles.priceDetailsContent}>
            <View style={styles.row}>
              <Text style={styles.label}>Cart Total</Text>
              <Text style={styles.strike}>₹{invoiceData.cartTotal}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Discounted Price</Text>
              <Text style={styles.value}>₹{invoiceData.discountedPrice}</Text>
            </View>
            {parseFloat(invoiceData.walletMoney) > 0 && (
              <View style={styles.row}>
                <Text style={styles.orangeText}>Wallet Money</Text>
                <Text style={styles.orangeText}>-₹{invoiceData.walletMoney}</Text>
              </View>
            )}
            {parseFloat(invoiceData.couponDiscount) > 0 && (
              <View style={styles.row}>
                <Text style={styles.orangeText}>Coupon Discount</Text>
                <Text style={styles.orangeText}>-₹{invoiceData.couponDiscount}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>COD Charges</Text>
              <Text style={styles.value}>₹{invoiceData.codCharges}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>GST</Text>
              <Text style={styles.value}>₹{invoiceData.gst}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Shipping Charges</Text>
              <Text style={styles.orangeText}>{invoiceData.shippingCharges}</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{invoiceData.totalAmount}</Text>
            </View>
            <View style={styles.savingBox}>
              <Text style={styles.savingText}>
                {parseFloat(invoiceData.savings) > 0
                  ? `Hooray! You are saving ₹${invoiceData.savings}/- with this order!`
                  : 'No additional savings applied.'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.paymentMethod}>
          <Text style={styles.paymentText}>Payment Method</Text>
          <Text style={styles.paymentMode}>UPI</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
        <Text style={styles.continueText}>CONTINUE TO PAYMENT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  errorText: { fontSize: 16, color: '#ff0000', textAlign: 'center', marginTop: 20 },
  backBtn: {
    backgroundColor: '#f37022',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 4,
    marginHorizontal: 16,
    marginTop: 20,
  },
  backBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  header: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', marginLeft: 10, color: '#333' },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  stepContainer: { alignItems: 'center', flexDirection: 'row' },
  square: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: '#666',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  activeSquare: { borderColor: '#D6722F', backgroundColor: '#D6722F' },
  dottedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#666',
    marginHorizontal: 4,
  },
  activeStep: { color: '#D6722F', fontWeight: 'bold', fontSize: 11 },
  inactiveStep: { color: '#666', fontWeight: 'bold', fontSize: 11 },
  content: { paddingHorizontal: 16, paddingBottom: 80 },
  deliverBox: {
    backgroundColor: '#FDF6F1',
    padding: 15,
    borderRadius: 6,
    marginBottom: 16,
  },
  stickyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  deliverToLabel: { color: '#000', fontWeight: '600', fontSize: 14 },
  deliverToName: { fontSize: 14, fontWeight: '600', color: '#000' },
  deliverToAddress: { fontSize: 12, color: '#666' },
  changeButton: {
    backgroundColor: '#f37022',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  changeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  addAddressBtn: {
    backgroundColor: '#f37022',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 16,
  },
  addAddressText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  card: {
    marginHorizontal: 12,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FDF6F1',
  },
  priceDetailsHeader: { padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  priceDetailsContent: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 14, color: '#333' },
  value: { fontSize: 14, color: '#333' },
  strike: { fontSize: 14, color: '#333', textDecorationLine: 'line-through' },
  orangeText: { fontSize: 14, color: '#F36F25' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  totalValue: { fontSize: 15, fontWeight: '600', color: '#333' },
  savingBox: { padding: 12, borderRadius: 4, marginTop: 12 },
  savingText: { fontSize: 14, color: '#333', textAlign: 'center' },
  paymentMethod: {
    backgroundColor: '#FDF6F1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 4,
    marginTop: 10,
  },
  paymentText: { fontWeight: '500', fontSize: 14, color: '#333' },
  paymentMode: { fontSize: 14, fontWeight: '600', color: '#333' },
  continueBtn: {
    backgroundColor: '#f37022',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 8,
  },
  continueText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});

export default PartnerDeliveryAddressScreen;