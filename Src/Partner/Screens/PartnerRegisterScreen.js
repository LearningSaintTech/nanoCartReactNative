import React, {useState, useEffect} from 'react';
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
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import {useDispatch, useSelector} from 'react-redux';
import {setUserDetails} from '../../redux/reducers/authReducer';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { BASE_URL } from '../../config/apiConfig';
// import Icon from 'react-native-vector-icons/Ionicons';


const {width} = Dimensions.get('window');
const scaleFont = size => (width / 414) * size; // Scale font based on 414px reference (e.g., iPhone 11 Pro)
const scalePadding = size => (width / 414) * size;

const PartnerRegisterScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const user = useSelector(state => state.auth.user);
  const insets = useSafeAreaInsets();

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
  const [subscribe, setSubscribe] = useState(false);

  useEffect(() => {

    console.log("this is token",token)
    const fetchUserProfile = async () => {
      try {
        if (!token) return;
        const response = await fetch(`${BASE_URL}/auth/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok && data.success) {
          const {name, email, phoneNumber} = data.data;
          dispatch(setUserDetails({name, email, phoneNumber}));
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
    Alert.alert('Upload Shop Image', 'Choose an option', [
      {
        text: 'Camera',
        onPress: () => {
          launchCamera({mediaType: 'photo'}, response => {
            if (!response.didCancel && response.assets) {
              setImageShop(response.assets[0]);
            }
          });
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          launchImageLibrary({mediaType: 'photo'}, response => {
            if (!response.didCancel && response.assets) {
              setImageShop(response.assets[0]);
            }
          });
        },
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  // const handleRegister = async () => {
  //   console.log('Starting handleRegister');

  //   // Step 1: Validation
  //   console.log('Checking required fields...');
  //   if (!name || !email || !shopName || !shopAddress || !pan || !pincode) {
  //     console.warn('Validation failed');
  //     Alert.alert('Validation Error', 'Please fill all required fields');
  //     return;
  //   }

  //   // Step 2: FormData
  //   console.log('Creating FormData...');
  //   const formData = new FormData();
  //   formData.append('name', name);
  //   formData.append('email', email);
  //   formData.append('phoneNumber', phoneNumber);
  //   formData.append('shopName', shopName);
  //   formData.append('gstNumber', gst);
  //   formData.append('shopAddress', shopAddress);
  //   formData.append('panNumber', pan);
  //   formData.append('pincode', pincode);

  //   if (imageShop) {
  //     formData.append('imageShop', {
  //       uri: imageShop.uri,
  //       type: imageShop.type,
  //       name: imageShop.fileName || 'shop-image.jpg',
  //     });
  //   }

  //   // Step 3: API Call
  //   try {
  //     console.log('Sending registration request...');
  //     const res = await fetch(`${BASE_URL}/auth/partner/signup`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //       body: formData,
  //     });

  //     const data = await res.json();
  //     console.log('API Response:', data);

  //     if (res.ok && data.success) {
  //       const isVerified = data?.data?.isVerified;
  //       const isActive = data?.data?.isActive;
  //       const message = data.message;

  //       if (!isVerified || !isActive) {
  //         console.log(
  //           'Partner is not verified or not active. Awaiting admin approval.',
  //         );
  //         Alert.alert(
  //           'Success',
  //           `${message}\n\nPlease wait for admin approval before logging in.`,
  //         );
  //         return;
  //       } else {
  //         console.log('✅ Partner is verified and active. Navigating to Home.');
  //         Alert.alert('Success', 'Registration complete and approved!');
  //         navigation.navigate('PartnerHome');
  //       }
  //     } else {
  //       console.warn('Registration failed:', data.message);
  //       Alert.alert('Error', data.message || 'Something went wrong');
  //     }
  //   } catch (err) {
  //     console.error('Network Error:', err);
  //     Alert.alert('Error', 'Registration failed');
  //   }
  // };



  const handleRegister = async () => {
  console.log('Starting handleRegister');

  if (!name || !email || !shopName || !shopAddress || !pan || !pincode) {
    Alert.alert('Validation Error', 'Please fill all required fields');
    return;
  }

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

  try {
    console.log('Submitting with token:', token);
if (formData._parts) {
  console.log('FormData fields:');
  formData._parts.forEach(field => console.log(field[0], ':', field[1]));
}

    const res = await fetch(`${BASE_URL}/auth/partner/signup`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`, // ✅ include token
        // ❌ Do not include 'Content-Type' for multipart/form-data
      },
      body: formData,
    });

    const data = await res.json();
    console.log('API Response:', data);

    if (res.ok && data.success) {
      const isVerified = data?.data?.isVerified;
      const isActive = data?.data?.isActive;
      const message = data.message;

      if (!isVerified || !isActive) {
        Alert.alert(
          'Success',
          `${message}\n\nPlease wait for admin approval before logging in.`
        );
        return;
      }

      Alert.alert('Success', 'Registration complete and approved!');
      navigation.navigate('PartnerHome');
    } else {
      Alert.alert('Error', data.message || 'Something went wrong');
    }
  } catch (err) {
    console.error('Network Error:', err);
    Alert.alert('Error', 'Registration failed');
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <View
          style={[
            styles.headerContainer,
            {paddingTop: insets.top + scalePadding(10)},
          ]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="arrowleft" size={scaleFont(24)} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Register </Text>
          <Text style={styles.subtitle}>Looks like you are new here!</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#777"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, {color: '#aaa'}]}
            value={`${phoneNumber}`}
            editable={false}
            placeholder="Phone Number"
            placeholderTextColor="#777"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
          />
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setSubscribe(!subscribe)}>
              {subscribe ? (
                <Icon name="checksquare" size={scaleFont(18)} color="#D86427" />
              ) : (
                <Icon name="checksquareo" size={scaleFont(18)} color="#aaa" />
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              Email me for offers and updates.
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Shop Name*"
            placeholderTextColor="#777"
            value={shopName}
            onChangeText={setShopName}
          />

          <View style={styles.rowInputs}>
            <TextInput
              style={[styles.input, {flex: 1, marginRight: scalePadding(10)}]}
              placeholder="GST No."
              placeholderTextColor="#777"
              value={gst}
              onChangeText={setGst}
            />
            <TextInput
              style={[styles.input, {flex: 1}]}
              placeholder="PAN No.*"
              placeholderTextColor="#777"
              value={pan}
              onChangeText={setPan}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Shop Address*"
            placeholderTextColor="#777"
            value={shopAddress}
            onChangeText={setShopAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Pincode*"
            placeholderTextColor="#777"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="numeric"
          />

          <View
            style={[styles.uploadContainer, {marginBottom: scalePadding(20)}]}>
            <Text style={styles.uploadLabel}>Shop Image*</Text>
            <TouchableOpacity
              onPress={handleImagePick}
              style={styles.uploadButton}>
              <Text style={styles.uploadText}>Upload</Text>
              <Icon
                name="upload"
                size={scaleFont(16)}
                color="#fff"
                style={{marginLeft: scalePadding(5)}}
              />
            </TouchableOpacity>
          </View>

          {imageShop && (
            <Image
              source={{uri: imageShop.uri}}
              style={{
                width: scaleFont(100),
                height: scaleFont(100),
                marginTop: scalePadding(10),
                alignSelf: 'center',
                borderRadius: scalePadding(6),
              }}
            />
          )}

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}>
            <Text style={styles.registerButtonText}>REGISTER</Text>
            <Icon
              name="arrowright"
              size={scaleFont(18)}
              color="#fff"
              style={{marginLeft: scalePadding(8)}}
            />
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Having trouble logging in?{' '}
            <Text style={styles.whatsappText}>Whatsapp Us</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PartnerRegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: '#fff',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    paddingBottom: scalePadding(10),
    paddingHorizontal: scalePadding(20),
  },
  backButton: {
    width: scaleFont(30),
    height: scaleFont(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: scalePadding(25),
    paddingTop: scalePadding(80),
    backgroundColor: '#fff',
  },
  title: {
    fontSize: scaleFont(28),
    fontWeight: '600',
    fontFamily: 'QuicheSans-Medium', // Corrected font
    color: '#000',
    marginBottom: scalePadding(5),
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scalePadding(25),
  },
  checkbox: {
    marginRight: scalePadding(10),
  },
  checkboxLabel: {
    fontSize: scaleFont(14),
    color: '#555',
    fontFamily: 'Poppins-Regular',
  },

  subtitle: {
    fontSize: scaleFont(14),
    color: '#777',
    marginBottom: scalePadding(30),
    fontFamily: 'Poppins-Regular',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
    fontSize: scaleFont(16),
    paddingVertical: scalePadding(8),
    marginBottom: scalePadding(25),
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scalePadding(25),
  },
  registerButton: {
    flexDirection: 'row',
    backgroundColor: '#D86427',
    paddingVertical: scalePadding(14),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scalePadding(6),
    marginBottom: scalePadding(15),
  },
  registerButtonText: {
    color: '#fff',
    fontSize: scaleFont(16),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: scaleFont(12),
    color: '#444',
    textAlign: 'center',
    marginBottom: scalePadding(30),
    fontFamily: 'Poppins-Regular',
  },
  whatsappText: {
    color: '#D86427',
    fontWeight: '500',
  },
  uploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: scalePadding(15),
  },
  uploadLabel: {
    fontSize: scaleFont(15),
    color: '#444',
    fontFamily: 'Poppins-Regular',
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#D86427',
    paddingVertical: scalePadding(6),
    paddingHorizontal: scalePadding(14),
    borderRadius: scalePadding(5),
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    fontSize: scaleFont(14),
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
});
