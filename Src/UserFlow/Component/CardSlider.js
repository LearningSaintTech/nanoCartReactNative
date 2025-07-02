import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {BASE_URL} from '../../config/apiConfig';

const CardSlider = ({images}) => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/items`)
      .then(response => response.json())
      .then(data => {
        console.log('API Response:', data); // 👈 Correct logging here
        if (data.success && data.data && data.data.items) {
          setItems(data.data.items);
        } else {
          console.warn('Unexpected API structure:', data);
        }
      })
      .catch(error => {
        console.error('Error fetching items:', error);
      });
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.sliderContainer}
      contentContainerStyle={styles.contentContainer}>
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <View key={item._id} style={[styles.card, {width: wp('80%')}]}>
            <Image
              source={{uri: item.image}}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() =>
                  navigation.navigate('ProductDetail', {itemId: item._id})
                }>
                <Text style={styles.shopButtonText}>SHOP NOW</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.errorText}>No images to display</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    height: hp('60%'),
    maxHeight: 500,
  },
  contentContainer: {
    paddingLeft: wp('4%'),
    paddingRight: wp('4%'),
  },
  card: {
    height: hp('55%'),
    maxHeight: 460,
    marginRight: wp('3%'),
    borderRadius: wp('1%'),
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopButton: {
    marginTop: hp('12%'),
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.5%'),
    minWidth: wp('35%'),
    alignItems: 'center',
    backgroundColor: '#0000',
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  errorText: {
    color: 'red',
    padding: wp('3%'),
    fontSize: wp('4%'),
  },
});

export default CardSlider;
