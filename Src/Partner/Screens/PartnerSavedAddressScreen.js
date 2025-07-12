import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BASE_URL } from '../../config/apiConfig';
import { useFocusEffect } from '@react-navigation/native';

const PartnerSavedAddressScreen = ({ navigation }) => {
  const token = useSelector(state => state.auth.token);
  const insets = useSafeAreaInsets();
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [otherAddresses, setOtherAddresses] = useState([]);

  useFocusEffect(
  React.useCallback(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch(`${BASE_URL}/partner/address`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await response.json();
        console.log('Fetched addresses:', json);

        if (response.ok && json.addresses?.addressDetail?.length > 0) {
          const addresses = json.addresses.addressDetail;
          const defaultAddr = addresses.find(addr => addr.isDefault);
          const otherAddr = addresses.filter(addr => !addr.isDefault);

          setDefaultAddress(defaultAddr || null);
          setOtherAddresses(otherAddr);
        } else {
          setDefaultAddress(null);
          setOtherAddresses([]);
          console.error('No addresses found or invalid response:', json);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    if (token) {
      fetchAddresses();
    }
  }, [token])
);

  const renderAddressBox = (item) => (
    <TouchableOpacity
      key={item._id}
      style={styles.addressBox}
      onPress={() => {
        navigation.navigate('PartnerEdit', {
          addressId: item._id,
          address: item,
        });
      }}
    >
      <Text style={styles.nameText}>{item.name}</Text>
      <Text style={styles.addressText}>
        {item.addressLine1}, {item.addressLine2}, {item.cityTown}, {item.state}, {item.pincode}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PARTNER SAVED ADDRESSES</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {defaultAddress && (
          <>
            <Text style={styles.sectionTitle}>Default Address</Text>
            {renderAddressBox(defaultAddress)}
          </>
        )}

        {otherAddresses.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>More Addresses</Text>
            {otherAddresses.map(addr => renderAddressBox(addr))}
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('PartnerAddNewAddress')}
      >
        <Text style={styles.addButtonText}>ADD NEW ADDRESS</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default PartnerSavedAddressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#000',
    textTransform: 'uppercase',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#555',
  },
  addressBox: {
    backgroundColor: '#f7f7f7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#555',
  },
  addButton: {
    backgroundColor: '#f37022',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    width: Dimensions.get('window').width - 40,
    marginHorizontal: 20,
    borderRadius: 5, 
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});