import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Image,
  FlatList,
  Dimensions,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../../config/apiConfig';
const { width } = Dimensions.get('window');

const PartnerCarouselSlider = () => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categories, setCategories] = useState([]);
const navigation = useNavigation();

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${BASE_URL}/category`);
        const result = await response.json();
        if (result.success && result.data) {
          setCategories(result.data);
        } else {
          console.error('Failed to fetch categories:', result.message);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (categories.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % categories.length;
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, categories]);

  const renderItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        onError={(e) => console.error('Image load error:', e.nativeEvent.error)}
      />
      <View style={styles.overlay}>
        <Text style={styles.heading}>Embrace the{'\n'}Essence of India</Text>
        <Text style={styles.subheading}>{item.description}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PartnerSearch')}>
          <Text style={styles.buttonText}>Explore More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View>
      {categories.length > 0 ? (
        <>
          <FlatList
            ref={flatListRef}
            data={categories}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
          />
          <View style={styles.dotContainer}>
            {categories.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
    width: width,
    height: 550,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: 0.5,
    marginBottom: 12,
    fontFamily: 'System',
  },
  subheading: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 0,
    minWidth: 140,
  },
  buttonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  dotContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 6,
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 20,
    borderRadius: 3,
  },
  loadingContainer: {
    height: 550,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default PartnerCarouselSlider;