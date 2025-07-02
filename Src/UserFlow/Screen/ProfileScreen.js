import {
  StyleSheet,
  Image,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation=useNavigation();
  const token = useSelector(state => state.auth.token);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('📦 Fetching profile...');
        const response = await fetch('http://192.168.1.17:4000/api/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log('👤 Profile Data:', data);

        if (response.ok && data?.data) {
          setName(data.data.name || '');
          setEmail(data.data.email || '');
          setMobile(data.data.phoneNumber || '');
        } else {
          Alert.alert('Error', 'Failed to load profile');
        }
      } catch (err) {
        console.log(' Error fetching profile:', err);
        Alert.alert('Error', 'Something went wrong');
      }
    };

    if (token) {
      fetchProfile();
    } else {
      Alert.alert('Login Required', 'Please log in to view your profile');
      navigation.navigate('Login');
    }
  }, [token]);

  const handleSave = async () => {
    try {
      const payload = {
        name,
        email,
      };

      console.log(' Updating profile with:', payload);

      const response = await fetch('http://192.168.1.17:4000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log(' PUT Response:', data);

      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.navigate('Account'); // Navigate to MyAccount after saving
      } else {
        Alert.alert('Error', data.message || 'Update failed');
      }
    } catch (error) {
      console.log(' Error updating profile:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../../assets/Images/Back.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile</Text>
          <TextInput
            style={[styles.input, { color: '#000' }]}
            value={mobile}
            editable={false}
            placeholder="+91-"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email ID</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>SAVE CHANGES</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    marginTop:25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 20,
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 12,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    fontSize: 18,
    color: '#000',
    padding: 0,
    fontFamily: 'Poppins-Regular',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  saveButton: {
    backgroundColor: '#FF6B00',
    marginHorizontal: 24,
    paddingVertical: 16,
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 1,
  },
});
