import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useSelector} from 'react-redux';
import {BASE_URL} from '../../config/apiConfig';
import Icon2 from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

const RateProductScreen = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [image, setImage] = useState(null);

  const token = useSelector(state => state.auth.token);
  console.log('Token from Redux:', token);

  const handleImageUpload = () => {
    console.log('Opening image picker...');
    Alert.alert(
      'Upload Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => {
            console.log('Camera selected');
            launchCamera({mediaType: 'photo'}, response => {
              if (!response.didCancel && !response.errorCode) {
                console.log('Camera image response:', response);
                setImage(response.assets[0]);
              }
            });
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            console.log('Gallery selected');
            launchImageLibrary({mediaType: 'photo'}, response => {
              if (!response.didCancel && !response.errorCode) {
                console.log('Gallery image response:', response);
                setImage(response.assets[0]);
              }
            });
          },
        },
        {text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  const renderStars = () => {
    return [...Array(5)].map((_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => {
          console.log(`Rating selected: ${index + 1}`);
          setRating(index + 1);
        }}>
        <Icon
          name="star"
          size={26}
          color={index < rating ? '#f7a600' : '#ccc'}
          style={styles.star}
        />
      </TouchableOpacity>
    ));
  };

  const handleSubmit = async () => {
    console.log(' Submit button pressed');
    console.log(' Rating:', rating);
    console.log(' Feedback:', feedback);
    console.log(' Image object:', image);
    console.log(' Token:', token);

    const formData = new FormData();
    formData.append('rating', rating.toString());
    formData.append('sizeBought', 'M'); // static for now
    formData.append('itemId', '68063593070d8264e0b8e85a'); // static for now
    formData.append('review', 'Please share your valuable feedback.');

    if (image) {
      formData.append('customerProductImage', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || 'upload.jpg',
      });
    }

    try {
      const response = await fetch(`${BASE_URL}/user/ratingreview/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // ✅ Do NOT add 'Content-Type' manually here
        },
        body: formData,
      });

      const result = await response.json();
      console.log('✅ API Response:', result);

      if (response.ok) {
        Alert.alert('Success', 'Thanks for your review!');
      } else {
        Alert.alert('Error', result.message || 'Submission failed');
      }
    } catch (error) {
      console.log(' Submission error:', error.message);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon2 name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>RATE PRODUCT</Text>
      </View>

      <Text style={styles.orderId}>Order ID: #11456600</Text>

      <View style={styles.card}>
        <Image
          source={require('../../assets/Images/Carosuel1.png')}
          style={styles.productImage}
        />
        <View style={{flex: 1, marginLeft: 10}}>
          <Text style={styles.productName}>MAAHI T-shirt</Text>
          <Text style={styles.productCategory}>Active Wear Collections</Text>
          <Text style={styles.label}>
            Size: <Text style={styles.value}>M</Text>
          </Text>
          <Text style={styles.label}>
            Color: <Text style={styles.value}>●</Text>
          </Text>
          <Text style={styles.strikePrice}>
            MRP ₹1499.00 <Text style={styles.salePrice}>₹1100.00</Text>
          </Text>
        </View>
      </View>

      <Text style={styles.ratingLabel}>How did you like our product?</Text>
      <View style={styles.starsRow}>{renderStars()}</View>

      <Text style={styles.feedbackLabel}>
        Please share your valuable feedback.
      </Text>
      <TextInput
        style={styles.textArea}
        multiline
        maxLength={500}
        placeholder="(Max 500 words)"
        value={feedback}
        onChangeText={setFeedback}
      />

      <Text style={styles.uploadPrompt}>
        Help us know your experience better.
      </Text>
      {/* <TouchableOpacity onPress={handleImageUpload} style={styles.uploadBox}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
        ) : (
          <>
            <Image source={require('../../assets/Images/Camera.png')} style={styles.uploadIcon} />
            <Text style={styles.uploadText}>Upload Image/Video</Text>
          </>
        )}
      </TouchableOpacity> */}

      <TouchableOpacity onPress={handleImageUpload} style={styles.uploadBox}>
        {image ? (
          <Image source={{uri: image.uri}} style={styles.uploadedImage} />
        ) : (
          <>
            <Icon2
              name="camera-outline"
              size={32}
              color="#999"
              style={styles.uploadIcon}
            />
            <Text style={styles.uploadText}>Upload Image/Video</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>SUBMIT</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RateProductScreen;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#fff'},
  header: {flexDirection: 'row', alignItems: 'center', marginTop: 25, gap: 10},
  backIcon: {width: 22, height: 22, marginRight: 10, marginBottom: 30},
  title: {fontWeight: 'bold', fontSize: 16},
  orderId: {fontWeight: 'bold', fontSize: 13, marginVertical: 6},
  card: {
    backgroundColor: '#fdf2ec',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    marginVertical: 10,
  },
  productImage: {width: 60, height: 80, borderRadius: 4},
  productName: {fontWeight: 'bold', fontSize: 14},
  productCategory: {fontSize: 12, color: '#888', marginVertical: 2},
  label: {fontSize: 12},
  value: {fontWeight: 'bold', color: '#f37022'},
  strikePrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    color: '#aaa',
    marginTop: 4,
  },
  salePrice: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  ratingLabel: {fontSize: 14, marginTop: 16, fontWeight: 'bold'},
  starsRow: {flexDirection: 'row', marginVertical: 8},
  star: {marginRight: 8},
  feedbackLabel: {fontSize: 13, marginVertical: 8},
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    height: 100,
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  uploadPrompt: {fontSize: 13, marginVertical: 12},
  uploadBox: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadIcon: {width: 32, height: 32, marginBottom: 6, tintColor: '#999'},
  uploadText: {fontSize: 12, color: '#999'},
  uploadedImage: {width: '100%', height: '100%', borderRadius: 8},
  submitButton: {
    backgroundColor: '#f37022',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {color: '#fff', fontWeight: 'bold'},
});
