// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   useWindowDimensions,
//   SafeAreaView,
//   StatusBar,
//   Platform,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { useSelector } from 'react-redux';
// import Icon from 'react-native-vector-icons/Ionicons';
// import PartnerGenderTabs from '../Components/PartnerGenderTabs';
// import SuggestionCard from '../../UserFlow/Component/SuggestionCard';

// const recentSearches = [
//   { label: 'Chiffon Saree', image: require('../../assets/Images/Girl1.png') },
//   { label: 'Formal Shirt', image: require('../../assets/Images/Girl2.png') },
//   { label: 'Cargo Pants', image: require('../../assets/Images/Girl3.png') },
//   { label: 'Chiffon Saree', image: require('../../assets/Images/Girl1.png') },
//   { label: 'Formal Shirt', image: require('../../assets/Images/Girl2.png') },
//   { label: 'Cargo Pants', image: require('../../assets/Images/Girl3.png') },
// ];

// const PartnerSearchCategory = () => {
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions();
//   const token = useSelector(state => state.auth.token);
//   const cartItems = useSelector(state => state.cart.items);

//   // Scaling function based on reference width (375px, e.g., iPhone SE)
//   const scale = (size) => (width / 375) * size;

//   // Calculate total cart count
//   const totalCartCount = cartItems.reduce((sum, item) => {
//     const count = item.orderDetails.reduce(
//       (colorSum, colorObj) =>
//         colorSum + colorObj.sizeAndQuantity.reduce((sizeSum, s) => sizeSum + s.quantity, 0),
//       0
//     );
//     return sum + count;
//   }, 0);

//   // Log for debugging
//   console.log('PartnerSearchCategory - Cart Items:', cartItems);
//   console.log('PartnerSearchCategory - Total Cart Count:', totalCartCount);
//   console.log('PartnerSearchCategory - Navigation State:', navigation.getState());

//   const handleCartPress = () => {
//     if (token) {
//       navigation.navigate('PartnerCart');
//     } else {
//       navigation.navigate('Login', { fromScreen: 'PartnerSearchCategory' });
//     }
//   };

//   const renderContent = () => (
//     <View style={styles.container}>
//       {/* Header */}
//       <SafeAreaView style={{ backgroundColor: '#FFFFFF', flex: 0 }}>
//         <StatusBar
//           barStyle="dark-content"
//           backgroundColor="#FFFFFF"
//           translucent={false}
//         />
//         <View style={[styles.headerContainer, { paddingBottom: scale(12) }]}>
//           <View
//             style={[
//               styles.header,
//               {
//                 paddingHorizontal: scale(16),
//                 paddingTop: Platform.select({
//                   ios: scale(16),
//                   android: (StatusBar.currentHeight || scale(10)) + scale(16),
//                 }),
//               },
//             ]}
//           >
//             <TouchableOpacity
//               onPress={() => navigation.goBack()}
//               style={[styles.backButton, { padding: scale(4), marginRight: scale(12) }]}
//             >
//               <Icon name="arrow-back" size={scale(24)} color="#000" />
//             </TouchableOpacity>

//             <View
//               style={[styles.searchBox, { paddingHorizontal: scale(16), height: scale(48), borderRadius: scale(4) }]}
//             >
//               <Image
//                 source={require('../../assets/icon/SearchIcon.png')}
//                 style={[styles.searchIcon, { width: scale(20), height: scale(20), marginRight: scale(12) }]}
//               />
//               <TextInput
//                 placeholder="Search your style "
//                 placeholderTextColor="#999999"
//                 style={[styles.searchInput, { fontSize: scale(16), paddingVertical: scale(8) }]}
//               />
//             </View>

//             <TouchableOpacity
//               onPress={handleCartPress}
//               style={[styles.cartIconWrapper, { marginLeft: scale(12) }]}
//             >
//               <Image
//                 source={require('../../assets/icon/CartIcon.png')}
//                 style={[styles.cartIcon, { width: scale(24), height: scale(24) }]}
//               />
//               {totalCartCount > 0 && (
//                 <View
//                   style={{
//                     position: 'absolute',
//                     top: scale(-6),
//                     right: scale(-8),
//                     backgroundColor: '#F36F25',
//                     borderRadius: scale(10),
//                     width: scale(18),
//                     height: scale(18),
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: '#fff',
//                       fontSize: scale(10),
//                       fontWeight: 'bold',
//                     }}
//                   >
//                     {totalCartCount}
//                   </Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>

