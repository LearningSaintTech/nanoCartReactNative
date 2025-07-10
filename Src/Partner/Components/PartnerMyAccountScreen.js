import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/reducers/authReducer';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../config/apiConfig';

const PartnerMyAccountScreen = () => {
  const token = useSelector(state => state.auth.token);
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [name, setName] = useState('');

  // Calculate scaling factor based on reference width (e.g., 375 for iPhone SE)
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
  console.log('PartnerMyAccountScreen - Cart Items:', cartItems);
  console.log('PartnerMyAccountScreen - Total Cart Count:', totalCartCount);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BASE_URL}/auth/partner/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok && data?.data) {
          const d = data.data;
          const partner = d.partnerId || {};
          setName(partner.name || '');
        } else {
          Alert.alert('Error', 'Failed to load profile');
        }
      } catch (err) {
        Alert.alert('Error', 'Something went wrong');
        console.error(err);
      }
    };

    if (token) fetchProfile();
  }, [token]);

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace('Login');
  };

  const handleCartPress = () => {
    if (token) {
      navigation.navigate('PartnerCart');
    } else {
      navigation.navigate('Login', { fromScreen: 'PartnerMyAccountScreen' });
    }
  };

  const menuItems = [
    { label: 'Profile', route: 'PartnerProfile' },
    { label: 'Order History', route: 'PartnerOrderHistory' },
    { label: 'Saved Address', route: 'PartnerSavedAddress' },
    { label: 'My Wallet', route: 'PartnerWallet' },
    { label: 'Settings', route: 'Settings' },
    { label: 'Help Centre', route: 'HelpCentre' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>MY ACCOUNT</Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('PartnerSearch')}>
            <Image
              source={require('../../assets/icon/SearchIcon.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCartPress} style={{ position: 'relative' }}>
            <Image
              source={require('../../assets/icon/CartIcon.png')}
              style={styles.icon}
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

      <View style={styles.profileRow}>
        <Image
          source={require('../../assets/Images/Group.png')}
          style={styles.logo}
        />
        <Text style={styles.nameText}>Hi, {name || 'User'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuRow}
            onPress={() => navigation.navigate(item.route)}
          >
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Icon name="chevron-forward" size={14} color="#aaa" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PartnerMyAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#000',
    textTransform: 'uppercase',
    marginLeft: 8,
  },
  icon: {
    width: 22,
    height: 22,
    marginHorizontal: 6,
    resizeMode: 'contain',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 16,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  menuLabel: {
    fontSize: 14,
    color: '#000',
  },
  logoutBtn: {
    backgroundColor: '#f37022',
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});