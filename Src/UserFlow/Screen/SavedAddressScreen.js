import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../config/apiConfig';

const SavedAddressesScreen = ({ navigation }) => {
  const token = useSelector(state => state.auth.token);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [otherAddresses, setOtherAddresses] = useState([]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch(`${BASE_URL}/user/address`, {
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
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    if (token) {
      fetchAddresses();
    }
  }, [token]);

  const renderAddressBox = (item) => (
    <TouchableOpacity
      key={item._id}
      style={styles.addressBox}
      onPress={() => {
        navigation.navigate('edit', {
          addressId: item._id,   // ✅ This is the correct addressDetail._id
          address: item
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SAVED ADDRESSES</Text>
      </View>

      {/* Address List */}
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

      {/* Add New Address */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddNewAddress')}
      >
        <Text style={styles.addButtonText}>ADD NEW ADDRESS</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SavedAddressesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    marginTop:20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  content: { padding: 16, paddingBottom: 100 },
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
  nameText: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  addressText: { fontSize: 13, color: '#555' },
  addButton: {
    backgroundColor: '#f37022',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
