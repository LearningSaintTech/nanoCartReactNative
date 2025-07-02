
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';

const EditScreen = ({ route, navigation }) => {
  const token = useSelector((state) => state.auth.token);
  const { address, addressId } = route.params;
  const mainAddressId = useSelector((state) => state.auth.user?._id); // fix: use `user._id`

  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [addressType, setAddressType] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (address) {
      setName(address.name || '');
      setMobileNumber(address.phoneNumber || '');
      setEmail(address.email || '');
      setPincode(address.pincode || '');
      setAddressLine1(address.addressLine1 || '');
      setAddressLine2(address.addressLine2 || '');
      setCity(address.cityTown || '');
      setState(address.state || '');
      setCountry(address.country || '');
      setAddressType(address.addressType || '');
      setIsDefault(address.isDefault || false);
    }
  }, [address]);

  const handleSave = async () => {
    if (!name || !mobileNumber || !pincode || !addressLine1 || !city || !state || !country || !addressType) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
  
    const payload = {
      name,
      phoneNumber: mobileNumber,
      email,
      pincode,
      addressLine1,
      addressLine2,
      cityTown: city,
      state,
      country,
      addressType,
      isDefault
    };
  
    try {
      const res = await fetch(`http://192.168.1.20 :4000/api/user/address/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)  // ✅ Pass payload directly
      });
  
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Address updated successfully.');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Failed to update address');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
      console.error(error);
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EDIT ADDRESS</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Name*</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" />

          <Text style={styles.label}>+91 - Mobile Number*</Text>
          <TextInput style={styles.input} value={mobileNumber} onChangeText={setMobileNumber} placeholder="Enter mobile number" keyboardType="phone-pad" />

          <Text style={styles.label}>Email-id</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter email address" keyboardType="email-address" />

          <Text style={styles.label}>Pincode*</Text>
          <TextInput style={styles.input} value={pincode} onChangeText={setPincode} placeholder="Enter pincode" keyboardType="numeric" />

          <Text style={styles.label}>Address Line 1*</Text>
          <TextInput style={styles.input} value={addressLine1} onChangeText={setAddressLine1} placeholder="Enter address line 1" />

          <Text style={styles.label}>Address Line 2</Text>
          <TextInput style={styles.input} value={addressLine2} onChangeText={setAddressLine2} placeholder="Enter address line 2 (optional)" />

          <View style={styles.rowInput}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>City/Town*</Text>
              <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Enter city/town" />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>State*</Text>
              <TextInput style={styles.input} value={state} onChangeText={setState} placeholder="Enter state" />
            </View>
          </View>

          <Text style={styles.label}>Country*</Text>
          <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="Enter country" />

          <Text style={styles.label}>Type (Home / Work)*</Text>
          <TextInput style={styles.input} value={addressType} onChangeText={setAddressType} placeholder="Enter address type" />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.customCheckbox, isDefault && styles.customCheckboxChecked]}
              onPress={() => setIsDefault(!isDefault)}
            >
              {isDefault && <Icon name="check" size={16} color="#fff" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>It's my default address.</Text>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleSave}>
            <Text style={styles.continueText}>SAVE ADDRESS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    marginTop: 25, flexDirection: 'row', alignItems: 'center',
    padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  scrollView: { flex: 1 },
  formContainer: { padding: 15 },
  label: { fontSize: 14, color: '#333', marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 5,
    padding: 10, marginBottom: 15, fontSize: 14,
  },
  rowInput: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  customCheckbox: {
    width: 20, height: 20, borderWidth: 1,
    borderColor: '#ccc', borderRadius: 4,
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  customCheckboxChecked: {
    backgroundColor: '#F57C00',
    borderColor: '#F57C00',
  },
  checkboxLabel: { fontSize: 14, color: '#333' },
  continueButton: {
    backgroundColor: '#F57C00', padding: 15,
    borderRadius: 5, alignItems: 'center',
  },
  continueText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
