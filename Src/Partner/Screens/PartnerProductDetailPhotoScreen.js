import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const PartnerProductDetailPhotoScreen = () => {
  const route = useRoute();
  const { images } = route.params || {};

  const [mainImage, setMainImage] = useState(null);
  const [activeThumbnail, setActiveThumbnail] = useState(0);

  useEffect(() => {
    if (images && images.length > 0) {
      setMainImage({ uri: images[0].url });
    }
  }, [images]);

  const handleThumbnailPress = (imageUrl, index) => {
    setMainImage({ uri: imageUrl });
    setActiveThumbnail(index);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Heading added here */}
      <Text style={styles.heading}>Partner Photo</Text>

      <View style={styles.mainImageContainer}>
        <Image source={mainImage} style={styles.mainImage} resizeMode="contain" />
      </View>

      <View style={styles.thumbnailsContainer}>
        {images.map((img, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleThumbnailPress(img.url, index)}
            style={[
              styles.thumbnailContainer,
              activeThumbnail === index && styles.activeThumbnail,
            ]}
          >
            <Image source={{ uri: img.url }} style={styles.thumbnail} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  mainImageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainImage: {
    width: width - 40,
    height: 400,
    borderRadius: 8,
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  thumbnailContainer: {
    width: (width - 60) / 4,
    height: (width - 60) / 4,
    borderRadius: 5,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  activeThumbnail: {
    borderWidth: 2,
    borderColor: '#ff6200',
  },
});

export default PartnerProductDetailPhotoScreen;