//       {/* Recent Searches */}
//       <View style={styles.contentContainer}>
//         <Text style={styles.sectionTitle}>Recent Searches</Text>
//         <View style={styles.recentSearchesContainer}>
//           <FlatList
//             data={recentSearches.slice(0, 3)}
//             keyExtractor={(item, index) => index.toString()}
//             horizontal={false}
//             scrollEnabled={false}
//             numColumns={3}
//             showsHorizontalScrollIndicator={false}
//             renderItem={({ item }) => (
//               <TouchableOpacity style={styles.recentItem}>
//                 <Image source={item.image} style={styles.recentImage} />
//                 <Text style={styles.recentLabel}>{item.label}</Text>
//               </TouchableOpacity>
//             )}
//             contentContainerStyle={styles.recentListContainer}
//           />
//         </View>

//         {/* Popular Categories */}
//         <Text style={styles.sectionTitle}>Popular Categories</Text>
//         <PartnerGenderTabs />
//         <SuggestionCard
//           title="Searching from wishlist?"
//           productImage={require('../../assets/Images/Boy1.png')}
//           productName="MAAHI Originals: Sports Tee"
//           productDesc="Active wear fits"
//           price={650}
//           oldPrice={1259}
//           discount={50}
//           rating={4.5}
//           reviews="79 Ratings & 55"
//           sizes={['XS', 'S', 'M', 'L', 'XL']}
//           colors={['black', 'green', 'white', 'gray']}
//           buttonLabel="VIEW WISHLIST"
//           onButtonPress={() => navigation.navigate('PartnnerHome', { screen: 'wishlist' })}
//         />
//         <SuggestionCard
//           title="Missing anything from bag?"
//           productImage={require('../../assets/Images/Girl1.png')}
//           productName="MAAHI Winter Hoodie"
//           productDesc="Unisex Collections"
//           price={1100}
//           oldPrice={1500}
//           discount={30}
//           rating={4.5}
//           reviews="121 Ratings & 59"
//           sizes={['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']}
//           colors={['brown', 'black', 'blue', 'yellow']}
//           buttonLabel="VIEW CART"
//           onButtonPress={() => navigation.navigate('PartnerCart')}
//         />
//       </View>
//     </View>
//   );

//   return (
//     <FlatList
//       data={['virtual-wrapper']}
//       renderItem={renderContent}
//       keyExtractor={() => 'main-flatlist'}
//       showsVerticalScrollIndicator={false}
//       style={styles.mainContainer}
//       contentContainerStyle={styles.flatListContent}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   mainContainer: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   flatListContent: {
//     flexGrow: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   headerContainer: {
//     backgroundColor: '#FFFFFF',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//   },
//   backButton: {
//     // padding adjusted via scale
//   },
//   searchBox: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     backgroundColor: '#FFFFFF',
//     // paddingHorizontal and height adjusted via scale
//   },
//   searchIcon: {
//     // width, height, and marginRight adjusted via scale
//     // tintColor: '#999999',
//   },
//   cartIconWrapper: {
//     position: 'relative',
//   },
//   cartIcon: {
//     // width and height adjusted via scale
//   },
//   searchInput: {
//     flex: 1,
//     // fontSize and paddingVertical adjusted via scale
//     color: '#333333',
//   },
//   contentContainer: {
//     paddingTop: 24,
//     backgroundColor: '#FFFFFF',
//     flex: 1,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#333333',
//     marginBottom: 16,
//     paddingHorizontal: 16,
//   },
//   recentSearchesContainer: {
//     paddingHorizontal: 16,
//     marginBottom: 24,
//   },
//   recentListContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   recentItem: {
//     width: '31%', // Approximately one-third of container width minus margins
//   },
//   recentImage: {
//     width: '100%',
//     aspectRatio: 3/4,
//     marginBottom: 8,
//   },
//   recentLabel: {
//     fontSize: 14,
//     color: '#333333',
//     textAlign: 'center',
//     fontWeight: '500',
//   },
// });

