import { useRoute, useNavigation } from '@react-navigation/native';
import Header from '../Component/Header';
import AccordionItem from '../Component/AccordionItem';
import Icon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  TextInput,
  Modal,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist } from '../../redux/reducers/wishlistSlice';

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const { itemId } = route.params;
  console.log("product details id ", itemId)
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedColorImages, setSelectedColorImages] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null); // Track selected color
  const [selectedSize, setSelectedSize] = useState(null);  // Track selected size
  const [quantity, setQuantity] = useState(1); // Add quantity state
  const [ratingsData, setRatingsData] = useState(null); // State for ratings and reviews
  const [ratingsLoading, setRatingsLoading] = useState(true); // State for ratings loading
  const [recommendedItems, setRecommendedItems] = useState([]); // New state for recommended items
  const [recommendedLoading, setRecommendedLoading] = useState(true); // New state for recommended items loading
  const [isModalVisible, setIsModalVisible] = useState(false); // State for TBYB modal

  // Helper function to convert createdAt to "X weeks ago"
  const timeAgo = (dateString) => {
    const now = new Date('2025-06-18T14:36:00.000Z'); // 08:06 PM IST on June 18, 2025
    const pastDate = new Date(dateString);
    const diffInMs = now - pastDate;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);

    if (diffInWeeks > 0) {
      return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    } else if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }
  };

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await fetch(`http://192.168.1.17:4000/api/itemDetails/${itemId}`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          const productData = json.data[0];
          setProduct(productData);
          if (productData.imagesByColor?.length > 0) {
            setSelectedColorImages(productData.imagesByColor[0].images);
            setSizes(productData.imagesByColor[0].sizes || []);
            setSelectedColor(productData.imagesByColor[0].color); // Default to first color
            setSelectedSize(productData.imagesByColor[0].sizes?.[0]?.size || null); // Default to first size
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [itemId]);

  // Fetch ratings and reviews
  useEffect(() => {
    const fetchRatingsReviews = async () => {
      try {
        const res = await fetch(`http://192.168.1.17:4000/api/user/ratingreview/${itemId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setRatingsData(json.data);
        } else {
          console.log('Failed to fetch ratings and reviews:', json.message);
          setRatingsData(null);
        }
      } catch (err) {
        console.error('Error fetching ratings and reviews:', err);
        setRatingsData(null);
      } finally {
        setRatingsLoading(false);
      }
    };

    fetchRatingsReviews();
  }, [itemId]);

  // Fetch recommended items
  useEffect(() => {
    const fetchRecommendedItems = async () => {
      try {
        const res = await fetch(`http://192.168.1.17:4000/api/items`);
        const json = await res.json();
        if (json.success && json.data && json.data.items) {
          // Filter out the current item to avoid recommending the same product
          const filteredItems = json.data.items.filter(item => item._id !== itemId);
          setRecommendedItems(filteredItems);
        } else {
          console.log('Failed to fetch recommended items:', json.message);
          setRecommendedItems([]);
        }
      } catch (err) {
        console.error('Error fetching recommended items:', err);
        setRecommendedItems([]);
      } finally {
        setRecommendedLoading(false);
      }
    };

    fetchRecommendedItems();
  }, [itemId]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (!product) {
    return <Text style={{ textAlign: 'center', marginTop: 50 }}>No product found</Text>;
  }

  const { itemId: itemInfo, imagesByColor, sizeChart, deliveryDescription, returnPolicy, About, isSize, howToMeasure } = product;

  const handleColorSelect = (colorObj) => {
    setSelectedColor(colorObj.color);
    setSelectedColorImages(colorObj.images);
    setSizes(colorObj.sizes);
    setSelectedSize(colorObj.sizes?.[0]?.size || null); // Reset size selection when color changes
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  // PincodeChecker component for pincode input and check
  const PincodeChecker = ({ deliveryPincode }) => {
    const [pincode, setPincode] = useState('');
    const [result, setResult] = useState(null);

    const handleCheck = () => {
      if (!pincode) return;
      if (deliveryPincode.includes(Number(pincode))) {
        setResult('available');
      } else {
        setResult('not_available');
      }
    };

    return (
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 4,
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: '#fff',
              fontSize: 15,
            }}
            placeholder="Enter Pincode"
            keyboardType="numeric"
            value={pincode}
            onChangeText={setPincode}
            maxLength={6}
          />
          <TouchableOpacity
            style={{
              backgroundColor: '#FF6B00',
              paddingVertical: 10,
              paddingHorizontal: 18,
              borderRadius: 4,
              marginLeft: 8,
            }}
            onPress={handleCheck}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>CHECK</Text>
          </TouchableOpacity>
        </View>
        {result === 'available' && (
          <Text style={{ color: 'green', fontSize: 14, marginTop: 2 }}>
            Delivery available to this pincode!
          </Text>
        )}
        {result === 'not_available' && (
          <Text style={{ color: 'red', fontSize: 14, marginTop: 2 }}>
            Sorry, delivery is not available to this pincode.
          </Text>
        )}
      </View>
    );
  };

  // Render stars dynamically based on average rating
  const renderStars = (averageRating) => {
    const rating = parseFloat(averageRating);
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, idx) => (
          <Icon key={`full-${idx}`} name="star" size={16} color="#FFB800" />
        ))}
        {hasHalfStar && <Icon key="half" name="star-half-o" size={16} color="#FFB800" />}
        {[...Array(emptyStars)].map((_, idx) => (
          <Icon key={`empty-${idx}`} name="star-o" size={16} color="#FFB800" />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
        {/* Main Image & Thumbnails */}
        <View style={styles.imageSection}>
          <TouchableWithoutFeedback onPress={() => navigation.navigate('ProductDetailPhoto', { images: selectedColorImages })}>
            <Image source={{ uri: selectedColorImages[0]?.url }} style={styles.mainImage} resizeMode="cover" />
          </TouchableWithoutFeedback>
          <ScrollView style={styles.sideImages} showsVerticalScrollIndicator={true}>
            {selectedColorImages.slice(1).map((img, idx) => (
              <Image key={idx} source={{ uri: img.url }} style={styles.thumbnail} resizeMode="cover" />
            ))}
          </ScrollView>
        </View>

        {/* Colors Section */}
        <View style={styles.colorsMainContainer}>
          <View style={styles.colorsRow}>
            <View style={styles.colorTitleContainer}>
              <Text style={styles.colorsText}>Colors</Text>
            </View>
            <View style={styles.colorBoxesRow}>
              {imagesByColor.map((colorObj, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.colorBox,
                    { backgroundColor: colorObj.hexCode },
                    selectedColor === colorObj.color ? styles.selectedColorBox : {},
                  ]}
                  onPress={() => handleColorSelect(colorObj)}
                />
              ))}
            </View>
            <View style={styles.shareContainer}>
              <Text style={styles.shareText}>SHARE</Text>
              <Feather name="share-2" size={16} color="black" style={{ marginLeft: 5 }} />
            </View>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.details}>
          <Text style={styles.title}>{itemInfo.name}</Text>
          <Text style={styles.subTitle}>{itemInfo.description}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.strikeThrough}>₹{itemInfo.MRP}</Text>
            <Text style={styles.price}> ₹{itemInfo.discountedPrice}</Text>
            <Text style={styles.discount}>({Math.round(itemInfo.discountPercentage)}% off)</Text>
          </View>
          <Text style={styles.delivery}>{deliveryDescription}</Text>
        </View>

        {/* Sizes */}
        {isSize && (
          <View style={styles.priceSizeSection}>
            <View style={styles.sizeRow}>
              <Text style={styles.sizeText}>Select a size</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SizeChart', {
                sizeChart,
                howToMeasure,
                itemId: product.itemId._id,
                imagesByColor: product.imagesByColor,
                selectedColor: selectedColor // Pass the currently selected color
              })}>
                <Text style={styles.sizeChartText}>SIZE CHART</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sizeOptions}>
              {sizes.map((szObj, idx) => (
                <TouchableOpacity
                  key={szObj.size}
                  style={[
                    styles.sizeBox,
                    selectedSize === szObj.size ? styles.selectedSizeBox : {},
                    szObj.stock === 0 && { opacity: 0.5 } // Optional: visually disable out-of-stock
                  ]}
                  onPress={() => szObj.stock > 0 && handleSizeSelect(szObj.size)}
                  disabled={szObj.stock === 0}
                >
                  <Text style={[
                    styles.sizeBoxText,
                    selectedSize === szObj.size ? styles.selectedSizeBoxText : {},
                    szObj.stock === 0 && { textDecorationLine: 'line-through', color: '#aaa' }
                  ]}>
                    {szObj.size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.deliveryText}>Fastest 2-3 days delivery to 100+ pincodes</Text>

            {/* Try Before You Buy Button */}
           <TouchableOpacity
  style={styles.tryBeforeButton}
  onPress={() => {
    if (!selectedColor || !selectedColorImages || !selectedColorImages[0]?.url) {
      Alert.alert('Error', 'Please select a color before trying on.');
      return;
    }
    navigation.navigate('UploadTBYB', {
      garmentImage: selectedColorImages[0].url, // Pass the primary image for the selected color
      itemId: product.itemId._id,
      category: product.itemId.category || 'tops', // Use product category or default to 'tops'
      selectedColor: selectedColor,
    });
  }}
>
  <Image
    source={require('../../assets/Images/Tshirt.png')}
    style={styles.tbybIcon}
  />
  <Text style={styles.tryBeforeText}>TRY BEFORE YOU BUY</Text>
</TouchableOpacity>
          </View>
        )}

        {/* Accordion Sections */}
        <View style={styles.accordionContainer}>
          <AccordionItem title="About the Product">
            <Text>{About}</Text>
          </AccordionItem>

          <AccordionItem title="Check Delivery at Your Pincode">
            <PincodeChecker deliveryPincode={product.deliveryPincode} />
          </AccordionItem>

          <AccordionItem title="Return Policies">
            <Text>{returnPolicy}</Text>
          </AccordionItem>
        </View>

        {/* Ratings & Reviews */}
        <View style={styles.ratingsSection}>
          <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
          {ratingsLoading ? (
            <ActivityIndicator size="small" color="#9B5AF5" style={{ marginTop: 10 }} />
          ) : ratingsData ? (
            <View style={styles.ratingContainer}>
              <View style={styles.ratingHeader}>
                <Text style={styles.ratingScore}>{ratingsData.averageRating}</Text>
                {renderStars(ratingsData.averageRating)}
              </View>
              <Text style={styles.ratingCount}>
                {ratingsData.totalRating} Ratings | {ratingsData.totalReview} Reviews
              </Text>
            </View>
          ) : (
            <Text style={styles.ratingCount}>No ratings or reviews available</Text>
          )}
        </View>

        {/* Customer Photos */}
        <View style={styles.customerPhotosSection}>
          <Text style={styles.sectionTitle}>Customer Photos</Text>
          {ratingsLoading ? (
            <ActivityIndicator size="small" color="#9B5AF5" style={{ marginTop: 10 }} />
          ) : ratingsData && ratingsData.arrayOfCustomerImage && ratingsData.arrayOfCustomerImage.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosContainer}>
              {ratingsData.arrayOfCustomerImage.map((imgUrl, idx) => (
                <Image key={idx} source={{ uri: imgUrl }} style={styles.customerPhoto} />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.ratingCount}>No customer photos available</Text>
          )}
        </View>

        {/* Customer Reviews */}
        <View style={styles.reviewsSection}>
          {ratingsLoading ? (
            <ActivityIndicator size="small" color="#9B5AF5" style={{ marginTop: 10 }} />
          ) : ratingsData && ratingsData.data && ratingsData.data.length > 0 ? (
            ratingsData.data.slice(0, 1).map((review, idx) => (
              <View key={idx} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.userId.name}</Text>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{review.rating} ★</Text>
                  </View>
                </View>
                <Text style={styles.reviewSize}>
                  Size bought: {review.sizeBought} | {timeAgo(review.createdAt)}
                </Text>
                <Text style={styles.reviewText}>{review.review}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.reviewText}>No reviews available</Text>
          )}

          <TouchableOpacity style={styles.seeMoreButton}>
            <Text style={styles.seeMoreText}>See more...</Text>
          </TouchableOpacity>
        </View>

        {/* You might also like section */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.recommendationsTitle}>You might also like</Text>
          {recommendedLoading ? (
            <ActivityIndicator size="small" color="#9B5AF5" style={{ marginLeft: 15 }} />
          ) : recommendedItems.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recommendationsScroll}
            >
              {recommendedItems.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.recommendationCard}
                  onPress={() => navigation.navigate('ProductDetailScreen', { itemId: item._id })}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.recommendationImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity style={styles.shopNowButton}>
                    <Text style={styles.shopNowText}>SHOP NOW</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={{ paddingLeft: 15, color: '#666' }}>No recommendations available</Text>
          )}
        </View>
      </ScrollView>

      {/* Modal for TBYB Terms & Conditions */}
      <Modal
  animationType="fade"
  transparent={true}
  visible={isModalVisible}
  onRequestClose={() => setIsModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>TBYB Terms & Conditions</Text>
      <Text style={styles.modalSubtitle}>8/10 Free Trials Left</Text>
      <View style={styles.modalList}>
        <Text style={styles.modalBullet}>• Upload a clear full-body image to try outfits.</Text>
        <Text style={styles.modalBullet}>• Each virtual try-on session deducts one credit from your monthly limit.</Text>
        <Text style={styles.modalBullet}>• Users receive 10 free trials every month for virtual try-ons.</Text>
        <Text style={styles.modalBullet}>• Purchasing an item resets your credits, allowing more try-ons.</Text>
        <Text style={styles.modalBullet}>• The generated previews depend on image quality, lighting, and body posture.</Text>
        <Text style={styles.modalBullet}>• Unused credits do not carry over to the next month.</Text>
      </View>
      <TouchableOpacity 
        style={styles.modalCloseButton} 
        onPress={() => setIsModalVisible(false)}
      >
        <Text style={styles.modalCloseText}>CLOSE</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={async () => {
            console.log('Wishlist button pressed');

            if (!token) {
              console.log('No token found. Redirecting to login screen...');
              navigation.navigate('Login', {
                fromScreen: 'ProductDetail',
                itemId: product.itemId._id,
              });
              return;
            }

            console.log('Token found:', token);

            const payload = {
              itemId: product.itemId._id,
              color: selectedColor || 'Black',
            };

            console.log('Request Payload:', payload);

            try {
              const response = await fetch('http://192.168.1.17:4000/api/userwishlist/create', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
              });

              console.log('Wishlist API Response Status:', response.status);

              const data = await response.json();
              console.log('Wishlist API Response Data:', data);

              if (response.ok) {
                console.log('Item added to wishlist successfully.');
                dispatch(addToWishlist(data));
                console.log('Wishlist item dispatched to Redux:', data);
                alert('Added to wishlist');
                navigation.navigate('Wishlist');
              } else {
                console.warn('Wishlist API error:', data.message);
                alert(data.message || 'Failed to add to wishlist');
              }
            } catch (err) {
              console.error('Network/API Error while adding to wishlist:', err);
              alert('Something went wrong while adding to wishlist');
            }
          }}
        >
          <Icon name="heart-o" size={18} color="black" />
          <Text style={styles.wishlistText}>WISHLIST</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={async () => {
            console.log('🛒 Add to cart button pressed');

            if (!token) {
              console.warn('No token found. Redirecting to login.');
              navigation.navigate('Login', {
                fromScreen: 'ProductDetail',
                itemId: product.itemId._id,
              });
              return;
            }

            if (!selectedSize) {
              alert('Please select a size.');
              return;
            }

            const selectedColorObj = imagesByColor.find(colorObj => colorObj.color === selectedColor);
            const selectedSizeObj = selectedColorObj?.sizes?.find(sz => sz.size === selectedSize);

            if (!selectedSizeObj) {
              alert('Selected size is not available for this color.');
              return;
            }

            const payload = {
              itemId: product.itemId._id,
              quantity: quantity, // Use dynamic quantity
              size: selectedSize,
              color: selectedColor || 'Black',
              skuId: selectedSizeObj.skuId,
            };

            console.log('Cart Payload:', payload);

            try {
              const response = await fetch('http://192.168.1.17:4000/api/usercart/create', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
              });

              const data = await response.json();

              console.log('Cart API Response:', data);

              if (response.ok) {
                alert('Added to cart successfully.');
                navigation.navigate('Cart');
              } else {
                alert(data.message || 'Failed to add to cart.');
              }
            } catch (error) {
              console.error('Cart API Error:', error);
              alert('Something went wrong while adding to cart.');
            }
          }}
        >
          <Feather name="shopping-cart" size={18} color="#fff" />
          <Text style={styles.cartText}>ADD TO CART</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  tryBeforeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  tryBeforeButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(210, 105, 30, 1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tbybIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 8,
    tintColor: '#fff',
  },
  tryBeforeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  infoIcon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    marginLeft: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  imageSection: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  mainImage: {
    width: '70%',
    height: 350,
    borderRadius: 0,
  },
  sideImages: {
    marginLeft: 10,
    width: '25%',
    height: 350,
  },
  thumbnail: {
    width: '100%',
    height: 100,
    borderRadius: 0,
    marginBottom: 10,
  },
  colorsMainContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  colorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorTitleContainer: {
    marginRight: 15,
  },
  colorsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  colorBoxesRow: {
    flexDirection: 'row',
    flex: 1,
  },
  colorBox: {
    width: 40,
    height: 30,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 0,
  },
  selectedColorBox: {
    borderWidth: 2,
    borderColor: '#D2691E',
  },
  shareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  shareText: {
    fontSize: 14,
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
  priceSizeSection: {
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sizeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sizeChartText: {
    color: '#F57C00',
    textDecorationLine: 'underline',
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  sizeBox: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  selectedSizeBox: {
    borderColor: '#D2691E',
    backgroundColor: '#D2691E',
  },
  sizeBoxText: {
    fontSize: 14,
    color: '#000',
  },
  selectedSizeBoxText: {
    color: '#fff',
  },
  deliveryText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 15,
  },
  accordionContainer: {
    marginTop: 15,
  },
  ratingsSection: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  ratingContainer: {
    marginBottom: 15,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingScore: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 10,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingCount: {
    color: '#666',
    fontSize: 14,
  },
  customerPhotosSection: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  photosContainer: {
    marginTop: 10,
  },
  customerPhoto: {
    width: 120,
    height: 120,
    marginRight: 10,
    borderRadius: 5,
  },
  reviewsSection: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  reviewItem: {
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 10,
  },
  ratingBadge: {
    backgroundColor: '#F57C00',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
  },
  reviewSize: {
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
  },
  reviewText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
  },
  seeMoreButton: {
    marginTop: 10,
  },
  seeMoreText: {
    color: '#F57C00',
    fontSize: 14,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    justifyContent: 'space-between',
  },
  wishlistButton: {
    borderWidth: 1,
    borderColor: '#D2691E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 3,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  wishlistText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#000',
  },
  cartButton: {
    backgroundColor: '#D2691E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 3,
    flex: 1,
    justifyContent: 'center',
  },
  cartText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
  recommendationsSection: {
    marginTop: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  recommendationsScroll: {
    paddingLeft: 15,
  },
  recommendationCard: {
    width: 180,
    height: 240,
    marginRight: 15,
    position: 'relative',
  },
  recommendationImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  shopNowButton: {
    position: 'absolute',
    bottom: 10,
    left: '45%',
    transform: [{ translateX: -50 }],
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  shopNowText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContent: {
  width: '80%',
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 20,
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 10,
},
modalSubtitle: {
  fontSize: 16,
  color: '#FF6B00',
  textAlign: 'center',
  marginBottom: 15,
},
modalList: {
  marginBottom: 20,
},
modalBullet: {
  fontSize: 14,
  marginVertical: 5,
  lineHeight: 20,
},
modalCloseButton: {
  backgroundColor: '#FF6B00',
  paddingVertical: 12,
  borderRadius: 5,
  alignItems: 'center',
},
modalCloseText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},
});