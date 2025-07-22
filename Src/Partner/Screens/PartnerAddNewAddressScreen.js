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
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BASE_URL } from '../../config/apiConfig';

const { width } = Dimensions.get('window');

const PartnerAddNewAddressScreen = () => {
  const insets = useSafeAreaInsets();
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
  }, [isEdit, editAddress]);

  const handleContinue = async () => {
    if (!token) {
      Alert.alert('Login Required', 'You must be logged in to save an address.', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('Login', {
              fromScreen: 'PartnerAddNewAddressScreen',
              actionAfterLogin: isEdit ? 'edit_address' : 'add_address',
            }),
        },
      ]);
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

    const url = isEdit
      ? `${BASE_URL}/partner/address/${addressId}`
      : `${BASE_URL}/partner/address/create`;

    try {
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        Alert.alert('Error', 'Invalid server response.');
        return;
      }

      if (response.ok) {
        Alert.alert('Success', isEdit ? 'Address updated!' : 'Address saved!');
        navigation.goBack(); 
      } 
      
      else {
        Alert.alert('Error', data.message || 'Failed to save address');
      }
    } catch (error) {
      const errorMessage = error.message.includes('401')
        ? 'Session expired. Please log in again.'
        : 'Something went wrong while saving the address.';
      Alert.alert('Error', errorMessage, [
        {
          text: 'OK',
          onPress: () => {
            if (errorMessage.includes('401')) {
              navigation.navigate('Login', {
                fromScreen: 'PartnerAddNewAddressScreen',
                actionAfterLogin: isEdit ? 'edit_address' : 'add_address',
              });
            }
          },
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ADD ADDRESS</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Name*</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" autoCapitalize="words" />

          <Text style={styles.label}>+91 - Mobile Number*</Text>
          <TextInput style={styles.input} value={mobileNumber} onChangeText={setMobileNumber} placeholder="Enter mobile number" keyboardType="phone-pad" maxLength={10} />

          <Text style={styles.label}>Email-id</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter email address" keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Pincode*</Text>
          <TextInput style={styles.input} value={pincode} onChangeText={setPincode} placeholder="Enter pincode" keyboardType="numeric" maxLength={6} />

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
          <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="Enter country" autoCapitalize="words" />

          <Text style={styles.label}>Type (Home / Work)*</Text>
          <TextInput style={styles.input} value={addressType} onChangeText={setAddressType} placeholder="Enter address type" autoCapitalize="words" />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.customCheckbox, isDefault && styles.customCheckboxChecked]}
              onPress={() => setIsDefault(!isDefault)}
            >
              {isDefault && <Icon name="check" size={16} color="#fff" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Set as default address</Text>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  rowInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    width: '48%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  customCheckboxChecked: {
    backgroundColor: '#F57C00',
    borderColor: '#F57C00',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  continueButton: {
    backgroundColor: '#F57C00',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PartnerAddNewAddressScreen;
