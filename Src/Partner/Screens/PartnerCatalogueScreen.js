import React from 'react';
import {
  TouchableWithoutFeedback,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../UserFlow/Component/Header';
import AccordionItem from '../../UserFlow/Component/AccordionItem';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon1 from 'react-native-vector-icons/AntDesign';

import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');

const PartnerCatalogueScreen = () => {
  const navigation = useNavigation();

  const images = [
    require('../../assets/Images/Carosuel1.png'),
    require('../../assets/Images/Carosuel1.png'), 
     require('../../assets/Images/Carosuel1.png'), 
      require('../../assets/Images/Carosuel1.png'),
      require('../../assets/Images/Carosuel1.png'),
  ];

  const customerPhotos = [
    require('../../assets/Images/Carosuel1.png'),
    require('../../assets/Images/Carosuel1.png'),
    require('../../assets/Images/Carosuel1.png'),
    require('../../assets/Images/Carosuel1.png'),
  ];

  const customerReviews = [
    {
      name: 'Adyasha Shetty',
      rating: 4.8,
      date: '2 weeks ago',
      size: 'L',
      text: "I absolutely love this saree, the quality and price is top notch. I must say, I'm impressed. The fit is just perfect making it ideal for all festivities. Go for it!",
    },
    {
      name: 'Rehman Siddiqui',
      rating: 4.5,
      date: '1 month ago',
      size: 'M',
      text: 'Awesome product, good quality, comfortable size, cloth texture, exact color shown in the app. Value for money.',
    },
    {
      name: 'Muskan Agarwal',
      rating: 4.3,
      date: '2 months ago',
      size: 'S',
      text: 'Ordered this saree for my sister, she looks super cool in this. Thanks for the quick delivery.',
    },
  ];

  // Suggestion images from local assets
  const suggestionImages = [
    require('../../assets/Images/Carosuel1.png'),
    require('../../assets/Images/Carosuel1.png'),
    require('../../assets/Images/Carosuel1.png'),
    require('../../assets/Images/Carosuel1.png'),
  ];

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}>
        {/* Image Section */}

        <View style={styles.imageSection}>
          <TouchableWithoutFeedback
            onPress={() => navigation.navigate('ProductDetailPhoto')}>
            <Image
              source={images[0]}
              style={styles.mainImage}
              resizeMode="cover"
            />
          </TouchableWithoutFeedback>
          <ScrollView
            style={styles.sideImages}
            contentContainerStyle={styles.sideImagesContainer}
            showsVerticalScrollIndicator={true}>
            {images.slice(1).map((img, idx) => (
              <Image
                key={idx}
                source={img}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>

        {/* Colors + Share */}
        <View style={styles.colorsRow}>
          <Text style={styles.colorsText}>Colors</Text>
          <View style={styles.shareContainer}>
            <Text style={styles.shareText}>
              Catalogue{' '}
              <Icon1
                name="<DownloadOutlined />"
                size={16}
                color="#fff"
                style={{marginLeft: 20}}
              />
            </Text>
          </View>
        </View>

        {/* Color Boxes */}
        <View style={styles.colors}>
          {['green', 'red', 'black', 'navy', 'gold'].map((color, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.colorBox, {backgroundColor: color}]}
            />
          ))}
        </View>

        {/* Product Info */}
        <View style={styles.details}>
          <Text style={styles.title}>
            MAAHI Popular: Georgette Saree in Red
          </Text>
          <Text style={styles.subTitle}>Party Wear Collections</Text>

          <View style={styles.priceRow}>
            <Text style={styles.strikeThrough}>₹1550.00</Text>
            <Text style={styles.price}> ₹1100.00</Text>
            <Text style={styles.discount}>(33% off)</Text>
          </View>
          <Text style={styles.delivery}>
            Fastest 2–3 days delivery to 100+ pincodes
          </Text>
        </View>

        <View style={styles.priceSizeSection}>
          <View style={styles.sizeRow}>
            <Text style={styles.sizeText}>Select a size</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SizeChart')}>
              <Text style={styles.sizeChartText}>SIZE CHART</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sizeOptions}>
            {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map((size, idx) => (
              <TouchableOpacity key={idx} style={styles.sizeBox}>
                <Text style={styles.sizeBoxText}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Accordion Items */}
        <AccordionItem title="About the Product">
          <Text>Product ID: S2398637</Text>
          <Text>
            Crew neck with an attached hood, Adjustable hood with drawcord, A
            Oversized fit with long sleeves, A spacious kangaroo pocket on the
            front
          </Text>
          <Text>Material: 60% Cotton 40% Poly | 280 GSM Fleece</Text>
          <Text>
            Care: Machine wash according to instructions on the care label.
          </Text>
          <Text style={{fontStyle: 'italic'}}>
            Style Note: You can’t go wrong with a classic hoodie! Dress it up
            with a pair of denims or dress it down with a pair of joggers.
          </Text>
        </AccordionItem>

        <AccordionItem title="Check Delivery at Your Pincode">
          <Text>
            Enter your pincode to check delivery options and estimated time.
          </Text>
        </AccordionItem>

        <AccordionItem title="Return Policies">
          <Text>
            Easy return within 7 days of delivery. Product must be unused and
            with all tags intact.
          </Text>
        </AccordionItem>

        <AccordionItem title="Ratings & Reviews">
          <View style={styles.ratingContainer}>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingValue}>4.5</Text>
              {[...Array(4)].map((_, index) => (
                <Icon
                  key={index}
                  name="star"
                  size={16}
                  color="#F57C00"
                  style={styles.starIcon}
                />
              ))}
              <Icon name="star-half-empty" size={16} color="#F57C00" />
            </View>
            <View style={styles.ratingTextRow}>
              <Text style={styles.ratingText}>121 Ratings</Text>
              <Text style={styles.dot}> | </Text>
              <Text style={styles.ratingText}>59 Reviews</Text>
            </View>
          </View>
        </AccordionItem>

        {/* Customer Photos Section */}
        <View style={styles.customerPhotosSection}>
          <Text style={styles.customerPhotosTitle}>Customer Photos</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.customerPhotosContainer}>
            {customerPhotos.map((photo, index) => (
              <View key={index} style={styles.photoCard}>
                <Image
                  source={photo}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Customer Says Section */}
        <View style={styles.customerSaysSection}>
          <Text style={styles.customerSaysTitle}>Customer Says</Text>
          {customerReviews.map((review, index) => (
            <View key={index} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingValue}>{review.rating}</Text>
                  {[...Array(Math.floor(review.rating))].map((_, i) => (
                    <Icon
                      key={i}
                      name="star"
                      size={14}
                      color="#F57C00"
                      style={styles.starIcon}
                    />
                  ))}
                  {review.rating % 1 !== 0 && (
                    <Icon name="star-half-empty" size={14} color="#F57C00" />
                  )}
                </View>
                <Text style={styles.reviewName}>{review.name}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
                <Text style={styles.reviewSize}>
                  Size bought: {review.size}
                </Text>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.seeMoreButton}>
            <Text style={styles.seeMoreText}>See more...</Text>
          </TouchableOpacity>
        </View>

        {/* You Might Also Like Section */}
        <View style={styles.suggestionSection}>
          <Text style={styles.suggestionTitle}>You might also like</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionContainer}>
            {suggestionImages.map((image, index) => (
              <View key={index} style={styles.suggestionCard}>
                <Image
                  source={image}
                  style={styles.suggestionImage}
                  resizeMode="cover"
                />
                <TouchableOpacity style={styles.shopNowButton}>
                  <Text style={styles.shopNowText}>SHOP NOW</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => navigation.navigate('wishlist')}>
            <Icon
              name="heart"
              size={16}
              color="#F57C00"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>WISHLIST</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            style={styles.addToCartButton}>
            <Icon
              name="shopping-cart"
              size={16}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, {color: '#fff'}]}>
              ADD TO CART
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default PartnerCatalogueScreen;

const styles = StyleSheet.create({
  priceSizeSection: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    backgroundColor: '#f9f9f9',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  strikeThrough: {
    textDecorationLine: 'line-through',
    color: '#888',
    fontSize: 14,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  discount: {
    color: '#F57C00',
    marginLeft: 8,
    fontSize: 14,
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  sizeText: {
    fontSize: 14,
    color: '#333',
  },
  sizeChartText: {
    fontSize: 14,
    color: '#F57C00',
    textDecorationLine: 'underline',
  },
  sizeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sizeBox: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    backgroundColor: '#fff',
  },
  sizeBoxText: {
    fontSize: 14,
    color: '#333',
  },
  delivery: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  // Image Section Styles
  imageSection: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  mainImage: {
    width: '70%',
    height: 350,
    borderRadius: 10,
  },
  sideImages: {
    marginLeft: 10,
    width: '25%',
    height: 350, // Fixed height to contain scrolling
  },
  sideImagesContainer: {
    paddingRight: 5,
    flexGrow: 0, // Prevent content from stretching
  },
  thumbnail: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  colorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  colorsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  shareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareText: {
    fontSize: 14,
    color: 'black',
  },
  colors: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  colorBox: {
    width: 25,
    height: 25,
    borderRadius: 4,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  details: {
    marginVertical: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  subTitle: {
    color: 'gray',
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strikeThrough: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  discount: {
    color: 'orange',
    marginLeft: 8,
  },
  delivery: {
    color: 'gray',
    marginTop: 5,
  },
  // Rating Styles
  ratingContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },
  starIcon: {
    marginRight: 2,
  },
  ratingTextRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  ratingText: {
    color: 'gray',
    fontSize: 13,
  },
  dot: {
    color: 'gray',
    marginHorizontal: 4,
  },
  // Customer Photos Styles
  customerPhotosSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  customerPhotosTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 10,
  },
  customerPhotosContainer: {
    paddingVertical: 5,
    paddingRight: 10,
  },
  photoCard: {
    width: 120,
    height: 150,
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  // Customer Says Styles
  customerSaysSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  customerSaysTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 10,
  },
  reviewCard: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reviewHeader: {
    marginBottom: 5,
  },
  reviewName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 2,
  },
  reviewDate: {
    color: 'gray',
    fontSize: 12,
  },
  reviewSize: {
    color: 'gray',
    fontSize: 12,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  seeMoreButton: {
    marginTop: 10,
  },
  seeMoreText: {
    color: '#F57C00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Suggestion Styles
  suggestionSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  suggestionTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 10,
  },
  suggestionContainer: {
    paddingVertical: 5,
    paddingRight: 10,
  },
  suggestionCard: {
    width: 150,
    height: 250,
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
  },
  suggestionImage: {
    width: '100%',
    height: '100%',
  },
  shopNowButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  shopNowText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholderText: {
    color: 'gray',
    fontSize: 14,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  wishlistButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F57C00',
    paddingVertical: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F57C00',
    paddingVertical: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  buttonIcon: {
    marginRight: 5,
  },
  buttonText: {
    color: '#F57C00',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
