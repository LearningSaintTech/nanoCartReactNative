

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

  const PartnerAccountScreen = () => {
  const navigation = useNavigation();
  const token = useSelector(state => state.auth.token);
  const [partnerName, setPartnerName] = useState('');


  useEffect(() => {
    const fetchPartnerName = async () => {
      try {
        console.log(' Starting fetchPartnerName...');
        console.log(' Token:', token);
  
        const res = await fetch('http://192.168.1.20 :4000/api/auth/partner/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
  
        console.log(' Response status:', res.status);
  
        const data = await res.json();
        console.log(' Full Response JSON:', data);
  
        if (res.ok && data.success) {
          const name = data?.data?.partnerId?.name;
          console.log(' Extracted partner name:', name);
          setPartnerName(name || 'Partner');
        } else {
          console.warn(' Failed condition: res.ok && data.success', {
            resOk: res.ok,
            success: data.success,
            message: data.message,
          });
          Alert.alert('Error', 'Failed to fetch profile');
        }
      } catch (error) {
        console.error(' Exception while fetching partner profile:', error);
        Alert.alert('Error', 'Something went wrong');
      }
    };
  
    if (token) {
      console.log(' Token available, calling fetchPartnerName...');
      fetchPartnerName();
    } else {
      console.warn(' No token available in Redux');
    }
  }, [token]);
  
  


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../assets/Images/Backward.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>MY ACCOUNT</Text>
        <View style={{ flexDirection: 'row' }}>
          <Image
            source={require('../../assets/Images/SearchIcon.png')}
            style={styles.icon}
          />
          <Image
            source={require('../../assets/Images/CartIcon.png')}
            style={styles.icon}
          />
        </View>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={require('../../assets/Images/Group.png')}
          style={styles.logo}
        />
        <Text style={styles.greeting}>Hi, {partnerName}</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        {[
          { label: 'Profile', route: 'Profile' },
          { label: 'Order History', route: 'OrderConfirmation' },
          { label: 'Saved Address' },
          { label: 'My Wallet', route: 'PartnerWallet' },
          { label: 'Settings' },
          { label: 'Help Centre', route: 'PartnerCatalogue' },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => item.route && navigation.navigate(item.route)}
          >
            <Text style={styles.menuText}>{item.label}</Text>
            <Image
              source={require('../../assets/Images/arrowright.png')}
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        style={styles.logoutButton}
      >
        <Text style={styles.logoutText}>LOG OUT</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PartnerAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#000',
  },
  icon: {
    width: 20,
    height: 20,
    marginLeft: 15,
    tintColor: '#000',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 85,
    height: 85,
    marginRight: 15,
    borderRadius: 8,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '600',
    color: '#000',
  },
  menu: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  menuText: {
    fontSize: 15,
    color: '#000',
  },
  arrowIcon: {
    width: 15,
    height: 15,
    tintColor: '#999',
  },
  logoutButton: {
    backgroundColor: '#DB4E2D',
    paddingVertical: 12,
    marginHorizontal: 15,
    marginTop: 30,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
