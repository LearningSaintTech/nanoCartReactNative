import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const PartnerHeader = () => {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();
  const cartItems = useSelector((state) => state.cart.items);
  const token = useSelector((state) => state.auth.token);

  // Calculate scaling factor based on a reference width (e.g., 375 for iPhone SE)
  const scale = (size) => (width / 375) * size;

  // Calculate total cart count
  const totalCartCount = cartItems.reduce((sum, item) => {
    const count = item.orderDetails.reduce(
      (colorSum, colorObj) =>
        colorSum + colorObj.sizeAndQuantity.reduce((sizeSum, s) => sizeSum + s.quantity, 0),
      0
    );
    return sum + count;
  }, 0);

  // Log for debugging
  console.log('PartnerHeader - Cart Items:', cartItems);
  console.log('PartnerHeader - Total Cart Count:', totalCartCount);

  const handleCartPress = () => {
    if (token) {
      navigation.navigate('PartnerCart');
    } else {
      navigation.navigate('Login', { fromScreen: 'PartnerHeader' });
    }
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      <SafeAreaView style={{ backgroundColor: '#fff', flex: 0 }}>
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
            minHeight: scale(60),
            // Additional padding for Android to avoid status bar overlap
            ...Platform.select({
              android: { paddingTop: StatusBar.currentHeight || scale(10) },
            }),
          }}
        >
          {/* Logo */}
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

          {/* Right side icons */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: scale(20),
              maxWidth: scale(200),
            }}
          >
            <Text
              style={{
                fontWeight: '500',
                fontSize: scale(16),
                color: '#333333',
                letterSpacing: scale(0.3),
              }}
            >
              $ 0.0
            </Text>

            <TouchableOpacity onPress={() => navigation.navigate('PartnerSearch')}>
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
              style={{ position: 'relative' }}
            >
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
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: scale(10),
                      fontWeight: 'bold',
                    }}
                  >
                    {totalCartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default PartnerHeader;