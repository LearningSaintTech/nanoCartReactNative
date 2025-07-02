import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

const DeliveryAddressScreen = ({ navigation }) => {
  const token = useSelector(state => state.auth.token);
  const cartItems = useSelector(state => state.cart.items);
  const [address, setAddress] = useState(null);
  const [invoiceData, setInvoiceData] = useState({
    gst: '0%',
    coupon_discount: '₹0',
    shipping_charge: '₹0',
    total_amount: '₹0',
  });

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalMRP = cartItems.reduce((total, item) => total + (item.itemId.MRP * item.quantity), 0);
  const discountedTotal = cartItems.reduce((total, item) => total + (item.itemId.discountedPrice * item.quantity), 0);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await fetch('http://192.168.1.20 :4000/api/user/address', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await response.json();
        if (response.ok && json.addresses?.addressDetail?.length > 0) {
          const defaultAddress = json.addresses.addressDetail.find(a => a.isDefault)
            || json.addresses.addressDetail[0];
          setAddress(defaultAddress);
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

        if (res.ok && json.success) {
          const invoice = json.data[0].invoice;
          // Pick the latest value for each key
          const getLatestValue = (key) => {
            const items = invoice.filter(item => item.key === key);
            return items.length > 0 ? items[items.length - 1].value : 0;
          };

          const gstValue = getLatestValue('gst'); // e.g., 4 (%)
          const couponDiscount = getLatestValue('coupon discount'); // e.g., 5 (₹)
          const shippingCharge = getLatestValue('shipping charges') || getLatestValue('shipping charge'); // e.g., 3 (₹)
          const codCharges = getLatestValue('cod charges'); // e.g., 7 (₹)

          // Calculate total amount
          const gstAmount = (discountedTotal * (gstValue / 100)).toFixed(2);
          const totalAmount = (
            discountedTotal -
            couponDiscount +
            shippingCharge +
            codCharges +
            parseFloat(gstAmount)
          ).toFixed(2);

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
  }, [token, cartItems, discountedTotal]);

  const handleContinue = () => {
    navigation.navigate('Payment');
  };

  const savings = cartTotalMRP - discountedTotal - parseFloat(invoiceData.coupon_discount.replace('₹', ''));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DELIVERY ADDRESS</Text>
      </View>

      {/* Steps */}
      <View style={styles.stepIndicator}>
        <Text style={styles.stepActive}>■ CART DETAILS</Text>
        <Text style={styles.stepActive}>■ ADDRESS</Text>
        <Text style={styles.stepInactive}>■ PAYMENT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Address Logic */}
        {address ? (
          <View style={styles.deliverBox}>
            <View style={styles.deliverRow}>
              <Text style={styles.deliverToLabel}>Deliver to:</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Saved', {
                    isEdit: true,
                    addressId: address?._id,
                    address: address,
                  });
                }}
                style={styles.changeButton}
              >
                <Text style={styles.changeText}>CHANGE</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.deliverToName}>
              {address?.name}, {address?.cityTown}, {address?.pincode}
            </Text>
            <Text style={styles.deliverToAddress}>{address?.state}</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate('AddNewAddress')}
            style={styles.addAddressBtn}
          >
            <Text style={styles.addAddressText}>ADD ADDRESS</Text>
          </TouchableOpacity>
        )}

        {/* Price Details */}
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
              <Text style={styles.label}>GST</Text>
              <Text style={styles.value}>{invoiceData.gst}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Shipping Charges</Text>
              <Text style={styles.free}>
                {invoiceData.shipping_charge === '₹0' ? 'FREE' : invoiceData.shipping_charge}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{invoiceData.total_amount}</Text>
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

        {cartItems.length > 0 && (
          <View style={styles.paymentMethod}>
            <Text style={styles.paymentText}>Payment Method</Text>
            <Text style={styles.paymentMode}>UPI</Text>
          </View>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueText}>CONTINUE</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DeliveryAddressScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { marginTop: 20, fontSize: 16, fontWeight: '600', marginLeft: 10 },
  stepIndicator: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  stepActive: { color: '#f37022', fontWeight: 'bold', fontSize: 12 },
  stepInactive: { color: '#ccc', fontSize: 12 },
  content: { paddingHorizontal: 16, paddingBottom: 80 },
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
  deliverToLabel: { color: '#000', fontWeight: '600' },
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
  addAddressText: { color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: '#fff5f0',
    padding: 16,
    borderRadius: 6,
    marginBottom: 16,
  },
  cardTitle: { fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: '#333' },
  value: { color: '#000' },
  strike: { color: '#aaa', textDecorationLine: 'line-through' },
  discount: { color: '#f37022' },
  free: { color: 'green', fontWeight: '600' },
  totalLabel: { fontWeight: 'bold' },
  totalValue: { fontWeight: 'bold' },
  savingBox: {
    backgroundColor: '#fbeee6',
    padding: 10,
    borderRadius: 4,
    marginTop: 12,
  },
  savingText: { fontSize: 12, color: '#333' },
  highlight: { color: '#f37022', fontWeight: 'bold' },
  paymentMethod: {
    backgroundColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 4,
    marginTop: 10,
  },
  paymentText: { fontWeight: '500' },
  paymentMode: { fontWeight: '600' },
  continueBtn: {
    backgroundColor: '#f37022',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  emptyCartMessage: { padding: 16, alignItems: 'center' },
  emptyCartText: { fontSize: 16, color: '#666' },
});