import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const CustomCheckbox = ({ checked, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.checkbox, checked && styles.checkboxChecked]} 
      onPress={onPress}
    >
      {checked && (
        <Icon name="check" size={14} color="#fff" />
      )}
    </TouchableOpacity>
  );
};

const AddNewAddressScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const token = useSelector(state => state.auth.token);

  const isEdit = route?.params?.isEdit || false;
  const addressId = route?.params?.addressId; 
  const editAddress = route?.params?.address || {};

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
    if (isEdit && editAddress) {
      console.log(' Prefilling address data:', editAddress);
      setName(editAddress.name || '');
      setMobileNumber(editAddress.phoneNumber || '');
      setEmail(editAddress.email || '');
      setPincode(editAddress.pincode || '');
      setAddressLine1(editAddress.addressLine1 || '');
      setAddressLine2(editAddress.addressLine2 || '');
      setCity(editAddress.cityTown || '');
      setState(editAddress.state || '');
      setCountry(editAddress.country || '');
      setAddressType(editAddress.addressType || '');
      setIsDefault(editAddress.isDefault || false);
    }
  }, []);

  const handleContinue = async () => {
    console.log(' handleContinue called. isEdit:', isEdit);
    if (!token) {
      console.log(' No token found.');
      Alert.alert('Error', 'You must be logged in.');
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
      isDefault,
    };

    console.log(isEdit ? ' Editing Address:' : '➕ Creating Address:', payload);

    const url = isEdit
      ? `http://192.168.1.17:4000/api/user/address/${addressId}` //  use addressId
      : 'http://192.168.1.17:4000/api/user/address/create';

    try {
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST', //  PUT for edit, POST for create
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      console.log('📜 Raw API Response Text:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.log(' Error parsing response:', parseError);
        Alert.alert('Error', 'Invalid server response.');
        return;
      }

      console.log(' API Response JSON:', data);

      if (response.ok) {
        Alert.alert('Success', isEdit ? 'Address updated!' : 'Address saved!');
        navigation.navigate('Delivery');
      } else {
        Alert.alert('Error', data.message || 'Failed to save address');
      }
    } catch (error) {
      console.log(' Error while saving address:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ADD NEW ADDRESS</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <TextInput 
              style={styles.input} 
              value={name} 
              onChangeText={setName} 
              placeholder="Name*"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput 
              style={styles.input} 
              value={mobileNumber} 
              onChangeText={setMobileNumber} 
              placeholder="+91 - Mobile Number*"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail} 
              placeholder="Email-id"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput 
              style={styles.input} 
              value={pincode} 
              onChangeText={setPincode} 
              placeholder="Pincode*"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput 
              style={styles.input} 
              value={addressLine1} 
              onChangeText={setAddressLine1} 
              placeholder="Address Line 1*"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput 
              style={styles.input} 
              value={addressLine2} 
              onChangeText={setAddressLine2} 
              placeholder="Address Line 2"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, { width: '48%' }]}>
              <TextInput 
                style={styles.input} 
                value={city} 
                onChangeText={setCity} 
                placeholder="City/Town*"
                placeholderTextColor="#999"
              />
            </View>
            <View style={[styles.inputGroup, { width: '48%' }]}>
              <TextInput 
                style={styles.input} 
                value={state} 
                onChangeText={setState} 
                placeholder="State*"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <TextInput 
              style={styles.input} 
              value={country} 
              onChangeText={setCountry} 
              placeholder="Country*"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput 
              style={styles.input} 
              value={addressType} 
              onChangeText={setAddressType} 
              placeholder="Type (Home / Work)*"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.checkboxContainer}>
            <CustomCheckbox 
              checked={isDefault}
              onPress={() => setIsDefault(!isDefault)}
            />
            <Text style={styles.checkboxLabel}>It's my default address.</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>CONTINUE</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddNewAddressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    marginTop:20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  required: {
    color: '#FF6B00',
    fontWeight: '500',
  },
  prefix: {
    color: '#666',
  },
  input: {
    fontSize: 16,
    color: '#000',
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 12,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  continueButton: {
    backgroundColor: '#FF6B00',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderRadius: 4,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
