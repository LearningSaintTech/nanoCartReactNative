import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const Header = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const cartItems = useSelector(state => state.cart.items);
  const token = useSelector(state => state.auth.token);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCartPress = () => {
    if (token) {
      navigation.navigate('Cart');
    } else {
      navigation.navigate('Login', { fromScreen: 'Header' });
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#fff' }}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View
        style={{
          marginTop:20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: wp('4%'),
          paddingVertical: hp('2%'),
          backgroundColor: '#fff',
          width,
          borderBottomWidth: 1,
          borderBottomColor: '#EEEEEE',
        }}
      >
        {/* Logo */}
        <Image
          source={require('../../assets/icon/logo.png')}
          style={{ width: wp('30%'), height: hp('4%'), resizeMode: 'contain' }}
        />
        {/* Right icons */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ 
            marginRight: wp('4%'), 
            fontWeight: '600', 
            fontSize: wp('4%'),
            color: '#000000'
          }}>₹ INR</Text>

          {/* Search Icon */}
          <TouchableOpacity 
            style={{ marginRight: wp('4%') }} 
            onPress={() => navigation.navigate('Search')}
          >
            <Image
              source={require('../../assets/icon/SearchIcon.png')}
              style={{ width: wp('6%'), height: wp('6%'), resizeMode: 'contain' }}
            />
          </TouchableOpacity>

          {/* Cart Icon with Badge */}
          <TouchableOpacity 
            onPress={handleCartPress} 
            style={{ position: 'relative', marginLeft: wp('1%') }}
          >
            <Image
              source={require('../../assets/icon/CartIcon.png')}
              style={{ width: wp('6%'), height: wp('6%'), resizeMode: 'contain' }}
            />

            {/* Badge */}
            {totalCartCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: -hp('1%'),
                  right: -wp('2%'),
                  backgroundColor: '#F36F25',
                  borderRadius: wp('5%'),
                  width: wp('4.5%'),
                  height: wp('4.5%'),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: wp('2.5%'), fontWeight: 'bold' }}>
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

export default Header;