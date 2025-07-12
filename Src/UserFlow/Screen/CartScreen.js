 








import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import { useSelector, useDispatch } from 'react-redux';
import { setCartItems } from '../../redux/reducers/cartSlice';
import { BASE_URL } from '../../config/apiConfig';
import Icon from 'react-native-vector-icons/Ionicons';

const CartScreen = ({ navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const authToken = useSelector(state => state.auth.token);
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    gst: 0,
    coupon_discount: 0,
    shipping_charge: 0,
    cod_charges: 0,
  });

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (authToken) {
      fetchCartItems();
      fetchInvoiceData();
    }
  }, [authToken]);

 
  const fetchCartItems = async () => {
    try {
      const response = await fetch(`${BASE_URL}/usercart`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const responseText = await response.text();
      console.log('Cart Response Status:', response.status);
      console.log('Cart Response Text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON Parse Error (Cart):', jsonError.message);
        throw new Error(`Failed to parse cart response: ${responseText.substring(0, 100)}...`);
      }

      if (response.ok) {
        dispatch(setCartItems(data.data.items));
      } else {
        console.error('Error fetching cart:', data.message);
        Alert.alert('Error', data.message || 'Failed to fetch cart items');
      }
    } catch (error) {
      console.error('Error in fetchCartItems:', error.message);
      Alert.alert('Error', 'Something went wrong while fetching cart items');
    }
  };

  const handleRemoveItem = async cartItem => {
    try {
      const payload = {
        itemId: cartItem.itemId._id,
        quantity: cartItem.quantity,
        size: cartItem.size,
        color: cartItem.color,
        skuId: cartItem.skuId,
      };
      const response = await fetch(`${BASE_URL}/usercart/removeitem`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const responseText = await response.text();
      console.log('Remove Item Response Status:', response.status);
      console.log('Remove Item Response Text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON Parse Error (Remove Item):', jsonError.message);
        throw new Error(`Failed to parse remove item response: ${responseText.substring(0, 100)}...`);
      }

      if (response.ok) {
        fetchCartItems();
      } else {
        console.error('Failed to remove item:', data.message);
        Alert.alert('Error', data.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error.message);
      Alert.alert('Error', 'Something went wrong while removing item');
    }
  };

  const handleUpdateQuantity = async (cartItem, actionType) => {
    try {
      const payload = {
        itemId: cartItem.itemId._id,
        size: cartItem.size,
        color: cartItem.color,
        skuId: cartItem.skuId,
        action: actionType,
      };
      const response = await fetch(`${BASE_URL}/usercart/update-quantity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const responseText = await response.text();
      console.log('Update Quantity Response Status:', response.status);
      console.log('Update Quantity Response Text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON Parse Error (Update Quantity):', jsonError.message);
        throw new Error(`Failed to parse update quantity response: ${responseText.substring(0, 100)}...`);
      }

      if (response.ok) {
        fetchCartItems();
      } else {
        console.error('Failed to update quantity:', data.message);
        Alert.alert('Error', data.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error.message);
      Alert.alert('Error', 'Something went wrong while updating quantity');
    }
  };

  const handleContinuePress = () => {
    if (authToken) {
      console.log('Navigating to Delivery with coupon_discount:', invoiceData.coupon_discount);
      navigation.navigate('Delivery', {
        coupon_discount: invoiceData.coupon_discount,
      });
    } else {
      setIsModalVisible(true);
    }
  };

  const handleMoveToWishlist = async cartItem => {
    try {
      const payload = {
        itemId: cartItem.itemId._id,
        color: cartItem.color,
      };
      const response = await fetch(`${BASE_URL}/userwishlist/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const responseText = await response.text();
      console.log('Move to Wishlist Response Status:', response.status);
      console.log('Move to Wishlist Response Text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON Parse Error (Wishlist):', jsonError.message);
        throw new Error(`Failed to parse wishlist response: ${responseText.substring(0, 100)}...`);
      }

      if (response.ok) {
        await handleRemoveItem(cartItem);
        navigation.navigate('Wishlist');
      } else {
        console.error('Failed to move to wishlist:', data.message);
        Alert.alert('Error', data.message || 'Failed to move to wishlist');
      }
    } catch (error) {
      console.error('Error moving to wishlist:', error.message);
      Alert.alert('Error', 'Something went wrong while moving to wishlist');
    }
  };

  const cartTotalMRP = cartItems.reduce(
    (total, item) => total + item.itemId.MRP * item.quantity,
    0,
  );
  const discountedTotal = cartItems.reduce(
    (total, item) => total + item.itemId.discountedPrice * item.quantity,
    0,
  );

  const fetchInvoiceData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/invoice`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const responseText = await res.text();
      console.log('Invoice Response Status:', res.status);
      console.log('Invoice Response Text:', responseText);

      let json;
      try {
        json = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON Parse Error (Invoice):', jsonError.message);
        throw new Error(`Failed to parse invoice response: ${responseText.substring(0, 100)}...`);
      }

      if (res.ok && json.success) {
        const invoice = json.data[0].invoice;
        const getLatestValue = key => {
          const items = invoice.filter(item => item.key === key);
          return items.length > 0 ? items[items.length - 1].value : 0;
        };
        setInvoiceData(prev => ({
          ...prev,
          gst: getLatestValue('gst'),
          shipping_charge:
            getLatestValue('shipping charges') || getLatestValue('shipping charge'),
          cod_charges: getLatestValue('cod charges'),
        }));
        console.log('Invoice data set:', {
          gst: getLatestValue('gst'),
          coupon_discount: invoiceData.coupon_discount,
          shipping_charge: getLatestValue('shipping charges') || getLatestValue('shipping charge'),
          cod_charges: getLatestValue('cod charges'),
        });
      } else {
        console.warn('Failed to fetch invoice:', json.message);
        setInvoiceData(prev => ({
          ...prev,
          gst: 0,
          shipping_charge: 0,
          cod_charges: 0,
        }));
      }
    } catch (err) {
      console.error('Error fetching invoice:', err.message);
      setInvoiceData(prev => ({
        ...prev,
        gst: 0,
        shipping_charge: 0,
        cod_charges: 0,
      }));
    }
  };

  const applyCoupon = async () => {
    if (isApplyingCoupon) return;
    if (!couponCode) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    const totalPayableWithoutCoupon = (
      discountedTotal +
      (discountedTotal * (invoiceData.gst / 100)) +
      invoiceData.shipping_charge +
      invoiceData.cod_charges
    ).toFixed(2);

    if (parseFloat(totalPayableWithoutCoupon) <= 0) {
      Alert.alert('Error', 'Total payable amount must be greater than zero.');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await fetch(`${BASE_URL}/coupon/apply-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          couponCode,
          totalAmount: parseFloat(totalPayableWithoutCoupon),
        }),
      });
      const responseText = await response.text();
      console.log('Coupon Response Status:', response.status);
      console.log('Coupon Response Text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON Parse Error (Coupon):', jsonError.message);
        throw new Error(`Failed to parse coupon response: ${responseText.substring(0, 100)}...`);
      }

      if (response.ok && data.success) {
        const discountValue = data.data.discountValue || 0;

        if (parseFloat(totalPayableWithoutCoupon) <= discountValue) {
          Alert.alert(
            'Error',
            'Coupon discount cannot be greater than or equal to the total payable amount.'
          );
          setInvoiceData(prev => ({ ...prev, coupon_discount: 0 }));
          setIsCouponApplied(false);
          console.log('Coupon rejected: discount exceeds total payable');
          return;
        }

        setInvoiceData(prev => ({
          ...prev,
          coupon_discount: discountValue,
        }));
        setIsCouponApplied(true);
        Alert.alert('Success', `Coupon applied! Discount: ₹${discountValue.toFixed(2)}`);
        console.log('Coupon applied, discount:', discountValue);
      } else {
        Alert.alert('Error', data.message || 'Failed to apply coupon');
        setInvoiceData(prev => ({ ...prev, coupon_discount: 0 }));
        setIsCouponApplied(false);
        console.log('Coupon application failed:', data.message);
      }
    } catch (error) {
      console.error('Error applying coupon:', error.message);
      Alert.alert('Error', 'Something went wrong while applying coupon');
      setInvoiceData(prev => ({ ...prev, coupon_discount: 0 }));
      setIsCouponApplied(false);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setIsCouponApplied(false);
    setCouponCode('');
    setInvoiceData(prev => ({ ...prev, coupon_discount: 0 }));
    Alert.alert('Success', 'Coupon removed successfully.');
    console.log('Coupon removed');
  };

  const totalPayable = (
    discountedTotal +
    (discountedTotal * (invoiceData.gst / 100)) +
    invoiceData.shipping_charge +
    invoiceData.cod_charges -
    (isCouponApplied ? invoiceData.coupon_discount : 0)
  ).toFixed(2);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={22} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cart</Text>
          </View>
          <View style={styles.rightIcons}>
            <TouchableOpacity
              style={styles.cartIconWrapper}
              onPress={() => {
                if (token) {
                  navigation.navigate('Cart');
                } else {
                  setIsModalVisible(true);
                }
              }}>
              <Image
                source={require('../../assets/icon/CartIcon.png')}
                style={styles.icon}
              />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.heroSection}>
          <View style={styles.progress}>
            <Text style={styles.activeStep}>● CART DETAILS </Text>
            <Text style={styles.progressLine}>─────</Text>
            <Text style={styles.inactiveStep}>● ADDRESS</Text>
            <Text style={styles.progressLine}>─────</Text>
            <Text style={styles.inactiveStep}>● PAYMENT</Text>
          </View>

          {cartItems.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <Image
                source={require('../../assets/Images/Cart.png')}
                style={styles.emptyCartImage}
              />
              <Text style={styles.emptyCartTitle}>Your Cart is Empty</Text>
              <Text style={styles.emptyCartSubtitle}>
                Add items to start shopping
              </Text>
              <TouchableOpacity
                style={styles.continueShoppingBtn}
                onPress={() => navigation.navigate('UserHome')}>
                <Text style={styles.continueShoppingText}>
                  Continue Shopping
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            cartItems.map((cartItem, index) => (
              <View key={index} style={styles.card}>
                <View style={{ flexDirection: 'row' }}>
                  <Image
                    source={{ uri: cartItem.itemId?.image }}
                    style={styles.productImage}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle}>
                      {cartItem.itemId?.name}
                    </Text>
                    <Text style={styles.productDesc}>Unisex Collections</Text>
                    <View style={styles.sizeText}>
                      <Text style={styles.sizeLabel}>Size: </Text>
                      <Text style={styles.sizeValue}>{cartItem.size}</Text>
                    </View>
                    <View style={styles.qtyRow}>
                      <Text style={styles.qtyLabel}>Qty: </Text>
                      <View style={styles.qtyControls}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() =>
                            handleUpdateQuantity(cartItem, 'decrease')
                          }>
                          <Entypo name="chevron-down" size={14} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.qtyNumber}>
                          {cartItem.quantity}
                        </Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() =>
                            handleUpdateQuantity(cartItem, 'increase')
                          }>
                          <Entypo name="chevron-up" size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.mrpLabel}>MRP </Text>
                      <Text style={styles.strikePrice}>
                        ₹{cartItem.itemId.MRP.toFixed(2)}
                      </Text>
                      <Text style={styles.actualPrice}>
                        ₹{cartItem.itemId.discountedPrice.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleMoveToWishlist(cartItem)}>
                    <Text style={styles.actionText}>MOVE TO WISHLIST</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleRemoveItem(cartItem)}>
                    <Text style={styles.actionText}>REMOVE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {cartItems.length > 0 && (
            <>
              <TouchableOpacity
                style={styles.couponBar}
                onPress={() => setShowCoupon(prev => !prev)}>
                <Text style={{ fontWeight: 'bold' }}>
                  {isCouponApplied ? 'Coupon Applied' : 'Apply Coupon'}
                </Text>
                <Entypo
                  name={showCoupon ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#000"
                />
              </TouchableOpacity>
              {showCoupon && (
                <View style={styles.couponAccordion}>
                  {isCouponApplied ? (
                    <View style={styles.couponAppliedRow}>
                      <Text style={styles.couponAppliedText}>
                        Applied Coupon: {couponCode}
                      </Text>
                      <TouchableOpacity
                        style={styles.couponRemoveBtn}
                        onPress={removeCoupon}>
                        <Text style={styles.couponRemoveText}>REMOVE</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.couponInputRow}>
                      <TextInput
                        placeholder="Enter your Coupon code"
                        style={styles.couponInput}
                        value={couponCode}
                        onChangeText={setCouponCode}
                      />
                      <TouchableOpacity
                        style={[styles.couponApplyBtn, isApplyingCoupon && { opacity: 0.6 }]}
                        onPress={applyCoupon}
                        disabled={isApplyingCoupon}>
                        <Text style={styles.couponApplyText}>APPLY</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </>
          )}

          {cartItems.length > 0 && (
            <View style={styles.priceCard}>
              <Text style={styles.priceTitle}>
                Price Details ({cartItems.length} items)
              </Text>
              <View style={styles.priceRow}>
                <Text>Cart Total</Text>
                <Text>₹{cartTotalMRP.toFixed(2)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text>Discounted Price</Text>
                <Text>₹{discountedTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text>GST ({invoiceData.gst}%)</Text>
                <Text>
                  ₹{(discountedTotal * (invoiceData.gst / 100)).toFixed(2)}
                </Text>
              </View>
              {isCouponApplied && invoiceData.coupon_discount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.orange}>Coupon Discount ({couponCode})</Text>
                  <Text style={styles.orange}>
                    - ₹{invoiceData.coupon_discount.toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={styles.priceRow}>
                <Text>Shipping Charges</Text>
                <Text>₹{invoiceData.shipping_charge.toFixed(2)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text>COD Charges</Text>
                <Text>₹{invoiceData.cod_charges.toFixed(2)}</Text>
              </View>
              <View
                style={[
                  styles.priceRow,
                  {
                    borderTopWidth: 1,
                    paddingTop: 8,
                    marginTop: 6,
                    borderColor: '#ddd',
                  },
                ]}>
                <Text style={{ fontWeight: 'bold' }}>Total Payable</Text>
                <Text style={{ fontWeight: 'bold' }}>₹{totalPayable}</Text>
              </View>
            </View>
          )}

          {cartItems.length > 0 && (
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleContinuePress}>
              <Text style={styles.continueText}>CONTINUE</Text>
            </TouchableOpacity>
          )}

          {cartItems.length > 0 && (
            <View style={styles.paymentRow}>
              <Text>Payment Method</Text>
              <Text style={{ fontWeight: 'bold' }}>UPI</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  icon: { width: 20, height: 20, resizeMode: 'contain' },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 32,
    backgroundColor: '#fff',
    elevation: 2,
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: {
    marginLeft: 20,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'uppercase',
  },
  rightIcons: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  cartIconWrapper: { position: 'relative' },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'orange',
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  heroSection: {
    padding: 10,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    alignItems: 'center',
    display: 'flex',
  },
  activeStep: { fontWeight: 'bold', color: '#F36F25' },
  inactiveStep: { color: '#ccc' },
  progressLine: { color: '#ccc', marginHorizontal: 4 },
  card: {
    backgroundColor: '#FFF8F5',
    padding: 12,
    marginBottom: 8,
  },
  productImage: {
    width: 100,
    height: 130,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  productInfo: {
    marginLeft: 12,
    flex: 1,
    height: 130,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  productDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sizeText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sizeLabel: {
    fontSize: 14,
    color: '#000',
  },
  sizeValue: {
    fontSize: 14,
    color: '#FF6B00',
    marginLeft: 4,
    fontWeight: '500',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  qtyLabel: {
    fontSize: 14,
    color: '#000',
    marginRight: 8,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    backgroundColor: '#FF6B00',
    width: 22,
    height: 22,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  qtyNumber: {
    fontSize: 14,
    color: '#000',
    minWidth: 20,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mrpLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  strikePrice: {
    textDecorationLine: 'line-through',
    color: '#666',
    fontSize: 14,
    marginRight: 8,
  },
  actualPrice: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
    borderWidth: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    borderRadius: 4,
  },
  actionText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  couponBar: {
    backgroundColor: '#FFF8F5',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  couponAccordion: {
    backgroundColor: '#fdf0e7',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderColor: '#ccc',
    borderWidth: 1,
    borderTopWidth: 0,
    marginTop: -10,
    marginBottom: 12,
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponAppliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  couponApplyBtn: {
    backgroundColor: '#f37022',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginLeft: 10,
    borderRadius: 4,
  },
  couponApplyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  couponAppliedText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  couponRemoveBtn: {
    backgroundColor: '#fff',
    borderColor: '#f37022',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginLeft: 10,
    borderRadius: 4,
  },
  couponRemoveText: {
    color: '#f37022',
    fontWeight: 'bold',
    fontSize: 14,
  },
  priceCard: {
    backgroundColor: '#fff',
    marginTop: 1,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    backgroundColor: '#FFF8F5',
    padding: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  orange: {
    color: '#FF6B00',
    fontWeight: '500',
  },
  continueBtn: {
    backgroundColor: '#FF6B00',
    padding: 16,
  },
  continueText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    marginTop: 10,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyCartImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    tintColor: '#ccc',
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: '#777',
    marginTop: 10,
    marginBottom: 20,
  },
  continueShoppingBtn: {
    backgroundColor: '#f37022',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  continueShoppingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});