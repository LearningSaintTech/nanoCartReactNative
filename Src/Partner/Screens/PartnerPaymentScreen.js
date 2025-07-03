import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'react-native-image-picker';

const PartnerPaymentScreen = ({ navigation, route }) => {
  const token = useSelector((state) => state.auth.token);
  const [address, setAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');
  const [isCODSelected, setIsCODSelected] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);
  const [chequeImage, setChequeImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const {
    totalItems = 0,
    cartItems = [],
    appliedWalletAmount = 0,
    couponDiscount = 0,
    invoiceData: passedInvoiceData = {
      cartTotal: '0.00',
      discountedPrice: '0.00',
      walletMoney: '0.00',
      couponDiscount: '0.00',
      codCharges: '0.00',
      gst: '0.0',
      shippingCharges: 'FREE',
      totalAmount: '0.0',
      savings: '0.00',
    },
  } = route.params || {};

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
    ...passedInvoiceData,
  });

  console.log('PartnerPaymentScreen params:', {
    totalItems,
    appliedWalletAmount,
    couponDiscount,
    cartItemsLength: cartItems.length,
    invoiceData,
    cartItems: JSON.stringify(cartItems, null, 2),
  });

  const calculateTotalQty = (orderDetails) =>
    orderDetails.reduce(
      (total, colorObj) =>
        total + colorObj.sizeAndQuantity.reduce((sum, s) => sum + s.quantity, 0),
      0
    );

  const cartTotal = cartItems.reduce((sum, item) => {
    if (!item.itemId?.MRP || !item.orderDetails) {
      console.warn('Invalid cart item:', item);
      return sum;
    }
    return sum + calculateTotalQty(item.orderDetails) * parseFloat(item.itemId.MRP);
  }, 0).toFixed(2);

  const discountedPrice = cartItems.reduce((sum, item) => {
    if (!item.totalPrice) {
      console.warn('Invalid cart item totalPrice:', item);
      return sum;
    }
    return sum + parseFloat(item.totalPrice);
  }, 0).toFixed(2);

  const totalAmount = React.useMemo(() => {
    const couponDiscountValue = parseFloat(couponDiscount || invoiceData.couponDiscount || '0.00');
    const walletAmount = parseFloat(appliedWalletAmount || invoiceData.walletMoney || '0.00');
    const shippingCharge =
      invoiceData.shippingCharges === 'FREE'
        ? 0
        : parseFloat(invoiceData.shippingCharges.replace('₹', '') || '0.00');
    const codCharge = isCODSelected ? parseFloat(invoiceData.codCharges || '0.00') : 0;
    const gstAmount = parseFloat(invoiceData.gst || '0.00');
    return (
      parseFloat(discountedPrice) -
      walletAmount -
      couponDiscountValue +
      gstAmount +
      shippingCharge +
      codCharge
    ).toFixed(2);
  }, [discountedPrice, invoiceData, isCODSelected, appliedWalletAmount, couponDiscount]);

  const savings = (
    parseFloat(cartTotal) -
    parseFloat(discountedPrice) +
    parseFloat(couponDiscount || invoiceData.couponDiscount || '0.00') +
    parseFloat(appliedWalletAmount || invoiceData.walletMoney || '0.00')
  ).toFixed(2);

  useEffect(() => {
    setInvoiceData((prev) => ({
      ...prev,
      cartTotal,
      discountedPrice,
      walletMoney: parseFloat(appliedWalletAmount || prev.walletMoney || '0.00').toFixed(2),
      couponDiscount: parseFloat(couponDiscount || prev.couponDiscount || '0.00').toFixed(2),
      codCharges: isCODSelected ? parseFloat(prev.codCharges || '0.00').toFixed(2) : '0.00',
      totalAmount,
      savings,
    }));
  }, [cartTotal, discountedPrice, isCODSelected, appliedWalletAmount, couponDiscount, totalAmount, savings]);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!token) {
        console.warn('No token available, skipping fetchAddress');
        return;
      }
      try {
        console.log('Fetching address with token:', token);
        const response = await fetch('${BASE_URL}/partner/address', {
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
      }
    };

    fetchAddress();
  }, [token]);

  const pickChequeImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to pick image. Please try again.');
      } else {
        const asset = response.assets[0];
        setChequeImage({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `cheque_${Date.now()}.jpg`,
        });
      }
    });
  };

  const createOrder = async () => {
    try {
      setIsLoading(true);

      if (!Array.isArray(cartItems) || !cartItems.length) {
        throw new Error('Cart is empty');
      }

      if (!address?._id) {
        throw new Error('Shipping address is required');
      }

      const orderProductDetails = cartItems.map((item) => {
        if (!item.itemId?._id || !item.totalPrice || !item.orderDetails) {
          throw new Error(`Invalid cart item: ${JSON.stringify(item)}`);
        }
        return {
          itemId: typeof item.itemId === 'string' ? item.itemId : item.itemId._id,
          orderDetails: item.orderDetails.map((detail) => ({
            color: detail.color,
            sizeAndQuantity: detail.sizeAndQuantity.map((sizeQty) => ({
              size: sizeQty.size,
              quantity: sizeQty.quantity,
              skuId: sizeQty.skuId,
            })),
          })),
          totalQuantity: calculateTotalQty(item.orderDetails),
          totalPrice: parseFloat(item.totalPrice),
        };
      });

      const transformedInvoice = [
        { key: 'cartTotal', values: cartTotal },
        { key: 'discountedPrice', values: discountedPrice },
        { key: 'walletMoney', values: parseFloat(appliedWalletAmount || invoiceData.walletMoney || '0.00').toFixed(2) },
        { key: 'couponDiscount', values: parseFloat(couponDiscount || invoiceData.couponDiscount || '0.00').toFixed(2) },
        { key: 'codCharges', values: isCODSelected ? parseFloat(invoiceData.codCharges || '0.00').toFixed(2) : '0.00' },
        { key: 'gst', values: parseFloat(invoiceData.gst || '0.00').toFixed(2) },
        { key: 'shippingCharges', values: invoiceData.shippingCharges === 'FREE' ? '0.00' : parseFloat(invoiceData.shippingCharges.replace('₹', '') || '0.00').toFixed(2) },
        { key: 'totalAmount', values: totalAmount },
        { key: 'savings', values: savings },
      ];

      const shippingAddressId = address._id;
      const isWalletPayment = appliedWalletAmount > 0;
      const isCodPayment = selectedPaymentMethod === 'COD';
      const isChequePayment = selectedPaymentMethod === 'Cheque';

      if (!isCodPayment && !isChequePayment && !isWalletPayment) {
        throw new Error('Please select a payment method');
      }

      if (isChequePayment && !chequeImage) {
        throw new Error('Please upload a cheque image');
      }

      const formData = new FormData();
      formData.append('orderProductDetails', JSON.stringify(orderProductDetails));
      formData.append('invoice', JSON.stringify(transformedInvoice));
      formData.append('shippingAddressId', shippingAddressId);
      formData.append('totalAmount', parseFloat(totalAmount).toFixed(2));
      formData.append('isWalletPayment', isWalletPayment);
      formData.append('walletAmountUsed', parseFloat(appliedWalletAmount || '0.00').toFixed(2));
      formData.append('isCodPayment', isCodPayment);
      formData.append('isChequePayment', isChequePayment);
      formData.append('isOnlinePayment', false);

      if (isChequePayment && chequeImage) {
        formData.append('chequeImage', {
          uri: chequeImage.uri,
          type: chequeImage.type,
          name: chequeImage.name,
        });
      }

      console.log('Creating order with payload:', {
        orderProductDetails,
        invoice: transformedInvoice,
        shippingAddressId,
        totalAmount: parseFloat(totalAmount).toFixed(2),
        isCodPayment,
        codCharges: invoiceData.codCharges,
      });

      const response = await fetch('${BASE_URL}/partner/order/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Order creation response:', JSON.stringify(data, null, 2));
      if (response.ok && data.success) {
        return { success: true, data: data.data };
      }
      throw new Error(data.message || 'Failed to create order');
    } catch (error) {
      console.error('Error creating order:', error.message);
      return { success: false, message: 'Error creating order: ' + error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinuePayment = async () => {
    if (totalItems === 0) {
      Alert.alert('Error', 'Your cart is empty. Add items to proceed.');
      return;
    }

    if (!address) {
      Alert.alert('Error', 'Please select a delivery address.');
      return;
    }

    if (selectedPaymentMethod === 'Cheque' && !chequeImage) {
      Alert.alert('Error', 'Please upload a cheque image to proceed.');
      return;
    }

    const orderResult = await createOrder();
    if (orderResult.success) {
      // setOrderId(orderResult.data.orderId || '#N/A');
      // setIsModalVisible(true);
          navigation.navigate('PartnnerHome');

    } else {
      Alert.alert('Error', orderResult.message || 'Failed to create order');
    }
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
    navigation.navigate('PartnnerHome');
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
    if (section === 'Cheque') {
      setSelectedPaymentMethod('Cheque');
      setIsCODSelected(false);
    }
  };

  const handleCODSelect = () => {
    setIsCODSelected(!isCODSelected);
    setSelectedPaymentMethod(isCODSelected ? 'Cheque' : 'COD');
    setExpandedSection(null);
    setChequeImage(null);
  };

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
        <Text style={styles.errorText}>Error: Cart details are missing. Please return to the previous screen.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PAYMENT</Text>
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
          <View style={[styles.square, styles.activeSquare]} />
          <Text style={styles.activeStep}>PAYMENT</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.deliverBox}>
          <View style={styles.deliverRow}>
            <Text style={styles.deliverToLabel}>Deliver to:</Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.changeButton}
            >
              <Text style={styles.changeText}>CHANGE</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.deliverToName}>{address?.name || 'Loading...'}</Text>
          <Text style={styles.deliverToAddress}>{address ? `${address.cityTown}, ${address.pincode}` : ''}</Text>
          <Text style={styles.deliverToAddress}>{address?.state}</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment Options</Text>

        <View style={styles.paymentOption}>
          <TouchableOpacity style={styles.paymentOptionRow} onPress={handleCODSelect}>
            <View style={[styles.radio, isCODSelected && styles.radioSelected]} />
            <Text style={styles.paymentOptionText}>Cash on Delivery (COD)</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('Cheque')}>
          <Text style={styles.accordionTitle}>Cheque / Cash Deposit / RTGS</Text>
          <Icon name={expandedSection === 'Cheque' ? 'chevron-up' : 'chevron-down'} size={20} color="#000" />
        </TouchableOpacity>

        {expandedSection === 'Cheque' && (
          <View style={styles.accordionContent}>
            <TouchableOpacity style={styles.uploadButton} onPress={pickChequeImage}>
              <Text style={styles.uploadButtonText}>Upload Cheque Image</Text>
            </TouchableOpacity>
            {chequeImage && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: chequeImage.uri }} style={styles.chequeImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => setChequeImage(null)}>
                  <Icon name="close-circle" size={24} color="#FF4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View style={styles.priceBox}>
          <Text style={styles.priceHeading}>Price Details ({totalItems} items)</Text>
          <View style={styles.priceDetailRow}>
            <Text style={styles.priceLabel}>Cart Total</Text>
            <Text style={[styles.priceValue, styles.strike]}>₹{invoiceData.cartTotal}</Text>
          </View>
          <View style={styles.priceDetailRow}>
            <Text style={styles.priceLabel}>Discounted Price</Text>
            <Text style={styles.priceValue}>₹{invoiceData.discountedPrice}</Text>
          </View>
          {parseFloat(invoiceData.walletMoney) > 0 && (
            <View style={styles.priceDetailRow}>
              <Text style={styles.priceLabel}>Wallet Money</Text>
              <Text style={[styles.priceValue, styles.discountText]}>- ₹{invoiceData.walletMoney}</Text>
            </View>
          )}
          {parseFloat(invoiceData.couponDiscount) > 0 && (
            <View style={styles.priceDetailRow}>
              <Text style={styles.priceLabel}>Coupon Discount</Text>
              <Text style={[styles.priceValue, styles.discountText]}>- ₹{invoiceData.couponDiscount}</Text>
            </View>
          )}
          <View style={styles.priceDetailRow}>
            <Text style={styles.priceLabel}>COD Charges</Text>
            <Text style={styles.priceValue}>₹{invoiceData.codCharges}</Text>
          </View>
          <View style={styles.priceDetailRow}>
            <Text style={styles.priceLabel}>GST</Text>
            <Text style={styles.priceValue}>₹{invoiceData.gst}</Text>
          </View>
          <View style={styles.priceDetailRow}>
            <Text style={styles.priceLabel}>Shipping Charges</Text>
            <Text style={styles.priceValue}>{invoiceData.shippingCharges}</Text>
          </View>
          <View style={styles.priceDetailRow}>
            <Text style={styles.priceLabel}>Total Amount</Text>
            <Text style={[styles.priceValue, styles.totalValue]}>₹{invoiceData.totalAmount}</Text>
          </View>
          <Text style={styles.savingsText}>
            {parseFloat(invoiceData.savings) > 0
              ? `Hooray! You are saving ₹${invoiceData.savings}/- with this order!`
              : 'No additional savings applied.'}
          </Text>
        </View>

        <View style={styles.paymentMethod}>
          <Text style={styles.paymentText}>Payment Method</Text>
          <Text style={styles.paymentMode}>{selectedPaymentMethod}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.continueBtn, isLoading && styles.continueBtnDisabled]}
        onPress={handleContinuePayment}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.continueText}>CONTINUE PAYMENT</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Order Confirmed!</Text>
            <Text style={styles.modalMessage}>
              Your order is confirmed. Here is your order ID:{' '}
              <Text style={styles.modalOrderId}>{orderId}</Text>
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleModalOk}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  errorText: { fontSize: 16, color: '#ff0000', textAlign: 'center', marginTop: 20 },
  backBtn: {
    backgroundColor: '#F36F25',
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
  content: { paddingHorizontal: 16, paddingBottom: 80 },
  deliverBox: {
    backgroundColor: '#FDF6F1',
    padding: 15,
    borderRadius: 6,
    marginBottom: 16,
  },
  deliverRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  deliverToLabel: { color: '#000', fontWeight: '600', fontSize: 14 },
  deliverToName: { fontSize: 14, fontWeight: '600', color: '#000' },
  deliverToAddress: { fontSize: 12, color: '#666' },
  changeButton: {
    backgroundColor: '#F36F25',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  changeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginVertical: 12 },
  paymentOption: {
    backgroundColor: '#FDF6F1',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentOptionRow: { flexDirection: 'row', alignItems: 'center' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F36F25',
    marginRight: 12,
  },
  radioSelected: { backgroundColor: '#F36F25' },
  paymentOptionText: { fontSize: 14, color: '#333', fontWeight: '500' },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FDF6F1',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  accordionTitle: { fontSize: 14, fontWeight: '500', color: '#333' },
  accordionContent: {
    backgroundColor: '#FDF6F1',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: '#F36F25',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 4,
  },
  uploadButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  imagePreview: { marginTop: 12, position: 'relative', alignItems: 'center' },
  chequeImage: { width: 200, height: 100, borderRadius: 4 },
  removeImageButton: { position: 'absolute', top: -10, right: -10 },
  priceBox: {
    backgroundColor: '#FDF6F1',
    padding: 12,
    marginVertical: 12,
    borderRadius: 8,
  },
  priceHeading: { fontWeight: 'bold', marginBottom: 12, fontSize: 16, color: '#333' },
  priceDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  priceLabel: { fontSize: 14, color: '#333' },
  priceValue: { fontSize: 14, color: '#333' },
  strike: { textDecorationLine: 'line-through' },
  discountText: { color: '#28a745' },
  totalValue: { fontWeight: '600' },
  savingsText: { color: '#28a745', fontSize: 14, marginTop: 8 },
  paymentMethod: {
    backgroundColor: '#FDF6F1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 4,
    marginVertical: 12,
  },
  paymentText: { fontWeight: '500', fontSize: 14, color: '#333' },
  paymentMode: { fontSize: 14, fontWeight: '600', color: '#333' },
  continueBtn: {
    backgroundColor: '#F36F25',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 8,
  },
  continueBtnDisabled: { backgroundColor: '#ccc' },
  continueText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOrderId: {
    fontWeight: '600',
    color: '#F36F25',
  },
  modalButton: {
    backgroundColor: '#F36F25',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PartnerPaymentScreen;