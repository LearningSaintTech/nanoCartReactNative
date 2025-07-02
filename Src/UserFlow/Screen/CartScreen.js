import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import { useSelector, useDispatch } from 'react-redux';
import { setCartItems } from '../../redux/reducers/cartSlice';

const CartScreen = ({ navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const authToken = useSelector(state => state.auth.token);
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (authToken) {
      fetchCartItems();
    }
  }, [authToken]);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('http://192.168.1.20 :4000/api/usercart', {
        method: 'GET',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (response.ok) {
        dispatch(setCartItems(data.data.items));
      } else {
        console.error('Error fetching cart:', data.message);
      }
    } catch (error) {
      console.error('Error in fetchCartItems:', error);
    }
  };

  const handleRemoveItem = async (cartItem) => {
    try {
      const payload = {
        itemId: cartItem.itemId._id,
        quantity: cartItem.quantity,
        size: cartItem.size,
        color: cartItem.color,
        skuId: cartItem.skuId,
      };
      const response = await fetch('http://192.168.1.20 :4000/api/usercart/removeitem', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        fetchCartItems();
      } else {
        console.error('Failed to remove item:', data.message);
      }
    } catch (error) {
      console.error('Error removing item:', error);
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
      const response = await fetch('http://192.168.1.20 :4000/api/usercart/update-quantity', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        fetchCartItems();
      } else {
        console.error('Failed to update quantity:', data.message);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleContinuePress = () => {
    if (authToken) {
      navigation.navigate('Delivery');
    } else {
      setIsModalVisible(true);
    }
  };

  const handleMoveToWishlist = async (cartItem) => {
    try {
      const payload = {
        itemId: cartItem.itemId._id,
        color: cartItem.color,
      };
      const response = await fetch('http://192.168.1.20 :4000/api/userwishlist/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        await handleRemoveItem(cartItem);
        navigation.navigate('Wishlist');
      } else {
        console.error('Failed to move to wishlist:', data.message);
      }
    } catch (error) {
      console.error('Error moving to wishlist:', error);
    }
  };

  // Calculate totals based on cart data
  const cartTotalMRP = cartItems.reduce((total, item) => total + (item.itemId.MRP * item.quantity), 0);
  const discountedTotal = cartItems.reduce((total, item) => total + (item.itemId.discountedPrice * item.quantity), 0);

  const [invoiceData, setInvoiceData] = useState({
    gst: 0,
    coupon_discount: 0,
    shipping_charge: 0,
    cod_charges: 0,
  });

  useEffect(() => {
    fetchInvoiceData();
  }, []);

  const fetchInvoiceData = async () => {
    try {
      const res = await fetch('http://192.168.1.20 :4000/api/invoice');
      const json = await res.json();

      if (res.ok && json.success) {
        const invoice = json.data[0].invoice;
        // Pick the latest value for each key
        const getLatestValue = (key) => {
          const items = invoice.filter(item => item.key === key);
          return items.length > 0 ? items[items.length - 1].value : 0;
        };

        setInvoiceData({
          gst: getLatestValue('gst'),
          coupon_discount: getLatestValue('coupon discount'),
          shipping_charge: getLatestValue('shipping charges') || getLatestValue('shipping charge'),
          cod_charges: getLatestValue('cod charges'),
        });
      } else {
        console.warn('Failed to fetch invoice:', json.message);
      }
    } catch (err) {
      console.error('Error fetching invoice:', err.message);
    }
  };

  // Calculate total payable amount
  const totalPayable = (
    discountedTotal -
    invoiceData.coupon_discount +
    invoiceData.shipping_charge +
    invoiceData.cod_charges +
    (discountedTotal * (invoiceData.gst / 100))
  ).toFixed(2);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.navigate('UserHome')}>
              <Image source={require('../../assets/Images/Back.png')} style={styles.backIcon} />
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
              }}
            >
              <Image source={require('../../assets/Images/Cart.png')} style={styles.icon} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progress}>
          <Text style={styles.activeStep}>● CART DETAILS</Text>
          <Text style={styles.progressLine}>─────</Text>
          <Text style={styles.inactiveStep}>● ADDRESS</Text>
          <Text style={styles.progressLine}>─────</Text>
          <Text style={styles.inactiveStep}>● PAYMENT</Text>
        </View>

        {/* Cart Items or Empty Cart Message */}
        {cartItems.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Image
              source={require('../../assets/Images/Cart.png')}
              style={styles.emptyCartImage}
            />
            <Text style={styles.emptyCartTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptyCartSubtitle}>Add items to start shopping</Text>
            <TouchableOpacity
              style={styles.continueShoppingBtn}
              onPress={() => navigation.navigate('UserHome')}
            >
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
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
                  <Text style={styles.productTitle}>{cartItem.itemId?.name}</Text>
                  <Text style={styles.productDesc}>Unisex Collections</Text>
                  <View style={styles.sizeText}>
                    <Text style={styles.sizeLabel}>Size: </Text>
                    <Text style={styles.sizeValue}>{cartItem.size}</Text>
                  </View>

                  <View style={styles.qtyRow}>
                    <Text style={styles.qtyLabel}>Qty: </Text>
                    <View style={styles.qtyControls}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => handleUpdateQuantity(cartItem, 'decrease')}>
                        <Entypo name="chevron-down" size={14} color="#fff" />
                      </TouchableOpacity>
                      <Text style={styles.qtyNumber}>{cartItem.quantity}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => handleUpdateQuantity(cartItem, 'increase')}>
                        <Entypo name="chevron-up" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={styles.mrpLabel}>MRP </Text>
                    <Text style={styles.strikePrice}>₹{cartItem.itemId.MRP.toFixed(2)}</Text>
                    <Text style={styles.actualPrice}>₹{cartItem.itemId.discountedPrice.toFixed(2)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleMoveToWishlist(cartItem)}>
                  <Text style={styles.actionText}>MOVE TO WISHLIST</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleRemoveItem(cartItem)}>
                  <Text style={styles.actionText}>REMOVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Apply Coupon */}
        {cartItems.length > 0 && (
          <>
            <TouchableOpacity
              style={styles.couponBar}
              onPress={() => setShowCoupon(prev => !prev)}
            >
              <Text style={{ fontWeight: 'bold' }}>Apply Coupon</Text>
              <Entypo name={showCoupon ? 'chevron-up' : 'chevron-down'} size={20} color="#000" />
            </TouchableOpacity>

            {showCoupon && (
              <View style={styles.couponAccordion}>
                <View style={styles.couponInputRow}>
                  <TextInput
                    placeholder="Enter your Coupon code"
                    style={styles.couponInput}
                    value={couponCode}
                    onChangeText={setCouponCode}
                  />
                  <TouchableOpacity style={styles.couponApplyBtn}>
                    <Text style={styles.couponApplyText}>APPLY</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {/* Price Details */}
        {cartItems.length > 0 && (
          <View style={styles.priceCard}>
            <Text style={styles.priceTitle}>Price Details ({cartItems.length} items)</Text>
            <View style={styles.priceRow}>
              <Text>Cart Total</Text>
              <Text>₹{cartTotalMRP.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text>Discounted Price</Text>
              <Text>₹{discountedTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.orange}>Coupon Discount</Text>
              <Text style={styles.orange}>- ₹{invoiceData.coupon_discount.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text>GST ({invoiceData.gst}%)</Text>
              <Text>₹{(discountedTotal * (invoiceData.gst / 100)).toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text>Shipping Charges</Text>
              <Text>₹{invoiceData.shipping_charge.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text>COD Charges</Text>
              <Text>₹{invoiceData.cod_charges.toFixed(2)}</Text>
            </View>
            <View style={[styles.priceRow, { borderTopWidth: 1, paddingTop: 8, marginTop: 6, borderColor: '#ddd' }]}>
              <Text style={{ fontWeight: 'bold' }}>Total Payable</Text>
              <Text style={{ fontWeight: 'bold' }}>₹{totalPayable}</Text>
            </View>
          </View>
        )}

        {/* Continue Button */}
        {cartItems.length > 0 && (
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinuePress}>
            <Text style={styles.continueText}>CONTINUE</Text>
          </TouchableOpacity>
        )}

        {/* Payment Method */}
        {cartItems.length > 0 && (
          <View style={styles.paymentRow}>
            <Text>Payment Method</Text>
            <Text style={{ fontWeight: 'bold' }}>UPI</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default CartScreen;

// Styles remain unchanged
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
  backIcon: { width: 24, height: 24, resizeMode: 'contain', marginRight: 8 },
  headerTitle: {   marginLeft:20, fontSize: 16, fontWeight: 'bold', color: '#000', textTransform: 'uppercase' },
  rightIcons: { flexDirection: 'row', alignItems: 'center',marginRight:10 },
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
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    alignItems: 'center',
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
  priceCard: {
    backgroundColor: '#fff',
    padding: 16,
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
    margin: 16,
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
    marginTop: 1,
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
  couponAccordion: {
    marginHorizontal: 15,
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
});