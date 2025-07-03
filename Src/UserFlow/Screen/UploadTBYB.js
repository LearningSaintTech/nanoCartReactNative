
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const UploadTBYB = () => {
  const route = useRoute();
  const { garmentImage, itemId, category, selectedColor } = route.params || {};
  const [selectedImage, setSelectedImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null); // Store base64 string
  const [modalVisible, setModalVisible] = useState(false);
  const [trialsLeft, setTrialsLeft] = useState(8); // Initial trials as per ProductDetailScreen
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generatedModalVisible, setGeneratedModalVisible] = useState(false);
  const API_KEY = 'fa-6uyMG6cRoh4c-o6CPGQYyxiRtUlGxNEbhhu0S';
  const BASE_URL = 'https://api.fashn.ai/v1';
  const TBYB_API_URL = '${BASE_URL}/user/tbyb';

  // Retrieve token from Redux store
  const token = useSelector((state) => state.auth.token);

  console.log('UploadTBYB: Component initialized with params:', {
    garmentImage,
    itemId,
    category,
    selectedColor,
    token: token ? `${token.slice(0, 10)}...` : 'No token',
  });

  const handleUpload = () => {
    console.log('handleUpload: Starting image picker');
    if (!garmentImage) {
      console.error('handleUpload: No garment image provided');
      Alert.alert('Error', 'Garment image not provided. Please try again.');
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: true, // Enable base64 to send to FASHN API
      quality: 0.95, // JPEG quality per FASHN best practices
      maxHeight: 2000, // Resize to max 2000px height
    };

    console.log('handleUpload: Image picker options:', options);

    launchImageLibrary(options, (response) => {
      console.log('handleUpload: Image picker response:', response);
      if (response.didCancel) {
        console.log('handleUpload: User cancelled image picker');
      } else if (response.errorCode) {
        console.error('handleUpload: ImagePicker Error:', {
          code: response.errorCode,
          message: response.errorMessage,
        });
        Alert.alert('Error', 'Failed to pick image. Please try again.');
      } else {
        const source = { uri: response.assets[0].uri };
        const base64 = response.assets[0].base64;
        console.log('handleUpload: Selected image URI:', source.uri);
        console.log('handleUpload: Base64 length:', base64?.length);
        if (!base64) {
          console.error('handleUpload: No base64 data in response');
          Alert.alert('Error', 'Failed to get image data. Please try again.');
          return;
        }
        setSelectedImage(source);
        setBase64Image(`data:image/jpeg;base64,${base64}`); // Add prefix
        setModalVisible(true);
      }
    });
  };

  const handleGenerate = async () => {
    console.log('handleGenerate: Starting generation process');
    if (!base64Image) {
      console.error('handleGenerate: No base64 image available');
      Alert.alert('Error', 'Please upload a full-body image.');
      return;
    }

    if (!garmentImage) {
      console.error('handleGenerate: No garment image provided');
      Alert.alert('Error', 'Garment image not available.');
      return;
    }

    if (trialsLeft <= 0) {
      console.error('handleGenerate: No trials left');
      Alert.alert('Error', 'No free trials left. Please purchase an item to reset credits.');
      return;
    }

    if (!token) {
      console.error('handleGenerate: No authentication token available');
      Alert.alert('Error', 'You are not authenticated. Please log in and try again.');
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    console.log('handleGenerate: Set isGenerating to true');

    const inputData = {
      model_image: base64Image, // Base64-encoded user image
      garment_image: garmentImage, // URL from ProductDetailScreen
      category: category || 'tops',
      segmentation_free: true,
      moderation_level: 'permissive',
      garment_photo_type: 'model', // Assume server images are on-model
      mode: 'balanced',
      seed: 42,
      num_samples: 1,
      output_format: 'jpeg',
      return_base64: false,
    };

    console.log('handleGenerate: API input data:', {
      model_image: `${base64Image.slice(0, 50)}... (length: ${base64Image.length})`,
      garment_image: garmentImage,
      category: inputData.category,
    });

    try {
      // Step 1: POST to /run endpoint
      console.log('handleGenerate: Sending POST to /run');
      const runResponse = await fetch(`${BASE_URL}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(inputData),
      });

      console.log('handleGenerate: /run response status:', runResponse.status);
      if (!runResponse.ok) {
        const errorText = await runResponse.text();
        console.error('handleGenerate: /run request failed:', errorText);
        throw new Error(`Run request failed: ${errorText}`);
      }

      const runData = await runResponse.json();
      console.log('handleGenerate: /run response data:', runData);
      if (runData.error) {
        console.error('handleGenerate: /run API error:', runData.error);
        throw new Error(runData.error.message || 'Failed to start prediction');
      }

      const predictionId = runData.id;
      console.log('handleGenerate: Prediction ID:', predictionId);

      // Step 2: Poll /status endpoint
      let pollCount = 0;
      while (true) {
        pollCount++;
        console.log(`handleGenerate: Polling /status (attempt ${pollCount})`);
        const statusResponse = await fetch(`${BASE_URL}/status/${predictionId}`, {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        });

        console.log('handleGenerate: /status response status:', statusResponse.status);
        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          console.error('handleGenerate: /status request failed:', errorText);
          throw new Error(`Status request failed: ${errorText}`);
        }

        const statusData = await statusResponse.json();
        console.log('handleGenerate: /status response data:', statusData);

        if (statusData.status === 'completed') {
          console.log('handleGenerate: Prediction completed, output:', statusData.output);
          const generatedImageUrl = statusData.output[0];
          setGeneratedImage({ uri: generatedImageUrl });
          setTrialsLeft(trialsLeft - 1);
          console.log('handleGenerate: Trials left updated:', trialsLeft - 1);

          // Step 3: Submit to TBYB API
          console.log('handleGenerate: Submitting to TBYB API');
          const tbybPayload = {
            images: [
              {
                itemId: itemId,
                tbybImageUrl: [generatedImageUrl],
              },
            ],
          };
          console.log('handleGenerate: TBYB API payload:', tbybPayload);

          const tbybResponse = await fetch(TBYB_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(tbybPayload),
          });

          console.log('handleGenerate: TBYB API response status:', tbybResponse.status);
          if (!tbybResponse.ok) {
            const errorText = await tbybResponse.text();
            console.error('handleGenerate: TBYB API request failed:', errorText);
            throw new Error(`TBYB API request failed: ${errorText}`);
          }

          const tbybData = await tbybResponse.json();
          console.log('handleGenerate: TBYB API response data:', tbybData);
          if (!tbybData.success) {
            console.error('handleGenerate: TBYB API error:', tbybData.message);
            throw new Error(tbybData.message || 'Failed to submit TBYB entry');
          }

          setIsGenerating(false);
          setModalVisible(false);
          setGeneratedModalVisible(true);
          break;
        } else if (['starting', 'in_queue', 'processing'].includes(statusData.status)) {
          console.log('handleGenerate: Status:', statusData.status);
          await new Promise(resolve => setTimeout(resolve, 3000)); // Poll every 3 seconds
        } else if (statusData.status === 'failed') {
          console.error('handleGenerate: Prediction failed:', statusData.error);
          throw new Error(statusData.error?.message || 'Generation failed');
        }
      }
    } catch (error) {
      console.error('handleGenerate: Error caught:', error.message, error.stack);
      Alert.alert('Error', `Failed to generate try-on: ${error.message}`);
      setIsGenerating(false);
    }
  };

  const handleChangePhoto = () => {
    console.log('handleChangePhoto: Opening modal to change photo');
    setGeneratedModalVisible(false);
    setModalVisible(true);
  };

  const handleShare = () => {
    console.log('handleShare: Share button pressed');
    Alert.alert('Share', 'Sharing functionality to be implemented.');
  };

  const handleAddToCart = () => {
    console.log('handleAddToCart: Add to cart button pressed', { itemId, selectedColor });
    Alert.alert('Success', 'Added to cart!');
    // TODO: Integrate with cart API
  };

  console.log('UploadTBYB: Render state:', {
    selectedImage: !!selectedImage,
    base64Image: base64Image?.slice(0, 50),
    modalVisible,
    trialsLeft,
    isGenerating,
    generatedModalVisible,
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Image
          source={require('../../assets/Images/uploadIcon.png')}
          style={styles.uploadIcon}
        />
        <Text style={styles.uploadText}>UPLOAD FROM GALLERY</Text>
      </TouchableOpacity>
      <View style={styles.instructions}>
        <Text style={styles.instructionItem}>• Use a well-lit environment for best accuracy.</Text>
        <Text style={styles.instructionItem}>• Wear form-fitting clothes for an accurate try-on experience.</Text>
        <Text style={styles.instructionItem}>• Upload full-body images for better results.</Text>
        <Text style={styles.instructionItem}>• Select a model with a similar body type if unsure about using your own image.</Text>
        <Text style={styles.instructionItem}>• Ensure your camera is stable for real-time try-on.</Text>
      </View>

      {/* Initial Modal for trial info and generate */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          console.log('Initial Modal: Closing modal');
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedImage && (
              <Image
                source={selectedImage}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>NOTE</Text>
              <Text style={styles.trialsText}>{trialsLeft}/10 Free Trials Left</Text>
              <Text style={styles.noteItem}>• On generating, 1 Free Trial will be deducted.</Text>
              <Text style={styles.noteItem}>• Credits reset after each purchase or at the start of each month.</Text>
            </View>
            {isGenerating ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="rgba(210, 105, 30, 1)" />
                <Text style={styles.generatingText}>GENERATING...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.generateButton, { opacity: trialsLeft === 0 ? 0.5 : 1 }]}
                onPress={handleGenerate}
                disabled={trialsLeft === 0}
              >
                <Text style={styles.generateText}>GENERATE</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                console.log('Initial Modal: Close button pressed');
                setModalVisible(false);
              }}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Generated Modal with options */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={generatedModalVisible}
        onRequestClose={() => {
          console.log('Generated Modal: Closing modal');
          setGeneratedModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                console.log('Generated Modal: Back button pressed');
                setGeneratedModalVisible(false);
              }}
            >
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.photoSelectedText}>TRY-ON RESULT</Text>
            {generatedImage && (
              <Image
                source={generatedImage}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareText}>📤 SHARE</Text>
            </TouchableOpacity>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.changeButton} onPress={handleChangePhoto}>
                <Text style={styles.changeText}>CHANGE PHOTO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                <Text style={styles.addToCartText}>🛒 ADD TO CART</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  uploadButton: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(210, 105, 30, 1)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
  },
  uploadIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  instructions: {
    marginTop: 20,
  },
  instructionItem: {
    fontSize: 14,
    color: '#000',
    marginVertical: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalImage: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  noteContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  noteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  trialsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DAA520',
    marginBottom: 10,
  },
  noteItem: {
    fontSize: 14,
    color: '#000',
    marginVertical: 2,
  },
  generateButton: {
    backgroundColor: 'rgba(210, 105, 30, 1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginBottom: 10,
  },
  generateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  closeButton: {
    backgroundColor: 'rgba(210, 105, 30, 1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loaderContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  generatingText: {
    color: 'rgba(210, 105, 30, 1)',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  backText: {
    fontSize: 20,
    color: 'rgba(210, 105, 30, 1)',
  },
  photoSelectedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  shareButton: {
    backgroundColor: 'rgba(210, 105, 30, 1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginBottom: 10,
    width: '100%',
  },
  shareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  changeButton: {
    backgroundColor: 'rgba(210, 105, 30, 1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    flex: 1,
    marginRight: 5,
  },
  changeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: 'rgba(210, 105, 30, 1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    flex: 1,
    marginLeft: 5,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default UploadTBYB;