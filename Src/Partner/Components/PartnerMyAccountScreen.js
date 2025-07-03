import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/reducers/authReducer';
import { useNavigation } from '@react-navigation/native';

const PartnerMyAccountScreen = () => {
  const token = useSelector(state => state.auth.token);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('${BASE_URL}/auth/profile', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok && json?.data?.name) {
          setName(json.data.name);
        }
      } catch (err) {
        console.log('Failed to fetch profile:', err);
      }
    };

    if (token) fetchProfile();
  }, [token]);

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace('Login');
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/icon/BackIcon.png')} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.title}> MY ACCOUNT </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity>
            <Image source={require('../../assets/Images/SearchIcon.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={require('../../assets/Images/Cart.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Row */}
      <View style={styles.profileRow}>
        <Image source={require('../../assets/Images/Group.png')} style={styles.logo} />
        <Text style={styles.nameText}>Hi, {name || 'User'}</Text>
      </View>

      {/* Menu Options */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuRow}
            onPress={() => navigation.navigate(item.route)}
          >
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Image source={require('../../assets/Images/arrowright.png')} style={styles.arrowIcon} />
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#000',
  },
  icon: {
    width: 22,
    height: 22,
    marginHorizontal: 6,
    resizeMode: 'contain',
  },
  headerRight: {
    flexDirection: 'row',
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
  arrowIcon: {
    width: 14,
    height: 14,
    tintColor: '#aaa',
    resizeMode: 'contain',
  },
  logoutBtn: {
    backgroundColor: '#f37022',
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
