import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  CheckBox,
} from 'react-native';

const NewAddressScreen = () => {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    addressType: '',
    isDefault: false,
  });

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleContinue = () => {
    // Handle form submission logic here
    console.log('Form Data:', form);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.title}>ADD NEW ADDRESS</Text>

      {[
        { label: 'Name*', name: 'name' },
        { label: '+91 - Mobile Number*', name: 'mobile', keyboardType: 'phone-pad' },
        { label: 'Email-id', name: 'email', keyboardType: 'email-address' },
        { label: 'Pincode*', name: 'pincode', keyboardType: 'number-pad' },
        { label: 'Address Line 1*', name: 'addressLine1' },
        { label: 'Address Line 2', name: 'addressLine2' },
        { label: 'City/Town*', name: 'city' },
        { label: 'State*', name: 'state' },
        { label: 'Country*', name: 'country' },
        { label: 'Type (Home / Work)*', name: 'addressType' },
      ].map((field, index) => (
        <TextInput
          key={index}
          placeholder={field.label}
          keyboardType={field.keyboardType || 'default'}
          value={form[field.name]}
          onChangeText={(text) => handleChange(field.name, text)}
          style={styles.input}
          placeholderTextColor="#888"
        />
      ))}

      <View style={styles.checkboxContainer}>
        <CheckBox
          value={form.isDefault}
          onValueChange={() => handleChange('isDefault', !form.isDefault)}
        />
        <Text style={styles.checkboxLabel}>It’s my default address.</Text>
      </View>

      <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
        <Text style={styles.continueText}>CONTINUE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default NewAddressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    color: '#000',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 16,
    paddingVertical: 6,
    fontSize: 14,
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  continueBtn: {
    backgroundColor: '#f58220',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 16,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
