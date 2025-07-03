

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Image,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../../config/apiConfig'; //

const CarouselSlider = () => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetch(`${BASE_URL}/category`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.data) {
          setCategories(data.data);
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      const interval = setInterval(() => {
        if (flatListRef.current) {
          const nextIndex = (currentIndex + 1) % categories.length;
          flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
          setCurrentIndex(nextIndex);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, categories]);

  const renderItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.heading}>
          Embrace the{'\n'}Essence of India
        </Text>
        <Text style={styles.subheading}>Try our Kurta Set Collections</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.buttonText}>Explore More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
    width: wp('100%'),
    height: hp('60%'),
    maxHeight: 600,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: hp('8%'),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  heading: {
    color: 'white',
    fontSize: wp('8%'),
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'serif',
    lineHeight: hp('5%'),
    marginBottom: hp('1.5%'),
  },
  subheading: {
    color: 'white',
    fontSize: wp('4%'),
    marginBottom: hp('3%'),
    textAlign: 'center',
    fontWeight: '400',
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('1%'),
  },
  buttonText: {
    color: 'Black',
    fontSize: wp('3.5%'),
    fontWeight: '500',
  },
  dotContainer: {
    position: 'absolute',
    bottom: hp('3%'),
    alignSelf: 'center',
    flexDirection: 'row',
  },
  dot: {
    height: hp('1%'),
    width: wp('2%'),
    backgroundColor: '#FFFFFF',
    borderRadius: wp('1%'),
    marginHorizontal: wp('1%'),
  },
  activeDot: {
    width: wp('6%'),
    backgroundColor: '#000000',
  },
});

export default CarouselSlider;