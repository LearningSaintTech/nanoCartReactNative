import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import PartnerHeader from '../Components/PartnerHeader';
import {useSelector, useDispatch} from 'react-redux';
import {setCartItems, clearCart} from './../../redux/reducers/cartSlice';
import {BASE_URL} from '../../config/apiConfig';
import {useRoute} from '@react-navigation/native';

const PartnerCartScreen = ({navigation}) => {
  const route = useRoute();
  const totalPrice = route.params?.totalPrice;

  console.log('this is the total price ', totalPrice);
  console.log(
    'PartnerCartScreen rendered at:',
    new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}),
  );

  const [expandedIndex, setExpandedIndex] = useState(null);
  const [couponAccordionOpen, setCouponAccordionOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(null);
  const [appliedWalletAmount, setAppliedWalletAmount] = useState(0);
  const [isWalletApplied, setIsWalletApplied] = useState(false);
  const [selectedColorIndices, setSelectedColorIndices] = useState({});
  const [walletLoading, setWalletLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
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
  const [stockData, setStockData] = useState({});


console.log("this is invoice data",invoiceData)

  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const cartItems = useSelector(state => state.cart.items);

  console.log('Initial state - token:', token);
  console.log('Initial state - cartItems from Redux:', cartItems);
  console.log('Initial state - invoiceData:', invoiceData);
  console.log('Initial state - walletBalance:', walletBalance);

  const calculateTotalQty = orderDetails => {
    const qty = orderDetails.reduce(
      (total, colorObj) =>
        total +
        colorObj.sizeAndQuantity.reduce((sum, s) => sum + s.quantity, 0),
      0,
    );
    console.log('Calculated total quantity for orderDetails:', qty);
    return qty;
  };

  const calculateTotalPrice = (orderDetails, pricePerUnit) => {
    const total = calculateTotalQty(orderDetails) * pricePerUnit;
    console.log(
      'Calculated total price:',
      total,
      'with pricePerUnit:',
      pricePerUnit,
    );
    return total;
  };

  const totalItems = cartItems.reduce(
    (sum, item) => sum + calculateTotalQty(item.orderDetails),
    0,
  );
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + calculateTotalQty(item.orderDetails) * item.itemId.MRP,
    0,
  );
  console.log('Total items:', totalItems, 'Cart total (MRP-based):', cartTotal);

  useEffect(() => {
    console.log(
      'useEffect triggered at:',
      new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}),
    );
    console.log(
      'useEffect dependencies - token:',
      token,
      'cartItems.length:',
      cartItems.length,
      'appliedWalletAmount:',
      appliedWalletAmount,
    );

    const fetchCartDetails = async () => {
      if (!token) {
        console.warn('No token available, skipping fetchCartDetails');
        Alert.alert(
          'Authentication Required',
          'Please log in to view your cart.',
          [{text: 'OK', onPress: () => navigation.navigate('Login')}],
        );
        dispatch(clearCart());
        console.log('Dispatched clearCart due to no token');
        setCartLoading(false);
        return;
      }

      try {
        setCartLoading(true);
        console.log('Fetching cart details with token:', token);
        const response = await fetch(`${BASE_URL}/partner/cart`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log('Cart API response:', JSON.stringify(data, null, 2));

        if (response.ok && data.success && Array.isArray(data.data.items)) {
          dispatch(setCartItems(data.data.items));
          console.log('Dispatched setCartItems with:', data.data.items);
          const stockPromises = data.data.items.map(item =>
            fetch(`${BASE_URL}/itemDetails/${item.itemId._id}`).then(res =>
              res.json(),
            ),
          );
          const stockResponses = await Promise.all(stockPromises);
          const stockMap = stockResponses.reduce((acc, json, idx) => {
            if (json.data && Array.isArray(json.data) && json.data[0]) {
              acc[data.data.items[idx].itemId._id] =
                json.data[0].imagesByColor || [];
            }
            return acc;
          }, {});
          setStockData(stockMap);
          console.log('Stock data set:', stockMap);
        } else {
          console.error(
            'Failed to fetch cart:',
            data.message || 'Invalid response',
          );
          dispatch(clearCart());
          console.log('Dispatched clearCart due to API error');
          Alert.alert('Error', data.message || 'Failed to load cart items.');
        }
      } catch (error) {
        console.error('Error fetching cart:', error.message);
        dispatch(clearCart());
        console.log('Dispatched clearCart due to fetch error');
        Alert.alert('Error', 'An error occurred while fetching cart items.');
      } finally {
        setCartLoading(false);
        console.log('Cart loading complete, cartLoading:', false);
      }
    };

    const fetchWalletBalance = async () => {
      if (!token) {
        console.warn('No token available, skipping fetchWalletBalance');
        setWalletBalance(0);
        setWalletLoading(false);
        console.log('Wallet balance set to 0 due to no token');
        return;
      }
      try {
        console.log('Fetching wallet balance with token:', token);
        const response = await fetch(`${BASE_URL}/wallet`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log('Wallet API response:', JSON.stringify(data, null, 2));
        if (response.ok && data.success) {
          setWalletBalance(data.data.totalBalance || 0);
          console.log('Wallet balance set:', data.data.totalBalance || 0);
        } else {
          setWalletBalance(0);
          console.log('Wallet balance set to 0 due to API error');
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error.message);
        setWalletBalance(0);
        console.log('Wallet balance set to 0 due to fetch error');
      } finally {
        setWalletLoading(false);
        console.log('Wallet loading complete, walletLoading:', false);
      }
    };

    const fetchInvoiceData = async () => {
      if (!token) {
        console.warn('No token available, skipping fetchInvoiceData');
        console.log('Skipped fetchInvoiceData due to no token');
        return;
      }
      try {
        console.log('Fetching invoice data with token:', token);
        const res = await fetch(`${BASE_URL}/invoice`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        console.log('Invoice API response:', JSON.stringify(json, null, 2));

        // Calculate cartTotal using MRP * totalQuantity
        const calculatedCartTotal = cartItems.reduce(
          (sum, item) => sum + item.itemId.MRP * item.totalQuantity,
          0,
        );

        // Use totalPrice from cart items as discountedPrice
        const discountedPrice = cartItems.reduce(
          (sum, item) => sum + item.totalPrice,
          0,
        );

        if (
          res.ok &&
          json.success &&
          Array.isArray(json.data) &&
          json.data[0]?.invoice
        ) {
          const invoice = json.data[0].invoice;
          const getLatestValue = key => {
            const items = invoice.filter(
              item => item.key.toLowerCase() === key.toLowerCase(),
            );
            return items.length > 0
              ? parseFloat(items[items.length - 1].value) || 0
              : 0;
          };

          const walletMoney = getLatestValue('wallet money') || appliedWalletAmount;
          const couponDiscountValue = getLatestValue('coupon discount') || 0;
          const codCharges = getLatestValue('cod charges') || 0;
          const gstValue = getLatestValue('gst') || 0;
          const shippingCharges =
            getLatestValue('shipping charges') ||
            getLatestValue('shipping charge') ||
            0;

          // Calculate totalAmount including shippingCharges and gstValue
          const totalAmount =
            discountedPrice -
            walletMoney -
            couponDiscountValue +
            codCharges +
            gstValue +
            shippingCharges;

          const savings =
            calculatedCartTotal -
            discountedPrice +
            couponDiscountValue +
            walletMoney;

          const newInvoiceData = {
            cartTotal: calculatedCartTotal.toFixed(2),
            discountedPrice: discountedPrice.toFixed(2),
            walletMoney: walletMoney.toFixed(2),
            couponDiscount: couponDiscountValue.toFixed(2),
            codCharges: codCharges.toFixed(2),
            gst: gstValue.toFixed(1),
            shippingCharges:
              shippingCharges === 0 ? 'FREE' : `₹${shippingCharges.toFixed(2)}`,
            totalAmount: totalAmount.toFixed(1),
            savings: savings.toFixed(2),
          };
          setInvoiceData(newInvoiceData);
          console.log('Invoice data set:', newInvoiceData);
        } else {
          console.warn('Invalid invoice data, using cart-based values');
          const walletMoney = appliedWalletAmount;
          const couponDiscountValue = 0;
          const codCharges = 0;
          const gstValue = 0;
          const shippingCharges = 0;

          // Calculate totalAmount including shippingCharges and gstValue
          const totalAmount =
            discountedPrice -
            walletMoney -
            couponDiscountValue +
            codCharges +
            gstValue +
            shippingCharges;

          const savings =
            calculatedCartTotal -
            discountedPrice +
            couponDiscountValue +
            walletMoney;

          const newInvoiceData = {
            cartTotal: calculatedCartTotal.toFixed(2),
            discountedPrice: discountedPrice.toFixed(2),
            walletMoney: walletMoney.toFixed(2),
            couponDiscount: couponDiscountValue.toFixed(2),
            codCharges: codCharges.toFixed(2),
            gst: gstValue.toFixed(1),
            shippingCharges:
              shippingCharges === 0 ? 'FREE' : `₹${shippingCharges.toFixed(2)}`,
            totalAmount: totalAmount.toFixed(1),
            savings: savings.toFixed(2),
          };
          setInvoiceData(newInvoiceData);
          console.log('Fallback invoice data set:', newInvoiceData);
        }
      } catch (err) {
        console.error('Error fetching invoice:', err.message);

        // Calculate cartTotal using MRP * totalQuantity
        const calculatedCartTotal = cartItems.reduce(
          (sum, item) => sum + item.itemId.MRP * item.totalQuantity,
          0,
        );

        // Use totalPrice from cart items as discountedPrice
        const discountedPrice = cartItems.reduce(
          (sum, item) => sum + item.totalPrice,
          0,
        );

        const walletMoney = appliedWalletAmount;
        const couponDiscountValue = 0;
        const codCharges = 0;
        const gstValue = 0;
        const shippingCharges = 0;

        // Calculate totalAmount including shippingCharges and gstValue
        const totalAmount =
          discountedPrice -
          walletMoney -
          couponDiscountValue +
          codCharges +
          gstValue +
          shippingCharges;

        const savings =
          calculatedCartTotal -
          discountedPrice +
          couponDiscountValue +
          walletMoney;

        const newInvoiceData = {
          cartTotal: calculatedCartTotal.toFixed(2),
          discountedPrice: discountedPrice.toFixed(2),
          walletMoney: walletMoney.toFixed(2),
          couponDiscount: couponDiscountValue.toFixed(2),
          codCharges: codCharges.toFixed(2),
          gst: gstValue.toFixed(1),
          shippingCharges:
            shippingCharges === 0 ? 'FREE' : `₹${shippingCharges.toFixed(2)}`,
          totalAmount: totalAmount.toFixed(1),
          savings: savings.toFixed(2),
        };
        setInvoiceData(newInvoiceData);
        console.log('Error fallback invoice data set:', newInvoiceData);
      }
    };

    fetchCartDetails();
    fetchWalletBalance();
    fetchInvoiceData();
  }, [token, cartItems?.length, appliedWalletAmount]);

  const toggleExpand = index => {
    console.log(
      'toggleExpand called for index:',
      index,
      'current expandedIndex:',
      expandedIndex,
    );
    setExpandedIndex(expandedIndex === index ? null : index);
    if (expandedIndex === index) {
      setSelectedColorIndices(prev => {
        const newIndices = {...prev, [index]: undefined};
        console.log('Collapsed, updated selectedColorIndices:', newIndices);
        return newIndices;
      });
    } else {
      setSelectedColorIndices(prev => {
        const newIndices = {...prev, [index]: 0};
        console.log('Expanded, updated selectedColorIndices:', newIndices);
        return newIndices;
      });
    }
  };

  // const handleQuantityChange = async (
  //   itemId,
  //   color,
  //   size,
  //   newQuantity,
  //   itemIndex,
  // ) => {
  //   console.log('handleQuantityChange called:', {
  //     itemId,
  //     color,
  //     size,
  //     newQuantity,
  //     itemIndex,
  //   });
  //   const itemStockData = stockData[itemId];
  //   if (itemStockData) {
  //     const colorData = itemStockData.find(c => c.color === color);
  //     if (colorData) {
  //       const sizeData = colorData.sizes.find(s => s.size === size);
  //       if (sizeData && newQuantity > sizeData.stock) {
  //         console.log(
  //           `Quantity ${newQuantity} exceeds stock ${sizeData.stock} for size ${size} in ${color}`,
  //         );
  //         Alert.alert(
  //           'Error',
  //           `Quantity cannot exceed available stock (${sizeData.stock}) for size ${size} in ${color}.`,
  //         );
  //         return;
  //       }
  //     }
  //   }

  //   try {
  //     const updatedCartItems = [...cartItems];
  //     const item = updatedCartItems[itemIndex];
  //     const updatedOrderDetails = item.orderDetails.map(colorObj => {
  //       if (colorObj.color === color) {
  //         return {
  //           ...colorObj,
  //           sizeAndQuantity: colorObj.sizeAndQuantity.map(sizeObj => {
  //             if (sizeObj.size === size) {
  //               return {...sizeObj, quantity: newQuantity};
  //             }
  //             return sizeObj;
  //           }),
  //         };
  //       }
  //       return colorObj;
  //     });

  //     const payload = {
  //       itemId,
  //       orderDetails: updatedOrderDetails.map(colorObj => ({
  //         color: colorObj.color,
  //         sizeAndQuantity: colorObj.sizeAndQuantity.map(sizeObj => ({
  //           size: sizeObj.size,
  //           quantity:
  //             sizeObj.size === size && colorObj.color === color
  //               ? newQuantity
  //               : sizeObj.quantity,
  //           skuId: sizeObj.skuId,
  //         })),
  //       })),
  //     };
  //     console.log('Quantity update payload:', JSON.stringify(payload, null, 2));
  //     const response = await fetch(`${BASE_URL}/partner/cart/update`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     const data = await response.json();
  //     console.log('Cart update API response:', JSON.stringify(data, null, 2));
  //     if (!response.ok) {
  //       console.error('Failed to update cart:', data.message);
  //       Alert.alert('Error', 'Failed to update the quantity.');
  //     } else {
  //       const cartResponse = await fetch(`${BASE_URL}/partner/cart`, {
  //         method: 'GET',
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           'Content-Type': 'application/json',
  //         },
  //       });
  //       const cartData = await cartResponse.json();
  //       console.log(
  //         'Updated cart API response:',
  //         JSON.stringify(cartData, null, 2),
  //       );
  //       if (
  //         cartResponse.ok &&
  //         cartData.success &&
  //         Array.isArray(cartData.data.items)
  //       ) {
  //         dispatch(setCartItems(cartData.data.items));
  //         console.log(
  //           'Dispatched setCartItems with updated cart:',
  //           cartData.data.items,
  //         );
  //       } else {
  //         console.error('Failed to fetch updated cart:', cartData.message);
  //         Alert.alert('Error', 'Failed to refresh cart after quantity update.');
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error updating quantity:', error.message);
  //     Alert.alert('Error', 'An error occurred while updating the quantity.');
  //   }
  // };



const handleQuantityChange = async (itemId, color, size, newQuantity, itemIndex) => {
  console.log('handleQuantityChange called:', {
    itemId,
    color,
    size,
    newQuantity,
    itemIndex,
  });

  const item = cartItems[itemIndex];
  const currentColorObj = item.orderDetails.find(obj => obj.color === color);
  const currentSizeObj = currentColorObj.sizeAndQuantity.find(obj => obj.size === size);
  const currentQuantity = currentSizeObj.quantity;
  const action = newQuantity > currentQuantity ? 'increase' : 'decrease';

  if (newQuantity < 0) {
    console.log('Cannot decrease quantity below 0');
    Alert.alert('Error', 'Quantity cannot be less than 0.');
    return;
  }

  const itemStockData = stockData[itemId];
  if (itemStockData) {
    const colorData = itemStockData.find(c => c.color === color);
    if (colorData) {
      const sizeData = colorData.sizes.find(s => s.size === size);
      if (sizeData && newQuantity > sizeData.stock) {
        console.log(
          `Quantity ${newQuantity} exceeds stock ${sizeData.stock} for size ${size} in ${color}`,
        );
        Alert.alert(
          'Error',
          `Quantity cannot exceed available stock (${sizeData.stock}) for size ${size} in ${color}.`,
        );
        return;
      }
    }
  }

  try {
    const payload = { itemId, color, size, action };
    console.log('Quantity update payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${BASE_URL}/partner/cart/update-quantity`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    // Log the raw response
    const responseText = await response.text();
    console.log('Raw API response:', responseText);
    console.log('Response status:', response.status);

    // Attempt to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError.message);
      console.error('Response was:', responseText);
      Alert.alert('Error', 'Invalid response from server. Please try again later.');
      return;
    }

    console.log('Parsed API response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('Failed to update cart:', data.message);
      Alert.alert('Error', data.message || 'Failed to update the quantity.');
      return;
    }

    const cartResponse = await fetch(`${BASE_URL}/partner/cart`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const cartData = await cartResponse.json();
    console.log('Updated cart API response:', JSON.stringify(cartData, null, 2));

    if (cartResponse.ok && cartData.success && Array.isArray(cartData.data.items)) {
      dispatch(setCartItems(cartData.data.items));
      console.log('Dispatched setCartItems with updated cart:', cartData.data.items);
    } else {
      console.error('Failed to fetch updated cart:', cartData.message);
      Alert.alert('Error', 'Failed to refresh cart after quantity update.');
    }
  } catch (error) {
    console.error('Error updating quantity:', error.message);
    Alert.alert('Error', 'An error occurred while updating the quantity.');
  }
};


  const handleRemoveItem = async (item, itemIndex) => {
    console.log(
      'handleRemoveItem called for item:',
      item.itemId.name,
      'at index:',
      itemIndex,
    );
    try {
      const payload = {
        itemId: item.itemId._id,
        orderDetails: item.orderDetails.map(colorObj => ({
          color: colorObj.color,
          sizeAndQuantity: colorObj.sizeAndQuantity.map(sizeObj => ({
            size: sizeObj.size,
            quantity: sizeObj.quantity,
            skuId: sizeObj.skuId,
          })),
        })),
      };
      console.log('Remove item payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${BASE_URL}/partner/cart/removeitem`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Remove item API response:', JSON.stringify(data, null, 2));
      if (response.ok && data.success) {
        dispatch(setCartItems(cartItems.filter((_, idx) => idx !== itemIndex)));
        console.log(
          'Dispatched setCartItems after removing item at index:',
          itemIndex,
        );
        Alert.alert(
          'Success',
          `${item.itemId.name} has been removed from the cart.`,
        );
      } else {
        console.error('Failed to remove item:', data.message);
        Alert.alert(
          'Error',
          data.message || 'Failed to remove the item from the cart.',
        );
      }
    } catch (error) {
      console.error('Error removing item:', error.message);
      Alert.alert('Error', 'An error occurred while removing the item.');
    }
  };


  const handleMoveToWishlist = async (item, itemIndex) => {
  console.log(
    'handleMoveToWishlist called for item:',
    item.itemId.name,
    'at index:',
    itemIndex,
  );
  try {
    // Step 1: Add item to wishlist
    const wishlistPayload = {
      itemId: item.itemId._id,
      color: item.orderDetails[0]?.color || 'default',
    };
    console.log(
      'Move to wishlist payload:',
      JSON.stringify(wishlistPayload, null, 2),
    );
    const wishlistResponse = await fetch(`${BASE_URL}/partner/wishlist/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(wishlistPayload),
    });
    const wishlistData = await wishlistResponse.json();
    console.log('Wishlist API response:', JSON.stringify(wishlistData, null, 2));

    if (!wishlistResponse.ok || !wishlistData.success) {
      console.error('Failed to move item to wishlist:', wishlistData.message);
      Alert.alert('Error', wishlistData.message || 'Failed to move the item to the wishlist.');
      return;
    }

    // Step 2: Remove item from cart
    const cartRemovePayload = {
      itemId: item.itemId._id,
      orderDetails: item.orderDetails.map(colorObj => ({
        color: colorObj.color,
        sizeAndQuantity: colorObj.sizeAndQuantity.map(sizeObj => ({
          size: sizeObj.size,
          quantity: sizeObj.quantity,
          skuId: sizeObj.skuId,
        })),
      })),
    };
    console.log('Remove item from cart payload:', JSON.stringify(cartRemovePayload, null, 2));

    const cartRemoveResponse = await fetch(`${BASE_URL}/partner/cart/removeitem`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cartRemovePayload),
    });

    const cartRemoveData = await cartRemoveResponse.json();
    console.log('Cart remove API response:', JSON.stringify(cartRemoveData, null, 2));

    if (!cartRemoveResponse.ok || !cartRemoveData.success) {
      console.error('Failed to remove item from cart:', cartRemoveData.message);
      Alert.alert('Error', cartRemoveData.message || 'Failed to remove the item from the cart.');
      return;
    }

    // Step 3: Update local cart state
    const updatedCartItems = cartItems.filter((_, idx) => idx !== itemIndex);
    dispatch(setCartItems(updatedCartItems));
    console.log(
      'Dispatched setCartItems after moving to wishlist, new cartItems:',
      updatedCartItems,
    );

    // Step 4: Show success message
    Alert.alert(
      'Success',
      `${item.itemId.name} has been moved to the wishlist and removed from the cart.`,
    );

    // Step 5: Optionally fetch updated cart data to ensure sync with backend
    const cartResponse = await fetch(`${BASE_URL}/partner/cart`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const cartData = await cartResponse.json();
    console.log('Updated cart API response:', JSON.stringify(cartData, null, 2));

    if (cartResponse.ok &&ikinData.success && Array.isArray(cartData.data.items)) {
      dispatch(setCartItems(cartData.data.items));
      console.log('Dispatched setCartItems with updated cart:', cartData.data.items);
    } else {
      console.error('Failed to fetch updated cart:', cartData.message);
      Alert.alert('Error', 'Failed to refresh cart after moving to wishlist.');
    }
  } catch (error) {
    console.error('Error in handleMoveToWishlist:', error.message);
    Alert.alert('Error', 'An error occurred while moving the item to the wishlist.');
  }
};
  const handleApplyWallet = () => {
    console.log('handleApplyWallet called with walletAmount:', walletAmount);
    const enteredAmount = parseFloat(walletAmount);

    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      console.log('Invalid wallet amount:', enteredAmount);
      Alert.alert('Error', 'Please enter a valid amount greater than 0.');
      return;
    }

    if (walletBalance === null) {
      console.log('Wallet balance not available');
      Alert.alert(
        'Error',
        'Wallet balance is not available. Please try again later.',
      );
      return;
    }

    if (enteredAmount > walletBalance) {
      console.log(
        `Entered amount ${enteredAmount} exceeds wallet balance ${walletBalance}`,
      );
      Alert.alert(
        'Error',
        `Entered amount (₹${enteredAmount}) exceeds available wallet balance (₹${walletBalance}).`,
      );
      return;
    }

    const currentTotalAmount = parseFloat(invoiceData.totalAmount);
    if (enteredAmount > currentTotalAmount) {
      console.log(
        `Entered wallet amount ${enteredAmount} exceeds total amount ${currentTotalAmount}`,
      );
      Alert.alert(
        'Error',
        `Wallet amount (₹${enteredAmount}) cannot exceed total amount (₹${currentTotalAmount}).`,
      );
      return;
    }

    setAppliedWalletAmount(enteredAmount);
    setIsWalletApplied(true);
    console.log(
      'Applied wallet amount:',
      enteredAmount,
      'isWalletApplied:',
      true,
    );
    Alert.alert(
      'Success',
      `Wallet amount of ₹${enteredAmount} has been applied.`,
    );
  };

  const handleRemoveWallet = () => {
    console.log('handleRemoveWallet called');
    setAppliedWalletAmount(0);
    setWalletAmount('');
    setIsWalletApplied(false);
    console.log(
      'Removed wallet amount, appliedWalletAmount:',
      0,
      'isWalletApplied:',
      false,
    );
    Alert.alert('Success', 'Wallet amount has been removed.');
  };

  const handleApplyCoupon = async () => {
    console.log('handleApplyCoupon called with couponCode:', couponCode);
    if (!couponCode) {
      console.log('No coupon code entered');
      Alert.alert('Error', 'Please enter a coupon code.');
      return;
    }
    try {
      const payload = {couponCode};
      console.log('Coupon apply payload:', JSON.stringify(payload, null, 2));
      const response = await fetch(`${BASE_URL}/coupon/apply-partner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('Coupon API response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        const discountAmount = parseFloat(data?.data?.discountValue) || 0;
        const currentTotalAmount = parseFloat(invoiceData.totalAmount);

        if (discountAmount > currentTotalAmount) {
          console.log(
            `Coupon discount ${discountAmount} exceeds total amount ${currentTotalAmount}`,
          );
          Alert.alert(
            'Error',
            `Coupon discount (₹${discountAmount}) cannot exceed total amount (₹${currentTotalAmount}).`,
          );
          return;
        }

        setInvoiceData(prev => {
          const newInvoiceData = {
            ...prev,
            couponDiscount: discountAmount.toFixed(2),
            totalAmount: (
              parseFloat(prev.discountedPrice) -
              parseFloat(prev.walletMoney) -
              discountAmount +
              parseFloat(prev.codCharges) +
              parseFloat(prev.gst) +
              (prev.shippingCharges === 'FREE' ? 0 : parseFloat(prev.shippingCharges.replace('₹', '')))
            ).toFixed(1),
            savings: (
              parseFloat(prev.cartTotal) -
              parseFloat(prev.discountedPrice) +
              discountAmount +
              parseFloat(prev.walletMoney)
            ).toFixed(2),
          };
          console.log('✅ Updated invoiceData with coupon:', newInvoiceData);
          return newInvoiceData;
        });

        Alert.alert(
          'Success',
          `Coupon applied! ₹${discountAmount} discount added.`,
        );
      } else {
        console.error('Failed to apply coupon:', data.message);
        Alert.alert('Error', data.message || 'Invalid coupon code.');
      }
    } catch (error) {
      console.error('Error applying coupon:', error.message);
      Alert.alert('Error', 'An error occurred while applying the coupon.');
    }
  };

  const handleContinue = () => {
    console.log('handleContinue called, cartItems.length:', cartItems.length);
    if (cartItems.length === 0) {
      console.log('Cart is empty, cannot proceed');
      Alert.alert('Error', 'Your cart is empty. Add items to proceed.');
      return;
    }
    const navigationData = {
      totalItems,
      cartTotal,
      appliedWalletAmount,
      couponDiscount: parseFloat(invoiceData?.couponDiscount),
      cartItems,
      invoiceData,
    };
    console.log('Navigating to PartnerDelivery with data:', navigationData);
    navigation.navigate('PartnerDelivery', navigationData);
  };

  if (cartLoading) {
    console.log('Rendering loading state, cartLoading:', cartLoading);
    return (
      <View style={styles.container}>
        <Text style={styles.emptyCartText}>Loading cart...</Text>
      </View>
    );
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    console.log('Rendering empty cart state, cartItems:', cartItems);
    return (
      <View style={styles.emptyCartContainer}>
        <Text style={styles.emptyCartText}>Your cart is empty</Text>
      </View>
    );
  }

  console.log('Rendering main content with cartItems:', cartItems.length);
  return (
    <View style={styles.container}>
      <PartnerHeader />
      <ScrollView contentContainerStyle={{paddingBottom: 150}}>
        <View style={styles.stepRow}>
          <View style={styles.stepContainer}>
            <View style={[styles.square, styles.activeSquare]} />
            <Text style={styles.activeStep}>CART DETAILS</Text>
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.stepContainer}>
            <View style={styles.square} />
            <Text style={styles.inactiveStep}>ADDRESS </Text>
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.stepContainer}>
            <View style={styles.square} />
            <Text style={styles.inactiveStep}>PAYMENT</Text>
          </View>
        </View>

        {cartItems.map((item, index) => {
          console.log(
            'Rendering cart item:',
            item.itemId.name,
            'at index:',
            index,
          );
          const totalQty = calculateTotalQty(item.orderDetails);
          const pricePerUnit = item.totalPrice / item.totalQuantity;
          const totalPriceItem = calculateTotalPrice(
            item.orderDetails,
            pricePerUnit,
          );
          const selectedColorIndex = selectedColorIndices[index] ?? 0;
          const selectedColorObj = item.orderDetails
            ? item.orderDetails[selectedColorIndex] || item.orderDetails[0]
            : null;
          console.log(
            'Item details - totalQty:',
            totalQty,
            'pricePerUnit:',
            pricePerUnit,
            'selectedColorIndex:',
            selectedColorIndex,
          );

          return (
            <View key={item._id} style={styles.card}>
              <View style={styles.row}>
                <Image
                  source={{uri: item.itemId.image}}
                  style={styles.productImage}
                />
                <View style={{flex: 1, marginLeft: 10}}>
                  <Text style={styles.title}>{item.itemId.name}</Text>
                  <Text style={styles.category}>{item.itemId.description}</Text>
                  <Text style={styles.price}>
                    MRP <Text style={styles.mrp}>₹{item.itemId.MRP}</Text>{' '}
                    <Text style={{fontWeight: 'bold'}}>
                      ₹{pricePerUnit.toFixed(2)}
                    </Text>
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => toggleExpand(index)}
                style={styles.accordionToggle}>
                <Text style={styles.accordionTitle}>Check Order Details </Text>
                <Icon
                  name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#333"
                />
              </TouchableOpacity>

              {expandedIndex === index && selectedColorObj && (
                <View style={styles.orderDetailsContent}>
                  <View style={styles.colorBoxesRow}>
                    {item.orderDetails.map((colorObj, i) => {
                      const colorData = stockData[item.itemId._id]?.find(
                        c => c.color === colorObj.color,
                      );
                      const hexCode = colorData?.hexCode || '#ccc';
                      console.log(
                        'Rendering color box for color:',
                        colorObj.color,
                        'hexCode:',
                        hexCode,
                      );
                      return (
                        <TouchableOpacity
                          key={i}
                          onPress={() =>
                            setSelectedColorIndices(prev => {
                              const newIndices = {...prev, [index]: i};
                              console.log(
                                'Selected color index updated:',
                                newIndices,
                              );
                              return newIndices;
                            })
                          }
                          style={[
                            styles.colorBox,
                            {backgroundColor: hexCode},
                            selectedColorIndex === i && styles.selectedColorBox,
                          ]}
                        />
                      );
                    })}
                  </View>

                  <View>
                    {selectedColorObj.sizeAndQuantity.map((sizeObj, j) => {
                      const colorData = stockData[item.itemId._id]?.find(
                        c => c.color === selectedColorObj.color,
                      );
                      const sizeData = colorData?.sizes.find(
                        s => s.size === sizeObj.size,
                      );
                      const isOutOfStock = sizeData && sizeData.stock === 0;
                      console.log(
                        'Rendering size:',
                        sizeObj.size,
                        'quantity:',
                        sizeObj.quantity,
                        'isOutOfStock:',
                        isOutOfStock,
                      );

                      return (
                        <View key={j} style={styles.sizeRow}>
                          <Text
                            style={[
                              styles.sizeText,
                              isOutOfStock && {
                                textDecorationLine: 'line-through',
                                color: '#888',
                              },
                            ]}>
                            {sizeObj.size} {isOutOfStock && '(Out of Stock)'}
                          </Text>
                          <View style={styles.quantityCell}>
                            <TouchableOpacity
                              onPress={() =>
                                handleQuantityChange(
                                  item.itemId._id,
                                  selectedColorObj.color,
                                  sizeObj.size,
                                  sizeObj.quantity + 1,
                                  index,
                                )
                              }
                              style={styles.arrowButton}
                              disabled={isOutOfStock}>
                              <Icon
                                name="chevron-up"
                                size={16}
                                color={isOutOfStock ? '#ccc' : '#F36F25'}
                              />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>
                              {sizeObj.quantity}
                            </Text>
                            <TouchableOpacity
                              onPress={() =>
                                handleQuantityChange(
                                  item.itemId._id,
                                  selectedColorObj.color,
                                  sizeObj.size,
                                  Math.max(0, sizeObj.quantity - 1),
                                  index,
                                )
                              }
                              style={styles.arrowButton}
                              disabled={isOutOfStock}>
                              <Icon
                                name="chevron-down"
                                size={16}
                                color={isOutOfStock ? '#ccc' : '#F36F25'}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.qtyPerColorRow}>
                    <Text style={styles.summaryText}>Qty. per Color:</Text>
                    <Text style={styles.summaryValue}>{totalQty}</Text>
                  </View>

                  <View style={styles.totalContainer}>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Qty.</Text>
                      <Text style={styles.totalLabel}>Price / Pcs</Text>
                      <Text style={styles.totalLabel}>Total Price</Text>
                    </View>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalValue}>{totalQty}</Text>
                      <Text style={styles.totalValue}>
                        ₹{pricePerUnit.toFixed(2)}
                      </Text>
                      <Text style={styles.totalValue}>
                        ₹{totalPriceItem.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.wishlistButton}
                  onPress={() => handleMoveToWishlist(item, index)}>
                  <Text style={styles.buttonText}>MOVE TO WISHLIST</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item, index)}>
                  <Text style={styles.buttonText}>REMOVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={styles.couponContainer}>
          <TouchableOpacity
            onPress={() => {
              console.log(
                'Toggling coupon accordion, current state:',
                couponAccordionOpen,
              );
              setCouponAccordionOpen(!couponAccordionOpen);
            }}
            style={styles.couponAccordionToggle}>
            <Text style={styles.sectionTitle}>Apply Coupon</Text>
            <Icon
              name={couponAccordionOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#333"
            />
          </TouchableOpacity>
          {couponAccordionOpen && (
            <View style={styles.couponInputContainer}>
              <TextInput
                placeholder="Enter your Coupon code"
                style={styles.couponInput}
                value={couponCode}
                onChangeText={text => {
                  console.log('Coupon code changed to:', text);
                  setCouponCode(text);
                }}
              />
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApplyCoupon}>
                <Text style={styles.applyBtnText}>APPLY</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.walletContainer}>
          <View style={styles.walletContainer}>
            <Text style={styles.walletTitle}>Use Wallet</Text>
          </View>
          <View style={styles.couponInputContainer}>
            <TextInput
              placeholder="₹"
              style={styles.walletInput}
              keyboardType="numeric"
              value={walletAmount}
              onChangeText={text => {
                console.log('Wallet amount changed to:', text);
                setWalletAmount(text);
              }}
              editable={!isWalletApplied}
            />
            <TouchableOpacity
              style={[styles.applyBtn, isWalletApplied && styles.removeBtn]}
              onPress={
                isWalletApplied ? handleRemoveWallet : handleApplyWallet
              }>
              <Text style={styles.applyBtnText}>
                {isWalletApplied ? 'REMOVE' : 'APPLY'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceText}>
            {walletLoading
              ? 'Loading...'
              : `Available Balance (₹${walletBalance})`}
          </Text>
        </View>

        <View style={styles.priceBox}>
          <Text style={styles.priceHeading}>
            Price Details ({totalItems} items)
          </Text>
          <View style={styles.priceDetailRow}>
            <Text style={styles.priceLabel}>Cart Total</Text>
            <Text style={styles.priceValue}>₹{invoiceData?.cartTotal}</Text>
          </View>
          <View style={styles.priceDetailRow}>
            <Text style={styles.priceLabel}>Discounted Price</Text>
            <Text style={styles.priceValue}>
              ₹{invoiceData.discountedPrice}
            </Text>
          </View>
          {parseFloat(invoiceData.walletMoney) > 0 && (
            <View style={styles.priceDetailRow}>
              <Text style={styles.priceLabel}>Wallet Money</Text>
              <Text style={[styles.priceValue, styles.discountText]}>
                - ₹{invoiceData.walletMoney}
              </Text>
            </View>
          )}
          {parseFloat(invoiceData.couponDiscount) > 0 && (
            <View style={styles.priceDetailRow}>
              <Text style={styles.priceLabel}>Coupon Discount</Text>
              <Text style={[styles.priceValue, styles.discountText]}>
                - ₹{invoiceData.couponDiscount}
              </Text>
            </View>
          )}
          <View style={styles.priceDetailRow}>
            <Text style={styles.priceLabel}>GST</Text>
            <Text style={styles.priceValue}>₹{invoiceData.gst}</Text>
          </View>
          <View style={styles.priceDetailRow}>
            <Text style={styles.priceLabel}>Shipping Charges</Text>
            <Text style={styles.priceValue}>{invoiceData.shippingCharges}</Text>
          </View>
          <View style={styles.priceDetailRow}>
            <Text style={styles.priceLabel}>Total Amount </Text>
            <Text style={styles.priceValue}>₹{invoiceData.totalAmount}</Text>
          </View>
          <Text style={styles.savingsText}>
            Hooray! You are saving ₹{invoiceData.savings}/- with this order!
          </Text>
        </View>

        <Text style={styles.paymentMethod}>
          Payment Method: <Text style={{fontWeight: 'bold'}}>UPI</Text>
        </Text>
      </ScrollView>

      <TouchableOpacity onPress={handleContinue} style={styles.continueBtn}>
        <Text style={styles.continueText}>CONTINUE</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  stepContainer: {alignItems: 'center', flexDirection: 'row'},
  square: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: '#666',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  activeSquare: {borderColor: '#D6722F', backgroundColor: '#D6722F'},
  dottedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#666',
    marginHorizontal: 4,
  },
  activeStep: {color: '#D6722F', fontWeight: 'bold', fontSize: 11},
  inactiveStep: {color: '#666', fontWeight: 'bold', fontSize: 11},
  card: {
    backgroundColor: '#FDF6F1',
    marginHorizontal: 12,
    marginVertical: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  row: {flexDirection: 'row', alignItems: 'center'},
  productImage: {width: 100, height: 100, borderRadius: 4},
  title: {fontSize: 16, fontWeight: 'bold', color: '#333'},
  category: {color: '#777', marginVertical: 4, fontSize: 12},
  price: {fontSize: 16, color: '#333'},
  mrp: {textDecorationLine: 'line-through', color: '#888'},
  accordionToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  accordionTitle: {fontWeight: 'bold', fontSize: 15, color: '#333'},
  orderDetailsContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  colorBoxesRow: {flexDirection: 'row', marginBottom: 20},
  colorBox: {
    width: 36,
    height: 36,
    borderRadius: 4,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedColorBox: {borderWidth: 2, borderColor: '#F36F25'},
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sizeText: {fontSize: 15, color: '#333', fontWeight: '500'},
  quantityCell: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
    justifyContent: 'flex-end',
  },
  quantityText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 2,
  },
  arrowButton: {padding: 8, backgroundColor: '#FEF0E8', borderRadius: 4},
  qtyPerColorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  summaryText: {fontSize: 14, color: '#333'},
  summaryValue: {fontSize: 14, color: '#333', fontWeight: '500'},
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {flex: 1, fontSize: 14, color: '#333'},
  totalValue: {flex: 1, fontSize: 14, color: '#333', fontWeight: '500'},
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  wishlistButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F36F25',
    borderRadius: 4,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  removeButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F36F25',
    borderRadius: 4,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  buttonText: {fontSize: 14, color: '#333', fontWeight: '500'},
  couponContainer: {
    backgroundColor: '#FDF6F1',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  couponAccordionToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {fontSize: 15, fontWeight: '500', color: '#333'},
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  couponInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  applyBtn: {
    backgroundColor: '#F36F25',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    backgroundColor: '#FF4444',
  },
  applyBtnText: {color: '#FFFFFF', fontWeight: '600', fontSize: 14},
  walletContainer: {
    backgroundColor: '#FDF6F1',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  walletTitle: {fontSize: 15, fontWeight: '500', color: '#333'},
  walletInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  balanceText: {fontSize: 13, color: '#666'},
  priceBox: {
    backgroundColor: '#FDF6F1',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
  },
  priceHeading: {
    fontWeight: 'bold',
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  priceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  priceLabel: {fontSize: 14, color: '#333'},
  priceValue: {fontSize: 14, color: '#333'},
  discountText: {color: '#28a745'},
  savingsText: {color: '#28a745', fontSize: 14, marginTop: 8},
  paymentMethod: {
    paddingHorizontal: 16,
    fontSize: 15,
    marginVertical: 8,
    color: '#333',
  },
  continueBtn: {
    backgroundColor: '#D6722F',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    left: 12,
    right: 12,
    borderRadius: 8,
  },
  continueText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
});

export default PartnerCartScreen;