
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import { setUserDetails } from '../../redux/reducers/authReducer';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const BackIcon = require('../../assets/Images/Backward.png');

const PartnerRegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [shopName, setShopName] = useState('');
  const [gst, setGst] = useState('');
  const [pan, setPan] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [imageShop, setImageShop] = useState(null);

  
const [pendingModalVisible, setPendingModalVisible] = useState(false);
const [partnerId, setPartnerId] = useState(null);
const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!token) return;

        const response = await fetch('http://192.168.1.17:4000/api/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok && data.success) {
          const { name, email, phoneNumber } = data.data;
          dispatch(setUserDetails({ name, email, phoneNumber }));
          setName(name);
          setEmail(email);
          setPhoneNumber(phoneNumber);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [dispatch, token]);

  const handleImagePick = () => {
    Alert.alert(
      'Upload Shop Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => {
            launchCamera({ mediaType: 'photo' }, (response) => {
              if (!response.didCancel && response.assets) {
                setImageShop(response.assets[0]);
              }
            });
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary({ mediaType: 'photo' }, (response) => {
              if (!response.didCancel && response.assets) {
                setImageShop(response.assets[0]);
              }
            });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };


  const handleRegister = async () => {
    console.log(' Starting handleRegister');
  
    // Step 1: Validation
    console.log('Checking required fields...');
    if (!name || !email || !shopName || !shopAddress || !pan || !pincode) {
      console.warn(' Validation failed');
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }
  
    // Step 2: FormData
    console.log(' Creating FormData...');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    formData.append('shopName', shopName);
    formData.append('gstNumber', gst);
    formData.append('shopAddress', shopAddress);
    formData.append('panNumber', pan);
    formData.append('pincode', pincode);
  
    if (imageShop) {
      formData.append('imageShop', {
        uri: imageShop.uri,
        type: imageShop.type,
        name: imageShop.fileName || 'shop-image.jpg',
      });
    }
  
    // Step 3: API Call
    try {
      console.log(' Sending registration request...');
      const res = await fetch('http://192.168.1.17:4000/api/auth/partner/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
  
      const data = await res.json();
      console.log(' API Response:', data);
  
      if (res.ok && data.success) {
       const isVerified = data?.data?.isVerified;
       const isActive = data?.data?.isActive;
       const message = data.message;

if (!isVerified || !isActive) {
  console.log(' Partner is not verified or not active. Awaiting admin approval.');
  Alert.alert(
    'Success',
    `${message}\n\nPlease wait for admin approval before logging in.`
  );
  return; // wait for admin, do NOT navigate
} else {
  console.log('✅ Partner is verified and active. Navigating to Home.');
  Alert.alert('Success', 'Registration complete and approved!');
  navigation.navigate('PartnerHome');
}

      } else {
        console.warn(' Registration failed:', data.message);
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error(' Network Error:', err);
      Alert.alert('Error', 'Registration failed');
    }
  };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={BackIcon} style={styles.backIcon} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Register</Text>
          <Text style={styles.subtitle}>Looks like you are new here!</Text>

          <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
          <TextInput style={[styles.input, { color: '#aaa' }]} value={`+91 - ${phoneNumber}`} editable={false} />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Shop Name*" value={shopName} onChangeText={setShopName} />

          <View style={styles.rowInputs}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder="GST No."
              value={gst}
              onChangeText={setGst}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="PAN No.*"
              value={pan}
              onChangeText={setPan}
            />
          </View>

          <TextInput style={styles.input} placeholder="Shop Address*" value={shopAddress} onChangeText={setShopAddress} />
          <TextInput style={styles.input} placeholder="Pincode*" value={pincode} onChangeText={setPincode} keyboardType="numeric" />

          <View style={[styles.uploadContainer, { marginBottom: 20 }]}>
            <Text style={styles.uploadLabel}>Shop Image*</Text>
            <TouchableOpacity onPress={handleImagePick} style={styles.uploadButton}>
              <Text style={styles.uploadText}>Upload</Text>
              <Icon name="upload" size={16} color="#fff" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>

          {imageShop && (
            <Image source={{ uri: imageShop.uri }} style={{ width: 100, height: 100, marginTop: 10, alignSelf: 'center' }} />
          )}

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>REGISTER</Text>
            <Icon name="arrowright" size={18} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Having trouble logging in? <Text style={styles.whatsappText}>Whatsapp Us</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PartnerRegisterScreen;

const styles = StyleSheet.create({
  container: { padding: 25, paddingTop: 60 },
  backButton: { position: 'absolute', top: 20, left: 20, zIndex: 99,marginTop:20 },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  title: { fontSize: 26, fontWeight: '600', fontFamily: 'serif', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#777', marginBottom: 30 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
    fontSize: 16,
    paddingVertical: 10,
    marginBottom: 25,
    color: '#000',
  },
  rowInputs: { flexDirection: 'row', marginBottom: 25 },
  registerButton: {
    flexDirection: 'row',
    backgroundColor: '#D86427',
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 15,
  },
  registerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerText: { fontSize: 12, color: '#444', textAlign: 'center', marginBottom: 20 },
  whatsappText: { color: '#D86427', fontWeight: '600' },
  uploadContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  uploadLabel: { fontSize: 14, color: '#444' },
  uploadButton: { flexDirection: 'row', backgroundColor: '#F28C38', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 5, alignItems: 'center' },
  uploadText: { color: '#fff', fontSize: 14 },
});
