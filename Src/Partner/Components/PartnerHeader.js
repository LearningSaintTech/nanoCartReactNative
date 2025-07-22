import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { setCartItems } from '../../redux/reducers/cartSlice';
import { BASE_URL } from '../../config/apiConfig';

const PartnerHeader = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items, shallowEqual);
  const token = useSelector(state => state.auth.token);
  const [totalBalance, setTotalBalance] = useState(0);

  const scale = size => Math.min(Math.max(width / 375, 0.8), 1.2) * size;

  const totalCartCount = cartItems.reduce((sum, item) => {
    const count = item.orderDetails.reduce(
      (colorSum, colorObj) =>
        colorSum +
        colorObj.sizeAndQuantity.reduce(
          (sizeSum, s) => sizeSum + s.quantity,
          0,
        ),
      0,
    );
    return sum + count;
  }, 0);

  useFocusEffect(
    useCallback(() => {
      const fetchWalletData = async () => {
        if (!token) {
          console.log('No token found, skipping wallet fetch');
          return;
        }
        try {
          const response = await fetch(`${BASE_URL}/wallet`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          if (response.ok && data.success) {
            setTotalBalance(data.data.totalBalance);
          } else {
            console.error(
              'Failed to fetch wallet data:',
              data.message || 'Unknown error',
            );
          }
        } catch (error) {
          console.error('Error fetching wallet data:', error.message);
        }
      };

      const fetchCartData = async () => {
        if (!token) {
          console.log('No token found, skipping cart fetch');
          return;
        }
        try {
          console.log('Fetching cart data in PartnerHeader with token:', token);
          const response = await fetch(`${BASE_URL}/partner/cart`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          console.log('Cart API response in PartnerHeader:', JSON.stringify(data, null, 2));
          if (response.ok && data.success && Array.isArray(data.data.items)) {
            dispatch(setCartItems(data.data.items));
          } else {
            console.error('Failed to fetch cart data:', data.message || 'Unknown error');
            dispatch(setCartItems([]));
          }
        } catch (error) {
          console.error('Error fetching cart data:', error.message);
          dispatch(setCartItems([]));
        }
      };

      fetchWalletData();
      fetchCartData();
    }, [token, dispatch]),
  );

  const handleCartPress = () => {
    if (token) {
      navigation.navigate('PartnerCart');
    } else {
      navigation.navigate('Login', { fromScreen: 'PartnerHeader' });
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#fff' }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: scale(16),
          paddingVertical: scale(14),
          backgroundColor: '#fff',
          width: '100%',
          borderBottomWidth: 1,
          borderBottomColor: '#EEEEEE',
        }}>
        <View style={{ flex: 1, maxWidth: scale(150) }}>
          <Image
            source={require('../../assets/icon/logo.png')}
            style={{
              width: scale(130),
              height: scale(40),
              resizeMode: 'contain',
            }}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: scale(20),
            maxWidth: scale(200),
          }}>
          <Text
            style={{
              fontWeight: '500',
              fontSize: scale(16),
              color: '#333333',
              letterSpacing: scale(0.3),
            }}>
            INR 
            
            {/* {totalBalance.toFixed(2)} */}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PartnerSearch')}>
            <Image
              source={require('../../assets/icon/SearchIcon.png')}
              style={{
                width: scale(24),
                height: scale(24),
                resizeMode: 'contain',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCartPress}
            style={{ position: 'relative' }}>
            <Image
              source={require('../../assets/icon/CartIcon.png')}
              style={{
                width: scale(26),
                height: scale(26),
                resizeMode: 'contain',
              }}
            />
            {totalCartCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: scale(-6),
                  right: scale(-8),
                  backgroundColor: '#F36F25',
                  borderRadius: scale(10),
                  width: scale(18),
                  height: scale(18),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: scale(10),
                    fontWeight: 'bold',
                  }}>
                  {totalCartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PartnerHeader;