// export default PartnerSearchCategory;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { debounce } from 'lodash';
import PartnerGenderTabs from '../Components/PartnerGenderTabs';
import SuggestionCard from '../../UserFlow/Component/SuggestionCard';
import { BASE_URL } from '../../config/apiConfig';

const recentSearches = [
  { label: 'Chiffon Saree', image: require('../../assets/Images/Girl1.png') },
  { label: 'Formal Shirt', image: require('../../assets/Images/Girl2.png') },
  { label: 'Cargo Pants', image: require('../../assets/Images/Girl3.png') },
  { label: 'Chiffon Saree', image: require('../../assets/Images/Girl1.png') },
  { label: 'Formal Shirt', image: require('../../assets/Images/Girl2.png') },
  { label: 'Cargo Pants', image: require('../../assets/Images/Girl3.png') },
];

const PartnerSearchCategory = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const token = useSelector(state => state.auth.token);
  const cartItems = useSelector(state => state.cart.items);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Scaling function based on reference width (375px, e.g., iPhone SE)
  const scale = size => (width / 375) * size;

  // Calculate total cart count
  const totalCartCount = cartItems.reduce((sum, item) => {
    const count = item.orderDetails.reduce(
      (colorSum, colorObj) =>
        colorSum +
        colorObj.sizeAndQuantity.reduce((sizeSum, s) => sizeSum + s.quantity, 0),
      0,
    );
    return sum + count;
  }, 0);

  // Log for debugging
  console.log('PartnerSearchCategory - Cart Items:', cartItems);
  console.log('PartnerSearchCategory - Total Cart Count:', totalCartCount);
  console.log('PartnerSearchCategory - Navigation State:', navigation.getState());
  console.log('PartnerSearchCategory - Search Query:', searchQuery);

  const handleCartPress = () => {
    if (token) {
      navigation.navigate('PartnerCart');
    } else {
      navigation.navigate('Login', { fromScreen: 'PartnerSearchCategory' });
    }
  };

  // Fetch search results
  useEffect(() => {
    if (!searchQuery) {
      setProducts([]);
      setPage(1);
      setTotalPages(1);
      setError(null);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        Alert.alert(
          'Login Required',
          'Please log in to search for products.',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.navigate('Login', {
                  fromScreen: 'PartnerSearchCategory',
                  actionAfterLogin: 'search',
                }),
            },
          ],
          { cancelable: false },
        );
        setLoading(false);
        return;
      }

      const queryParams = [
        `keyword=${encodeURIComponent(searchQuery)}`,
        `page=${page}`,
        `limit=${limit}`,
      ];
      const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
      const apiUrl = `${BASE_URL}/items/search${queryString}`;

      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Search server response:', errorText);
          const errorData = response.headers.get('content-type')?.includes('application/json')
            ? JSON.parse(errorText)
            : {};
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const json = await response.json();
        console.log('🌐 Search response:', json);

        if (json?.success) {
          const formattedItems = (json.data?.items || []).map(item => ({
            name: item.name || 'Unnamed Item',
            description: item.description || 'No description available',
            mrp: item.MRP || 0,
            price: item.discountedPrice || 0,
            discount: item.discountPercentage || 0,
            image: { uri: item.image || 'https://via.placeholder.com/150' },
            itemId: item._id || '',
            defaultColor: item.defaultColor || '',
            userAverageRating: item.userAverageRating || 4.5,
          }));
          setProducts(page === 1 ? formattedItems : [...products, ...formattedItems]);
          setTotalPages(json.data?.totalPages || 1);
          if (formattedItems.length === 0 && page === 1) {
            setError('No items found for your search');
          }
        } else {
          throw new Error(json?.message || 'Failed to load search results');
        }
      } catch (error) {
        const errorMessage = error.message.includes('401')
          ? 'Session expired. Please log in again.'
          : 'Failed to fetch search results. Please try again.';
        setError(errorMessage);
        Alert.alert(
          'Error',
          errorMessage,
          [
            {
              text: 'OK',
              onPress: () => {
                if (errorMessage.includes('401')) {
                  navigation.navigate('Login', {
                    fromScreen: 'PartnerSearchCategory',
                    actionAfterLogin: 'search',
                  });
                }
              },
            },
          ],
          { cancelable: false },
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const debouncedFetchProducts = debounce(fetchProducts, 500);
    debouncedFetchProducts();
    return () => debouncedFetchProducts.cancel();
  }, [searchQuery, page, token, navigation]);

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const renderSearchItem = ({ item }) => {
    const rating = item.userAverageRating || 4.5;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <TouchableOpacity
        style={[styles.card, { width: scale(170) }]}
        onPress={() => navigation.navigate('PartnerProductDetail', { itemId: item.itemId })}
      >
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={[styles.cardImage, { width: '100%', height: scale(200) }]}
            onError={e => console.log('Image load error:', e.nativeEvent.error)}
          />
          <TouchableOpacity
            style={styles.heartIcon}
            onPress={() => {
              if (!token) {
                navigation.navigate('Login', {
                  fromScreen: 'PartnerSearchCategory',
                  actionAfterLogin: 'like_item',
                  itemId: item.itemId,
                });
                return;
              }
              // Implement wishlist functionality if needed
              Alert.alert('Success', 'Item added to wishlist!');
            }}
          >
            <View style={styles.heartBackground}>
              <Image
                source={require('../../assets/Images/Heart.png')}
                style={styles.heartImage}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <Text numberOfLines={2} style={[styles.cardTitle, { fontSize: scale(14) }]}>
            {item.name}
          </Text>
          <Text style={[styles.cardSubtitle, { fontSize: scale(12) }]}>
            {item.description}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.cardPrice, { fontSize: scale(14) }]}>
              ₹{(item.price || 0).toFixed(2)}
            </Text>
            <Text style={[styles.cardMrp, { fontSize: scale(12) }]}>
              ₹{(item.mrp || 0).toFixed(2)}
            </Text>
            <Text style={[styles.cardDiscount, { fontSize: scale(12) }]}>
              {Math.round(item.discount) || 0}% Off
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[...Array(fullStars)].map((_, index) => (
                <Icon key={index} name="star" size={scale(12)} color="#FF9017" />
              ))}
              {hasHalfStar && (
                <Icon name="star-half" size={scale(12)} color="#FF9017" />
              )}
              {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, index) => (
                <Icon
                  key={index + fullStars + 1}
                  name="star-outline"
                  size={scale(12)}
                  color="#FF9017"
                />
              ))}
              <Text style={[styles.ratingText, { fontSize: scale(12) }]}>
                {' '}
                {rating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (searchQuery) {
      return (
        <View style={styles.container}>
          <SafeAreaView style={{ backgroundColor: '#FFFFFF', flex: 0 }}>
            <StatusBar
              barStyle="dark-content"
              backgroundColor="#FFFFFF"
              translucent={false}
            />
            <View style={[styles.headerContainer, { paddingBottom: scale(12) }]}>
              <View
                style={[
                  styles.header,
                  {
                    paddingHorizontal: scale(16),
                    paddingTop: Platform.select({
                      ios: scale(16),
                      android: (StatusBar.currentHeight || scale(10)) + scale(16),
                    }),
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setProducts([]);
                    setPage(1);
                  }}
                  style={[styles.backButton, { padding: scale(4), marginRight: scale(12) }]}
                >
                  <Icon name="arrow-back" size={scale(24)} color="#000" />
                </TouchableOpacity>

                <View
                  style={[
                    styles.searchBox,
                    { paddingHorizontal: scale(16), height: scale(48), borderRadius: scale(4) },
                  ]}
                >
                  <Image
                    source={require('../../assets/icon/SearchIcon.png')}
                    style={[styles.searchIcon, { width: scale(20), height: scale(20), marginRight: scale(12) }]}
                  />
                  <TextInput
                    placeholder="Search your style"
                    placeholderTextColor="#999999"
                    style={[styles.searchInput, { fontSize: scale(16), paddingVertical: scale(8) }]}
                    value={searchQuery}
                    onChangeText={text => {
                      setSearchQuery(text);
                      setPage(1);
                      setProducts([]);
                    }}
                    autoFocus={true}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleCartPress}
                  style={[styles.cartIconWrapper, { marginLeft: scale(12) }]}
                >
                  <Image
                    source={require('../../assets/icon/CartIcon.png')}
                    style={[styles.cartIcon, { width: scale(24), height: scale(24) }]}
                  />
                  {totalCartCount > 0 && (
                    <View
                      style={{
                        position: 'absolute',
                        top: scale(-6),
                        right: scale(-8),
                        backgroundColor: '#F36F25',
                        borderRadius: scale(10),
                        width: scale(18),
                        height: scale(18),
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: scale(10),
                          fontWeight: 'bold',
                        }}
                      >
                        {totalCartCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>

          <View style={styles.contentContainer}>
            {loading && page === 1 ? (
              <ActivityIndicator
                size="large"
                color="#F36F25"
                style={{ marginTop: scale(20) }}
              />
            ) : error ? (
              <Text style={[styles.errorText, { fontSize: scale(16) }]}>{error}</Text>
            ) : products.length === 0 ? (
              <Text style={[styles.noItemsText, { fontSize: scale(16) }]}>
                No items found
              </Text>
            ) : (
              <FlatList
                data={products}
                keyExtractor={item => item.itemId}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                renderItem={renderSearchItem}
                contentContainerStyle={styles.grid}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() =>
                  loading && page > 1 ? (
                    <ActivityIndicator
                      size="small"
                      color="#F36F25"
                      style={{ marginVertical: scale(10) }}
                    />
                  ) : page === totalPages && products.length > 0 ? (
                    <Text style={[styles.noMoreText, { fontSize: scale(14) }]}>
                      No more items to load
                    </Text>
                  ) : null
                }
              />
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <SafeAreaView style={{ backgroundColor: '#FFFFFF', flex: 0 }}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#FFFFFF"
            translucent={false}
          />
          <View style={[styles.headerContainer, { paddingBottom: scale(12) }]}>
            <View
              style={[
                styles.header,
                {
                  paddingHorizontal: scale(16),
                  paddingTop: Platform.select({
                    ios: scale(16),
                    android: (StatusBar.currentHeight || scale(10)) + scale(16),
                  }),
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[styles.backButton, { padding: scale(4), marginRight: scale(12) }]}
              >
                <Icon name="arrow-back" size={scale(24)} color="#000" />
              </TouchableOpacity>

              <View
                style={[
                  styles.searchBox,
                  { paddingHorizontal: scale(16), height: scale(48), borderRadius: scale(4) },
                ]}
              >
                <Image
                  source={require('../../assets/icon/SearchIcon.png')}
                  style={[styles.searchIcon, { width: scale(20), height: scale(20), marginRight: scale(12) }]}
                />
                <TextInput
                  placeholder="Search your style"
                  placeholderTextColor="#999999"
                  style={[styles.searchInput, { fontSize: scale(16), paddingVertical: scale(8) }]}
                  value={searchQuery}
                  onChangeText={text => {
                    setSearchQuery(text);
                    setPage(1);
                    setProducts([]);
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleCartPress}
                style={[styles.cartIconWrapper, { marginLeft: scale(12) }]}
              >
                <Image
                  source={require('../../assets/icon/CartIcon.png')}
                  style={[styles.cartIcon, { width: scale(24), height: scale(24) }]}
                />
                {totalCartCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: scale(-6),
                      right: scale(-8),
                      backgroundColor: '#F36F25',
                      borderRadius: scale(10),
                      width: scale(18),
                      height: scale(18),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: scale(10),
                        fontWeight: 'bold',
                      }}
                    >
                      {totalCartCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        <View style={styles.contentContainer}>
          <Text style={[styles.sectionTitle, { fontSize: scale(20) }]}>
            Recent Searches
          </Text>
          <View style={styles.recentSearchesContainer}>
            <FlatList
              data={recentSearches.slice(0, 3)}
              keyExtractor={(item, index) => index.toString()}
              horizontal={false}
              scrollEnabled={false}
              numColumns={3}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.recentItem, { width: scale(110) }]}
                  onPress={() => {
                    setSearchQuery(item.label);
                    setPage(1);
                    setProducts([]);
                  }}
                >
                  <Image
                    source={item.image}
                    style={[styles.recentImage, { width: scale(110), height: scale(146) }]}
                  />
                  <Text style={[styles.recentLabel, { fontSize: scale(14) }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.recentListContainer}
            />
          </View>

          <Text style={[styles.sectionTitle, { fontSize: scale(20) }]}>
            Popular Categories
          </Text>
          <PartnerGenderTabs />
          <SuggestionCard
            title="Searching from wishlist?"
            productImage={require('../../assets/Images/Boy1.png')}
            productName="MAAHI Originals: Sports Tee"
            productDesc="Active wear fits"
            price={650}
            oldPrice={1259}
            discount={50}
            rating={4.5}
            reviews="79 Ratings & 55"
            sizes={['XS', 'S', 'M', 'L', 'XL']}
            colors={['black', 'green', 'white', 'gray']}
            buttonLabel="VIEW WISHLIST"
            onButtonPress={() => navigation.navigate('PartnnerHome', { screen: 'wishlist' })}
          />
          <SuggestionCard
            title="Missing anything from bag?"
            productImage={require('../../assets/Images/Girl1.png')}
            productName="MAAHI Winter Hoodie"
            productDesc="Unisex Collections"
            price={1100}
            oldPrice={1500}
            discount={30}
            rating={4.5}
            reviews="121 Ratings & 59"
            sizes={['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']}
            colors={['brown', 'black', 'blue', 'yellow']}
            buttonLabel="VIEW CART"
            onButtonPress={() => navigation.navigate('PartnerCart')}
          />
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={['virtual-wrapper']}
      renderItem={renderContent}
      keyExtractor={() => 'main-flatlist'}
      showsVerticalScrollIndicator={false}
      style={styles.mainContainer}
      contentContainerStyle={styles.flatListContent}
    />
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flatListContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    // padding adjusted via scale
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    // paddingHorizontal, height, borderRadius adjusted via scale
  },
  searchIcon: {
    // width, height, marginRight adjusted via scale
  },
  cartIconWrapper: {
    position: 'relative',
  },
  cartIcon: {
    // width and height adjusted via scale
  },
  searchInput: {
    flex: 1,
    // fontSize, paddingVertical adjusted via scale
    color: '#333333',
  },
  contentContainer: {
    paddingTop: 24,
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  recentSearchesContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  recentListContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recentItem: {
    // width adjusted via scale
    alignItems: 'center',
  },
  recentImage: {
    // width, height adjusted via scale
    borderRadius: 4,
    marginBottom: 8,
  },
  recentLabel: {
    // fontSize adjusted via scale
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    overflow: 'visible',
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    position: 'relative',
  },
  cardImage: {
    // width, height adjusted via scale
    resizeMode: 'cover',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  heartBackground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  heartImage: {
    width: 16,
    height: 16,
  },
  cardContent: {
    padding: 8,
  },
  cardTitle: {
    // fontSize adjusted via scale
    color: '#333333',
    marginBottom: 4,
    lineHeight: 20,
  },
  cardSubtitle: {
    // fontSize adjusted via scale
    color: '#666666',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  cardPrice: {
    // fontSize adjusted via scale
    fontWeight: '600',
    color: '#333333',
  },
  cardMrp: {
    // fontSize adjusted via scale
    color: '#666666',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  cardDiscount: {
    // fontSize adjusted via scale
    color: '#FF6B00',
    fontWeight: '500',
    marginLeft: 4,
  },
  ratingContainer: {
    marginTop: 4,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    // fontSize adjusted via scale
    color: '#333333',
    marginLeft: 2,
  },
  errorText: {
    // fontSize adjusted via scale
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
  noItemsText: {
    // fontSize adjusted via scale
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  noMoreText: {
    // fontSize adjusted via scale
    textAlign: 'center',
    marginVertical: 10,
    color: '#666',
  },
});

export default PartnerSearchCategory;