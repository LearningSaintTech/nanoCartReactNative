// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Modal,
//   SafeAreaView,
//   Alert,
// } from 'react-native';
// import { useSelector, useDispatch } from 'react-redux';
// import { setSelectedItem } from '../../redux/reducers/itemSlice';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import GenderTabs from '../Component/GenderTabs';
// import SuggestionCard from '../Component/SuggestionCard';
// import { debounce } from 'lodash';
// import { BASE_URL } from '../../config/apiConfig';
// import girl1Image from '../../assets/Images/Girl1.png';
// import girl2Image from '../../assets/Images/Girl2.png';
// import girl3Image from '../../assets/Images/Girl3.png';

// const SearchCategory = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const token = useSelector(state => state.auth.token);
//   const dispatch = useDispatch();
//   const [wishlistItem, setWishlistItem] = useState(null);
//   const [cartItem, setCartItem] = useState(null);
//   const [wishlistLoading, setWishlistLoading] = useState(true);
//   const [cartLoading, setCartLoading] = useState(true);
//   const [wishlistError, setWishlistError] = useState(null);
//   const [cartError, setCartError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [products, setProducts] = useState([]);
//   const [isFilterModalVisible, setFilterModalVisible] = useState(false);
//   const [isSortModalVisible, setSortModalVisible] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [appliedFilters, setAppliedFilters] = useState({}); // Initially no filters applied
//   const [sortBy, setSortBy] = useState('latestAddition'); // Match backend default
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [activeFilterCount, setActiveFilterCount] = useState(0);
//   const [listKey, setListKey] = useState(Date.now().toString());
//   const [filtersData, setFiltersData] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [filterLoading, setFilterLoading] = useState(false);
//   const [filterError, setFilterError] = useState(null);
//   const [currentSort, setCurrentSort] = useState(sortBy);
//   const [priceRange, setPriceRange] = useState({ min: '', max: '' }); // Initially no price filter
//   const [categoryId, setCategoryId] = useState(
//     route.params?.categoryId || ''
//   );
//   const [subCategoryId, setSubCategoryId] = useState(
//     route.params?.subCategoryId || ''
//   );
//   const limit = 5;
//   const sortOptions = [
//     { label: 'Latest', value: 'latestAddition' }, // Updated to match backend
//     { label: 'Popularity', value: 'popularity' },
//     { label: 'Price: High to Low', value: 'priceHighToLow' },
//     { label: 'Price: Low to High', value: 'priceLowToHigh' },
//     { label: 'Offers & Discount', value: 'offer' },
//   ];

//   // Fetch wishlist data
//   useEffect(() => {
//     const fetchWishlist = async () => {
//       if (!token) {
//         setWishlistError('Login required to see details');
//         setWishlistLoading(false);
//         return;
//       }

//       try {
//         setWishlistLoading(true);
//         setWishlistError(null);

//         console.log('📥 Fetching wishlist from:', `${BASE_URL}/userwishlist`);
//         const response = await fetch(`${BASE_URL}/userwishlist`, {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           const errorText = await response.text();
//           console.error('❌ Wishlist server response:', errorText);
//           const errorData = response.headers.get('content-type')?.includes('application/json')
//             ? JSON.parse(errorText)
//             : {};
//           throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log('🌐 Wishlist response:', data);

//         if (data.success && data.data?.items?.length > 0) {
//           setWishlistItem(data.data.items[0]);
//         } else {
//           setWishlistError(data.message || 'No wishlist items found');
//         }
//       } catch (err) {
//         const errorMessage = err.message.includes('401')
//           ? 'Login required to see details'
//           : 'Failed to fetch wishlist. Please try again.';
//         setWishlistError(errorMessage);
//         console.error('❌ Wishlist error:', errorMessage);
//       } finally {
//         setWishlistLoading(false);
//       }
//     };
//     fetchWishlist();
//   }, [token]);

//   // Fetch cart data
//   useEffect(() => {
//     const fetchCart = async () => {
//       if (!token) {
//         setCartError('Login required to see details');
//         setCartLoading(false);
//         return;
//       }

//       try {
//         setCartLoading(true);
//         setCartError(null);

//         console.log('📥 Fetching cart from:', `${BASE_URL}/usercart`);
//         const response = await fetch(`${BASE_URL}/usercart`, {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           const errorText = await response.text();
//           console.error('❌ Cart server response:', errorText);
//           const errorData = response.headers.get('content-type')?.includes('application/json')
//             ? JSON.parse(errorText)
//             : {};
//           throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log('🌐 Cart response:', data);
//         if (data.success && data.data?.items?.length > 0) {
//           setCartItem(data.data.items[0]);
//         } else {
//           setCartError(data.message || 'No cart items found');
//         }
//       } catch (err) {
//         const errorMessage = err.message.includes('401')
//           ? 'Login required to see details'
//           : 'Failed to fetch cart. Please try again.';
//         setCartError(errorMessage);
//         console.error('❌ Cart error:', errorMessage);
//       } finally {
//         setCartLoading(false);
//       }
//     };
//     fetchCart();
//   }, [token]);

//   // Fetch filter options using the /filtering API (only when filter modal is opened)
//   const fetchFilters = async () => {
//     if (!token) {
//       setFilterError('Login required to see details');
//       setFilterLoading(false);
//       return;
//     }

//     try {
//       setFilterLoading(true);
//       setFilterError(null);

//       const apiUrl = `${BASE_URL}/items/filtering`;
//       const requestBody = {
//         categoryId, // Use state values
//         subCategoryId,
//         filters: [], // No filters applied for fetching options
//         name: '',
//         keyword: '',
//         sortBy: 'latestAddition',
//         page: 1,
//         limit: 1, // Minimal limit to fetch filter metadata
//       };

//       console.log('📥 Fetching filters from:', apiUrl, 'Body:', JSON.stringify(requestBody, null, 2));

//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(requestBody),
//       });

//       console.log('🌐 Filter response status:', response.status);

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('❌ Filter server response:', errorText);
//         const errorData = response.headers.get('content-type')?.includes('application/json')
//           ? JSON.parse(errorText)
//           : {};
//         throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
//       }

//       const json = await response.json();
//       console.log('🌐 Filters response:', JSON.stringify(json, null, 2));

//       if (json?.success && Array.isArray(json.data?.filters)) {
//         const mappedFilters = {};
//         json.data.filters.forEach(filter => {
//           if (filter.key && Array.isArray(filter.values)) {
//             mappedFilters[filter.key] = {};
//             filter.values.forEach(val => {
//               mappedFilters[filter.key][val] = appliedFilters?.[filter.key]?.[val] || false;
//             });
//           }
//         });
//         mappedFilters['Price range'] = { enabled: false };
//         setFiltersData([...json.data.filters, { key: 'Price range', values: [] }]);
//         setFilters(mappedFilters);
//         setSelectedCategory(json.data.filters[0]?.key || 'Price range');
//         console.log('✅ Filters set:', JSON.stringify(mappedFilters, null, 2));
//       } else {
//         throw new Error(json?.message || 'No filters available');
//       }
//     } catch (error) {
//       const errorMessage = error.message.includes('401')
//         ? 'Login required to see details'
//         : 'Error fetching filters. Please try again.';
//       setFilterError(errorMessage);
//       console.error('❌ Filter fetch error:', errorMessage);
//     } finally {
//       setFilterLoading(false);
//     }
//   };

//   // Fetch search results using the /filtering API (only when searchQuery is non-empty)
//   useEffect(() => {
//     if (!searchQuery) {
//       setProducts([]);
//       setPage(1);
//       setTotalPages(1);
//       console.log('ℹ️ No search query, skipping fetchProducts');
//       return;
//     }

//     const fetchProducts = async () => {
//       setLoading(true);
//       const filterArray = [];
//       Object.keys(appliedFilters).forEach(key => {
//         if (key === 'Price range' && priceRange.min && priceRange.max) {
//           filterArray.push({
//             key: 'Price range',
//             value: `₹${priceRange.min} - ₹${priceRange.max}`,
//           });
//         } else {
//           Object.entries(appliedFilters[key])
//             .filter(([_, isSelected]) => isSelected)
//             .forEach(([val]) => {
//               filterArray.push({ key, value: val });
//             });
//         }
//       });

//       console.log('📋 Applied filters:', JSON.stringify(filterArray, null, 2));

//       const requestBody = {
//         categoryId, // Use state values
//         subCategoryId,
//         filters: filterArray, // Initially empty as appliedFilters is {}
//         name: searchQuery,
//         keyword: searchQuery,
//         sortBy,
//         page,
//         limit,
//       };

//       const apiUrl = `${BASE_URL}/items/filtering`;

//       console.log('📥 Fetching products from:', apiUrl, 'Body:', JSON.stringify(requestBody, null, 2));

//       try {
//         const response = await fetch(apiUrl, {
//           method: 'POST',
//           headers: {
//             Authorization: token ? `Bearer ${token}` : undefined,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(requestBody),
//         });

//         if (!response.ok) {
//           const errorText = await response.text();
//           console.error('❌ Filtering server response:', errorText);
//           const errorData = response.headers.get('content-type')?.includes('application/json')
//             ? JSON.parse(errorText)
//             : {};
//           throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
//         }

//         const json = await response.json();
//         console.log('🌐 Filtering response:', JSON.stringify(json, null, 2));

//         if (json?.success) {
//           const formattedItems = (json.data?.items || []).map(item => ({
//             name: item.name || 'Unnamed Item',
//             description: item.description || 'No description available',
//             mrp: item.MRP || 0,
//             price: item.discountedPrice || 0,
//             discount: item.discountPercentage || 0,
//             image: { uri: item.image || '' },
//             itemId: item._id || '',
//             defaultColor: item.defaultColor || '',
//             userAverageRating: item.userAverageRating || 4.5,
//           }));
//           setProducts(
//             page === 1 ? formattedItems : [...products, ...formattedItems],
//           );
//           setTotalPages(json.data?.totalPages || 1);
//           setListKey(Date.now().toString());
//           if (formattedItems.length === 0 && page === 1) {
//             setProducts([]);
//           }
//           console.log('✅ Products set:', formattedItems.length);
//         } else {
//           throw new Error(json?.message || 'Failed to load search results');
//         }
//       } catch (error) {
//         const errorMessage = error.message.includes('401')
//           ? 'Login required to see details'
//           : 'Failed to fetch search results. Please try again.';
//         console.error('❌ Fetch products error:', errorMessage);
//         setProducts([]);
//         setListKey(Date.now().toString());
//       } finally {
//         setLoading(false);
//       }
//     };

//     const debouncedFetchProducts = debounce(fetchProducts, 500);
//     debouncedFetchProducts();
//     return () => debouncedFetchProducts.cancel();
//   }, [searchQuery, appliedFilters, sortBy, page, token, categoryId, subCategoryId]);

//   // Update active filter count
//   useEffect(() => {
//     let count = Object.values(appliedFilters)
//       .flatMap(obj => Object.values(obj))
//       .filter(v => v).length;
//     if (priceRange.min && priceRange.max) count += 1;
//     setActiveFilterCount(count);
//     console.log('📊 Active filter count:', count);
//   }, [appliedFilters, priceRange]);

//   // Handlers
//   const handleApplyFilters = (filteredItems, filters, pagination) => {
//     setProducts(filteredItems);
//     setAppliedFilters(filters);
//     setPage(1);
//     setTotalPages(pagination?.totalPages || 1);
//     setListKey(Date.now().toString());
//     setFilterModalVisible(false);
//     console.log('✅ Filters applied:', JSON.stringify(filters, null, 2));
//   };

//   const handleApplySort = sortOption => {
//     setSortBy(sortOption || 'latestAddition');
//     setCurrentSort(sortOption || 'latestAddition');
//     setPage(1);
//     setSortModalVisible(false);
//     console.log('🗂️ Sort applied:', sortOption || 'latestAddition');
//   };

//   const openFilterModal = () => {
//     if (!token) {
//       setFilterError('Login required to see details');
//       setFilterModalVisible(true);
//       console.log('⚠️ No token, prompting login for filters');
//       return;
//     }
//     setFilterModalVisible(true);
//     fetchFilters(); // Fetch filters only when modal is opened
//     console.log('ℹ️ Opening filter modal, fetching filters');
//   };

//   const closeFilterModal = () => {
//     setFilterModalVisible(false);
//     console.log('ℹ️ Closing filter modal');
//   };

//   const openSortModal = () => {
//     setSortModalVisible(true);
//     console.log('ℹ️ Opening sort modal');
//   };

//   const closeSortModal = () => {
//     setSortModalVisible(false);
//     console.log('ℹ️ Closing sort modal');
//   };

//   const handleLoadMore = () => {
//     if (page < totalPages && !loading) {
//       setPage(prev => prev + 1);
//       console.log('📄 Loading more, page:', page + 1);
//     }
//   };

//   const handleFilterChange = (category, option) => {
//     setFilters(prev => ({
//       ...prev,
//       [category]: {
//         ...prev[category],
//         [option]: !prev[category][option],
//       },
//     }));
//     console.log('🔍 Filter changed:', category, option);
//   };

//   const clearAllFilters = () => {
//     const cleared = {};
//     filtersData.forEach(filter => {
//       if (filter.key !== 'Price range') {
//         cleared[filter.key] = {};
//         filter.values.forEach(val => {
//           cleared[filter.key][val] = false;
//         });
//       }
//     });
//     setFilters(cleared);
//     setAppliedFilters({}); // Reset applied filters to ensure no filters
//     setPriceRange({ min: '', max: '' });
//     handleApplyFilters([], cleared, {
//       currentPage: 1,
//       totalPages: 1,
//       totalItems: 0,
//     });
//     console.log('🗑️ Cleared all filters');
//   };

//   const applyFilters = async (filterState = filters) => {
//     if (!token) {
//       setFilterError('Login required to see details');
//       console.log('⚠️ No token, prompting login for apply filters');
//       return;
//     }

//     if (priceRange.min && priceRange.max) {
//       const min = Number(priceRange.min);
//       const max = Number(priceRange.max);
//       if (isNaN(min) || isNaN(max) || min > max) {
//         Alert.alert(
//           'Error',
//           'Invalid price range. Ensure Min and Max are numbers and Min is less than Max.',
//         );
//         console.warn('⚠️ Invalid price range:', priceRange);
//         return;
//       }
//     }

//     const filterArray = [];
//     Object.keys(filterState).forEach(key => {
//       if (key === 'Price range' && priceRange.min && priceRange.max) {
//         filterArray.push({
//           key: 'Price range',
//           value: `₹${priceRange.min} - ₹${priceRange.max}`,
//         });
//       } else {
//         Object.entries(filterState[key])
//           .filter(([_, isSelected]) => isSelected)
//           .forEach(([val]) => {
//             filterArray.push({ key, value: val });
//           });
//       }
//     });

//     console.log('📋 Applying filters:', JSON.stringify(filterArray, null, 2));

//     const requestBody = {
//       categoryId,
//       subCategoryId,
//       filters: filterArray,
//       name: searchQuery,
//       keyword: searchQuery,
//       sortBy,
//       page: 1,
//       limit,
//     };

//     const apiUrl = `${BASE_URL}/items/filtering`;
//     try {
//       setFilterLoading(true);
//       console.log('📥 Applying filters to:', apiUrl, 'Body:', JSON.stringify(requestBody, null, 2));
//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('❌ Filter apply server response:', errorText);
//         const errorData = response.headers.get('content-type')?.includes('application/json')
//           ? JSON.parse(errorText)
//           : {};
//         throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('🌐 Filter apply response:', JSON.stringify(data, null, 2));

//       if (data?.success) {
//         const formattedItems = (data.data?.items || []).map(item => ({
//           name: item.name || 'Unnamed Item',
//           description: item.description || '',
//           mrp: item.MRP || 0,
//           price: item.discountedPrice || 0,
//           discount: item.discountPercentage || 0,
//           image: { uri: item.image || '' },
//           itemId: item._id || '',
//           defaultColor: item.defaultColor || '',
//           userAverageRating: item.userAverageRating || 4.5,
//         }));
//         handleApplyFilters(formattedItems, filterState, {
//           currentPage: data.data?.currentPage || 1,
//           totalPages: data.data?.totalPages || 1,
//           totalItems: data.data?.totalItems || 0,
//         });
//         if (formattedItems.length === 0) {
//           setProducts([]);
//         }
//         console.log('✅ Applied filters, products set:', formattedItems.length);
//       } else {
//         throw new Error(data?.message || 'Failed to apply filters');
//       }
//     } catch (error) {
//       const errorMessage = error.message.includes('401')
//         ? 'Login required to see details'
//         : 'Error applying filters. Please try again.';
//       setFilterError(errorMessage);
//       console.error('❌ Apply filters error:', errorMessage);
//     } finally {
//       setFilterLoading(false);
//     }
//   };

//   // SubCategoryItem logic
//   const renderSubCategoryItem = ({ item }) => {
//     const handleHeartPress = async () => {
//       const itemId = item?.itemId;
//       const color = item?.defaultColor || 'Black';

//       if (!itemId) {
//         console.warn('⚠️ item.itemId is missing');
//         return;
//       }

//       if (!token) {
//         dispatch(setSelectedItem({ itemId, color }));
//         navigation.navigate('Login', {
//           fromScreen: 'SearchCategory',
//           actionAfterLogin: 'like_item',
//           itemId,
//         });
//         console.log('⚠️ No token, redirecting to login for wishlist');
//         return;
//       }

//       try {
//         console.log('📥 Adding to wishlist:', `${BASE_URL}/userwishlist/create`, { itemId, color });
//         const res = await fetch(`${BASE_URL}/userwishlist/create`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ itemId, color }),
//         });

//         if (!res.ok) {
//           const errorText = await res.text();
//           console.error('❌ Wishlist create server response:', errorText);
//           const errorData = res.headers.get('content-type')?.includes('application/json')
//             ? JSON.parse(errorText)
//             : {};
//           throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
//         }

//         const data = await res.json();
//         console.log('🌐 Wishlist create response:', data);

//         if (data.success) {
//           navigation.navigate('Wishlist');
//           console.log('✅ Added to wishlist, navigating to Wishlist');
//         } else {
//           throw new Error(data.message || 'Failed to add to wishlist');
//         }
//       } catch (error) {
//         const errorMessage = error.message.includes('401')
//           ? 'Login required to see details'
//           : 'Something went wrong while adding to wishlist';
//         console.error('❌ Wishlist add error:', errorMessage);
//       }
//     };

//     const rating = item.userAverageRating || 4.5;
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;

//     return (
//       <TouchableOpacity
//         style={styles.card}
//         onPress={() => {
//           navigation.navigate('ProductDetail', { itemId: item.itemId });
//           console.log('ℹ️ Navigating to ProductDetail:', item.itemId);
//         }}>
//         <View style={styles.imageContainer}>
//           <Image
//             source={{ uri: item.image?.uri || 'https://via.placeholder.com/150' }}
//             style={styles.image}
//             onError={e => console.log('❌ Image load error:', e.nativeEvent.error)}
//           />
//           <TouchableOpacity style={styles.heartIcon} onPress={handleHeartPress}>
//             <View style={styles.heartBackground}>
//               <Image
//                 source={require('../../assets/Images/Heart.png')}
//                 style={styles.heartImage}
//               />
//             </View>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.contentContainer}>
//           <Text numberOfLines={2} style={styles.title}>
//             {item.name || 'No Name'}
//           </Text>
//           <Text style={styles.subtitle}>Women's Party Wear</Text>

//           <View style={styles.priceContainer}>
//             <Text style={styles.mrpLabel}>MRP</Text>
//             <Text style={styles.mrp}>₹{(item.mrp || 0).toFixed(2)}</Text>
//             <Text style={styles.price}>₹{(item.price || 0).toFixed(2)}</Text>
//             <Text style={styles.discount}>
//               {Math.round(item.discount) || 0}% Off
//             </Text>
//           </View>

//           <View style={styles.ratingContainer}>
//             <View style={styles.stars}>
//               {[...Array(fullStars)].map((_, index) => (
//                 <Icon key={index} name="star" size={12} color="#FF9017" />
//               ))}
//               {hasHalfStar && (
//                 <Icon name="star-half-empty" size={12} color="#FF9017" />
//               )}
//               {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map(
//                 (_, index) => (
//                   <Icon
//                     key={index + fullStars + 1}
//                     name="star-o"
//                     size={12}
//                     color="#FF9017"
//                   />
//                 ),
//               )}
//               <Text style={styles.rating}> {rating.toFixed(1)}</Text>
//             </View>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   // Filter modal logic
//   const CustomCheckbox = ({ value, onValueChange }) => (
//     <TouchableOpacity
//       onPress={onValueChange}
//       style={[styles.checkboxBase, value && styles.checkboxChecked]}>
//       {value && <Text style={styles.checkmark}>✓</Text>}
//     </TouchableOpacity>
//   );

//   const renderFilterOptions = () => {
//     if (!selectedCategory || !filters[selectedCategory]) return null;

//     if (selectedCategory === 'Price range') {
//       return (
//         <View style={styles.priceRangeContainer}>
//           <Text style={styles.optionText}>Price Range (₹)</Text>
//           <View style={styles.priceInputRow}>
//             <TextInput
//               style={styles.priceInput}
//               placeholder="Min"
//               keyboardType="numeric"
//               value={priceRange.min}
//               onChangeText={text =>
//                 setPriceRange(prev => ({ ...prev, min: text }))
//               }
//             />
//             <Text style={styles.priceDash}> - </Text>
//             <TextInput
//               style={styles.priceInput}
//               placeholder="Max"
//               keyboardType="numeric"
//               value={priceRange.max}
//               onChangeText={text =>
//                 setPriceRange(prev => ({ ...prev, max: text }))
//               }
//             />
//           </View>
//         </View>
//       );
//     }

//     return Object.keys(filters[selectedCategory]).map(option => (
//       <View key={option} style={styles.optionRow}>
//         <CustomCheckbox
//           value={filters[selectedCategory][option]}
//           onValueChange={() => handleFilterChange(selectedCategory, option)}
//         />
//         <Text
//           style={[
//             styles.optionText,
//             filters[selectedCategory][option] && styles.selectedOptionText,
//           ]}>
//           {option}
//         </Text>
//       </View>
//     ));
//   };

//   const renderFilterModal = () => {
//     if (filterLoading) {
//       return (
//         <View style={styles.filterModalContainer}>
//           <ActivityIndicator size="large" color="#F36F25" />
//         </View>
//       );
//     }

//     if (filterError) {
//       return (
//         <View style={styles.filterModalContainer}>
//           <Text style={styles.errorText}>{filterError}</Text>
//           <TouchableOpacity
//             onPress={() => {
//               if (filterError.includes('Login required')) {
//                 navigation.navigate('Login', {
//                   fromScreen: 'SearchCategory',
//                   actionAfterLogin: 'view_filters',
//                 });
//                 console.log('ℹ️ Navigating to Login from filter error');
//               } else {
//                 closeFilterModal();
//               }
//             }}
//             style={styles.closeButton}>
//             <Text style={styles.closeButtonText}>
//               {filterError.includes('Login required') ? 'Login' : 'Close'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       );
//     }

//     return (
//       <View style={styles.filterModalContainer}>
//         <View style={styles.filterContent}>
//           <View style={styles.filterHeader}>
//             <TouchableOpacity
//               onPress={closeFilterModal}
//               style={styles.backButton}>
//               <Text style={styles.backText}>←</Text>
//             </TouchableOpacity>
//             <Text style={styles.filterHeaderTitle}>FILTER</Text>
//             <TouchableOpacity onPress={clearAllFilters}>
//               <Text style={styles.clearText}>Clear all</Text>
//             </TouchableOpacity>
//           </View>

//           <View style={styles.filterBody}>
//             <ScrollView style={styles.leftColumn}>
//               {filtersData.map(cat => (
//                 <TouchableOpacity
//                   key={cat.key}
//                   style={[
//                     styles.categoryButton,
//                     selectedCategory === cat.key && styles.activeCategory,
//                   ]}
//                   onPress={() => setSelectedCategory(cat.key)}>
//                   <Text
//                     style={[
//                       styles.categoryText,
//                       selectedCategory === cat.key && styles.activeCategoryText,
//                     ]}>
//                     {cat.key} (
//                     {cat.key === 'Price range' ? 'Custom' : cat.values.length})
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>

//             <ScrollView style={styles.rightColumn}>
//               {renderFilterOptions()}
//             </ScrollView>
//           </View>

//           <TouchableOpacity
//             style={styles.applyButton}
//             onPress={() => applyFilters()}
//             disabled={filterLoading}>
//             <Text style={styles.applyButtonText}>
//               {filterLoading ? 'Applying...' : 'APPLY'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   // Sort modal logic
//   const renderSortModal = () => (
//     <View style={styles.sortModalContainer}>
//       <ScrollView style={styles.sortContent}>
//         <Text style={styles.sortTitle}>SORT BY</Text>

//         <TouchableOpacity
//           style={styles.sortCloseButton}
//           onPress={closeSortModal}>
//           <Text style={styles.sortCloseText}>×</Text>
//         </TouchableOpacity>

//         {sortOptions.map(option => (
//           <TouchableOpacity
//             key={option.value}
//             style={styles.sortOptionRow}
//             onPress={() => setCurrentSort(option.value)}>
//             <Text
//               style={[
//                 styles.sortOptionText,
//                 currentSort === option.value && styles.sortSelectedOption,
//               ]}>
//               {option.label}
//             </Text>
//           </TouchableOpacity>
//         ))}

//         <TouchableOpacity
//           style={styles.sortClearButton}
//           onPress={() => setCurrentSort(null)}>
//           <Text style={styles.sortClearButtonText}>CLEAR ALL</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.sortApplyButton}
//           onPress={() => handleApplySort(currentSort)}>
//           <Text style={styles.sortApplyButtonText}>APPLY</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );

//   // Main content
//   const renderContent = () => {
//     if (searchQuery) {
//       return (
//         <SafeAreaView style={styles.container}>
//           <View style={styles.header}>
//             <TouchableOpacity
//               onPress={() => {
//                 setSearchQuery('');
//                 setPage(1);
//                 setProducts([]);
//                 console.log('ℹ️ Cleared search query');
//               }}>
//               <Image
//                 source={require('../../assets/Images/Back1.png')}
//                 style={styles.backIcon}
//               />
//             </TouchableOpacity>

//             <View style={styles.searchBox}>
//               <Image
//                 source={require('../../assets/Images/SearchIcon.png')}
//                 style={styles.searchIcon}
//               />
//               <TextInput
//                 placeholder="Search your style"
//                 placeholderTextColor="#999999"
//                 style={styles.searchInput}
//                 value={searchQuery}
//                 onChangeText={text => {
//                   setSearchQuery(text);
//                   setPage(1);
//                   setProducts([]);
//                   console.log('🔍 Search query updated:', text);
//                 }}
//                 autoFocus={true}
//               />
//             </View>
//           </View>

//           <View style={styles.resultsContainer}>
//             {loading && page === 1 ? (
//               <ActivityIndicator
//                 size="large"
//                 color="#9B5AF5"
//                 style={{ marginTop: 20 }}
//               />
//             ) : products.length === 0 ? (
//               <Text style={styles.noItemsText}>No items found</Text>
//             ) : (
//               <FlatList
//                 key={listKey}
//                 data={products}
//                 keyExtractor={item => item.itemId}
//                 numColumns={2}
//                 showsVerticalScrollIndicator={false}
//                 renderItem={renderSubCategoryItem}
//                 contentContainerStyle={styles.grid}
//                 onEndReached={handleLoadMore}
//                 onEndReachedThreshold={0.5}
//                 ListFooterComponent={() =>
//                   loading && page > 1 ? (
//                     <ActivityIndicator
//                       size="small"
//                       color="#9B5AF5"
//                       style={{ marginVertical: 10 }}
//                     />
//                   ) : page === totalPages && products.length > 0 ? (
//                     <Text style={styles.noMoreText}>No more items to load</Text>
//                   ) : null
//                 }
//               />
//             )}
//           </View>

//           <View style={styles.footerButtons}>
//             <TouchableOpacity
//               style={[styles.filterBtn, !token && styles.disabledBtn]}
//               onPress={openFilterModal}
//               disabled={!token}
//               accessibilityLabel={`Filter products${
//                 activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''
//               }`}>
//               <Image
//                 source={require('../../assets/Images/Filter.png')}
//                 style={[styles.icon, !token && styles.disabledIcon]}
//               />
//               <Text style={[styles.iconText, !token && styles.disabledText]}>
//                 FILTER{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.sortBtn}
//               onPress={openSortModal}
//               accessibilityLabel="Sort products">
//               <Image
//                 source={require('../../assets/Images/Sort.png')}
//                 style={styles.icon}
//               />
//               <Text style={styles.iconText}>SORT</Text>
//             </TouchableOpacity>
//           </View>
//         </SafeAreaView>
//       );
//     }

//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Image
//               source={require('../../assets/icon/BackIcon.png')}
//               style={styles.backIcon}
//             />
//           </TouchableOpacity>

//           <View style={styles.searchBox}>
//             <Image
//               source={require('../../assets/icon/SearchIcon.png')}
//               style={styles.searchIcon}
//             />
//             <TextInput
//               placeholder="Search your style"
//               placeholderTextColor="#999999"
//               style={styles.searchInput}
//               value={searchQuery}
//               onChangeText={text => {
//                 setSearchQuery(text);
//                 setPage(1);
//                 setProducts([]);
//                 console.log('🔍 Search query updated:', text);
//               }}
//             />
//           </View>
//         </View>

//         <ScrollView contentContainerStyle={styles.mainContentContainer}>
//           <Text style={styles.sectionTitle}>Recent Searches</Text>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.recentSearchesContainer}>
//             <TouchableOpacity
//               style={styles.recentItem}
//               onPress={() => {
//                 setSearchQuery('Chiffon Saree');
//                 setPage(1);
//                 setProducts([]);
//                 console.log('🔍 Selected recent search: Chiffon Saree');
//               }}>
//               <Image source={girl1Image} style={styles.recentImage} />
//               <Text style={styles.recentLabel}>Chiffon Saree</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.recentItem}
//               onPress={() => {
//                 setSearchQuery('Formal Shirt');
//                 setPage(1);
//                 setProducts([]);
//                 console.log('🔍 Selected recent search: Formal Shirt');
//               }}>
//               <Image source={girl2Image} style={styles.recentImage} />
//               <Text style={styles.recentLabel}>Formal Shirt</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.recentItem}
//               onPress={() => {
//                 setSearchQuery('Formal Shirt');
//                 setPage(1);
//                 setProducts([]);
//                 console.log('🔍 Selected recent search: Formal Shirt');
//               }}>
//               <Image source={girl3Image} style={styles.recentImage} />
//               <Text style={styles.recentLabel}>Formal Shirt</Text>
//             </TouchableOpacity>
//           </ScrollView>

//           <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
//             Popular Categories
//           </Text>
//           <GenderTabs />

//           <ScrollView contentContainerStyle={styles.suggestionContainer}>
//             {wishlistLoading ? (
//               <Text style={styles.loadingText}>Loading wishlist...</Text>
//             ) : wishlistError || !wishlistItem ? (
//               <TouchableOpacity
//                 onPress={() =>
//                   wishlistError.includes('Login required') &&
//                   navigation.navigate('Login', {
//                     fromScreen: 'SearchCategory',
//                     actionAfterLogin: 'view_wishlist',
//                   })
//                 }>
//                 <Text style={styles.errorText}>
//                   {wishlistError || 'No wishlist items available'}
//                 </Text>
//               </TouchableOpacity>
//             ) : (
//               <SuggestionCard
//                 title="Searching from wishlist?"
//                 productImage={{ uri: wishlistItem.url }}
//                 productName={wishlistItem.itemId.name}
//                 productDesc={wishlistItem.itemId.description}
//                 price={wishlistItem.itemId.discountedPrice}
//                 oldPrice={wishlistItem.itemId.MRP}
//                 discount={Math.round(
//                   ((wishlistItem.itemId.MRP - wishlistItem.itemId.discountedPrice) /
//                     wishlistItem.itemId.MRP) *
//                     100,
//                 )}
//                 rating={4.5}
//                 reviews="79 Ratings & 55"
//                 sizes={['XS', 'S', 'M', 'L', 'XL']}
//                 colors={[wishlistItem.color.toLowerCase()]}
//                 buttonLabel="VIEW WISHLIST"
//                 onButtonPress={() => {
//                   navigation.navigate('Wishlist');
//                   console.log('ℹ️ Navigating to Wishlist from suggestion card');
//                 }}
//               />
//             )}

//             {cartLoading ? (
//               <Text style={styles.loadingText}>Loading cart...</Text>
//             ) : cartError || !cartItem ? (
//               <TouchableOpacity
//                 onPress={() =>
//                   cartError.includes('Login required') &&
//                   navigation.navigate('Login', {
//                     fromScreen: 'SearchCategory',
//                     actionAfterLogin: 'view_cart',
//                   })
//                 }>
//                 <Text style={styles.errorText}>
//                   {cartError || 'No cart items available'}
//                 </Text>
//               </TouchableOpacity>
//             ) : (
//               <SuggestionCard
//                 title="Missing anything from bag?"
//                 productImage={{ uri: cartItem.itemId.image }}
//                 productName={cartItem.itemId.name}
//                 productDesc={cartItem.itemId.description}
//                 price={cartItem.itemId.discountedPrice}
//                 oldPrice={cartItem.itemId.MRP}
//                 discount={Math.round(
//                   ((cartItem.itemId.MRP - cartItem.itemId.discountedPrice) /
//                     cartItem.itemId.MRP) *
//                     100,
//                 )}
//                 rating={4.5}
//                 reviews="121 Ratings & 59"
//                 sizes={[cartItem.size]}
//                 colors={[cartItem.color.toLowerCase()]}
//                 buttonLabel="VIEW CART"
//                 onButtonPress={() => {
//                   navigation.navigate('Cart');
//                   console.log('ℹ️ Navigating to Cart from suggestion card');
//                 }}
//               />
//             )}
//           </ScrollView>
//         </ScrollView>
//       </SafeAreaView>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {renderContent()}
//       <Modal
//         animationType="slide"
//         transparent
//         visible={isFilterModalVisible}
//         onRequestClose={closeFilterModal}>
//         {renderFilterModal()}
//       </Modal>
//       <Modal
//         animationType="slide"
//         transparent
//         visible={isSortModalVisible}
//         onRequestClose={closeSortModal}>
//         {renderSortModal()}
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   mainContentContainer: {
//     paddingBottom: 20,
//   },
//   suggestionContainer: {
//     paddingHorizontal: 16,
//     paddingBottom: 20,
//   },
//   resultsContainer: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E0E0E0',
//   },
//   backIcon: {
//     marginTop: 30,
//     width: 30,
//     height: 24,
//     marginRight: 12,
//   },
//   sectionTitle: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#000000',
//     marginLeft: 16,
//     marginTop: 20,
//     marginBottom: 12,
//   },
//   recentSearchesContainer: {
//     paddingHorizontal: 16,
//     paddingBottom: 8,
//   },
//   recentItem: {
//     marginRight: 16,
//     alignItems: 'center',
//     width: 90,
//   },
//   recentImage: {
//     width: 90,
//     height: 90,
//     borderRadius: 4,
//     backgroundColor: '#F5F5F5',
//   },
//   recentLabel: {
//     fontSize: 12,
//     color: '#333333',
//     marginTop: 6,
//     textAlign: 'center',
//     fontWeight: '400',
//   },
//   searchBox: {
//     marginTop: 30,
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     borderWidth: 0.5,
//     borderColor: '#CCCCCC',
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 10,
//     height: 40,
//     borderRadius: 0,
//     marginRight: 12,
//   },
//   searchIcon: {
//     width: 20,
//     height: 20,
//     marginRight: 10,
//     opacity: 0.6,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: '#333333',
//     paddingVertical: 8,
//     includeFontPadding: false,
//     textAlignVertical: 'center',
//   },
//   loadingText: {
//     fontSize: 14,
//     color: '#666666',
//     textAlign: 'center',
//     marginVertical: 20,
//   },
//   errorText: {
//     fontSize: 14,
//     color: '#666666',
//     textAlign: 'center',
//     marginVertical: 20,
//     textDecorationLine: 'underline',
//   },
//   grid: {
//     padding: 10,
//     paddingBottom: 100,
//   },
//   noItemsText: {
//     textAlign: 'center',
//     marginTop: 20,
//     fontSize: 16,
//     color: '#666',
//   },
//   footerButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#E0E0E0',
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     zIndex: 1000,
//   },
//   filterBtn: {
//     backgroundColor: '#fff',
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     width: '45%',
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   sortBtn: {
//     backgroundColor: '#fff',
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     width: '45%',
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   disabledBtn: {
//     backgroundColor: '#f5f5f5',
//     borderColor: '#e0e0e0',
//   },
//   icon: {
//     width: 18,
//     height: 18,
//     marginRight: 6,
//     resizeMode: 'contain',
//   },
//   disabledIcon: {
//     opacity: 0.5,
//   },
//   iconText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   disabledText: {
//     color: '#999',
//   },
//   noMoreText: {
//     textAlign: 'center',
//     marginVertical: 10,
//     fontSize: 14,
//     color: '#666',
//   },
//   card: {
//     width: '47%',
//     backgroundColor: '#fff',
//     marginVertical: 8,
//     marginHorizontal: '1.5%',
//     borderRadius: 8,
//     overflow: 'visible',
//   },
//   imageContainer: {
//     width: '100%',
//     aspectRatio: 3 / 4,
//     position: 'relative',
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//   },
//   heartIcon: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     zIndex: 1,
//   },
//   heartBackground: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 50,
//     padding: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   heartImage: {
//     width: 16,
//     height: 16,
//   },
//   contentContainer: {
//     padding: 8,
//   },
//   title: {
//     fontSize: 14,
//     color: '#333333',
//     marginBottom: 4,
//     lineHeight: 20,
//   },
//   subtitle: {
//     fontSize: 12,
//     color: '#666666',
//     marginBottom: 6,
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     gap: 4,
//     marginBottom: 4,
//   },
//   mrpLabel: {
//     fontSize: 12,
//     color: '#666666',
//   },
//   price: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333333',
//   },
//   mrp: {
//     fontSize: 12,
//     color: '#666666',
//     textDecorationLine: 'line-through',
//   },
//   discount: {
//     fontSize: 12,
//     color: '#FF6B00',
//     fontWeight: '500',
//   },
//   ratingContainer: {
//     marginTop: 4,
//   },
//   stars: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   rating: {
//     fontSize: 12,
//     color: '#333333',
//     marginLeft: 2,
//   },
//   filterModalContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   filterContent: {
//     flex: 1,
//     width: '100%',
//   },
//   filterHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     justifyContent: 'space-between',
//     borderBottomWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   backButton: {
//     padding: 4,
//   },
//   backText: {
//     fontSize: 24,
//     color: '#000',
//   },
//   filterHeaderTitle: {
//     fontSize: 16,
//     color: '#000',
//     fontWeight: '500',
//   },
//   clearText: {
//     fontSize: 14,
//     color: '#F36F25',
//     fontWeight: '400',
//   },
//   filterBody: {
//     flexDirection: 'row',
//     flex: 1,
//   },
//   leftColumn: {
//     width: '50%',
//     backgroundColor: '#F5F5F5',
//     borderRightWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   rightColumn: {
//     width: '50%',
//     backgroundColor: '#fff',
//   },
//   categoryButton: {
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   categoryText: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '400',
//   },
//   activeCategory: {
//     backgroundColor: '#fff',
//     borderLeftWidth: 4,
//     borderLeftColor: '#F36F25',
//   },
//   activeCategoryText: {
//     color: '#F36F25',
//     fontWeight: '500',
//   },
//   optionRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   optionText: {
//     marginLeft: 12,
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '400',
//   },
//   selectedOptionText: {
//     color: '#F36F25',
//     fontWeight: '500',
//   },
//   applyButton: {
//     backgroundColor: '#F36F25',
//     margin: 16,
//     paddingVertical: 14,
//     borderRadius: 4,
//     alignItems: 'center',
//   },
//   applyButtonText: {
//     color: '#fff',
//     fontWeight: '500',
//     fontSize: 16,
//   },
//   checkboxBase: {
//     width: 20,
//     height: 20,
//     borderRadius: 4,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   checkboxChecked: {
//     backgroundColor: '#F36F25',
//     borderColor: '#F36F25',
//   },
//   checkmark: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   closeButton: {
//     backgroundColor: '#F36F25',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 4,
//   },
//   closeButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   priceRangeContainer: {
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   priceInputRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   priceInput: {
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     borderRadius: 4,
//     padding: 8,
//     width: 80,
//     textAlign: 'center',
//   },
//   priceDash: {
//     marginHorizontal: 10,
//     fontSize: 16,
//     color: '#333',
//   },
//   sortModalContainer: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   sortContent: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderTopLeftRadius: 10,
//     borderTopRightRadius: 10,
//     maxHeight: '55%',
//   },
//   sortTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   sortCloseButton: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//   },
//   sortCloseText: {
//     fontSize: 24,
//     color: '#000',
//   },
//   sortOptionRow: {
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   sortOptionText: {
//     fontSize: 16,
//   },
//   sortSelectedOption: {
//     color: '#D86427',
//     fontWeight: 'bold',
//   },
//   sortApplyButton: {
//     backgroundColor: '#D86427',
//     padding: 12,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   sortApplyButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   sortClearButton: {
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginTop: 10,
//     borderWidth: 1,
//     borderColor: '#D86427',
//   },
//   sortClearButtonText: {
//     color: '#D86427',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default SearchCategory;



import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedItem } from '../../redux/reducers/itemSlice';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import GenderTabs from '../Component/GenderTabs';
import SuggestionCard from '../Component/SuggestionCard';
import { debounce } from 'lodash';
import { BASE_URL } from '../../config/apiConfig';
import girl1Image from '../../assets/Images/Girl1.png';
import girl2Image from '../../assets/Images/Girl2.png';
import girl3Image from '../../assets/Images/Girl3.png';

const SearchCategory = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const token = useSelector(state => state.auth.token);
  const dispatch = useDispatch();
  const [wishlistItem, setWishlistItem] = useState(null);
  const [cartItem, setCartItem] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState(null);
  const [cartError, setCartError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({}); // Initially no filters applied
  const [sortBy, setSortBy] = useState('latestAddition'); // Match backend default
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [listKey, setListKey] = useState(Date.now().toString());
  const [filtersData, setFiltersData] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState(null);
  const [currentSort, setCurrentSort] = useState(sortBy);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' }); // Initially no price filter
  const [categoryId, setCategoryId] = useState(
    route.params?.categoryId || ''
  );
  const [subCategoryId, setSubCategoryId] = useState(
    route.params?.subCategoryId || ''
  );
  const limit = 5;
  const sortOptions = [
    { label: 'Latest', value: 'latestAddition' }, // Updated to match backend
    { label: 'Popularity', value: 'popularity' },
    { label: 'Price: High to Low', value: 'priceHighToLow' },
    { label: 'Price: Low to High', value: 'priceLowToHigh' },
    { label: 'Offers & Discount', value: 'offer' },
  ];

  // Fetch wishlist data
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) {
        setWishlistError('Login required to see details');
        setWishlistLoading(false);
        return;
      }

      try {
        setWishlistLoading(true);
        setWishlistError(null);

        console.log('📥 Fetching wishlist from:', `${BASE_URL}/userwishlist`);
        const response = await fetch(`${BASE_URL}/userwishlist`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Wishlist server response:', errorText);
          const errorData = response.headers.get('content-type')?.includes('application/json')
            ? JSON.parse(errorText)
            : {};
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('🌐 Wishlist response:', data);

        if (data.success && data.data?.items?.length > 0) {
          setWishlistItem(data.data.items[0]);
        } else {
          setWishlistError(data.message || 'No wishlist items found');
        }
      } catch (err) {
        const errorMessage = err.message.includes('401')
          ? 'Login required to see details'
          : 'Failed to fetch wishlist. Please try again.';
        setWishlistError(errorMessage);
        console.error('❌ Wishlist error:', errorMessage);
      } finally {
        setWishlistLoading(false);
      }
    };
    fetchWishlist();
  }, [token]);

  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        setCartError('Login required to see details');
        setCartLoading(false);
        return;
      }

      try {
        setCartLoading(true);
        setCartError(null);

        console.log('📥 Fetching cart from:', `${BASE_URL}/usercart`);
        const response = await fetch(`${BASE_URL}/usercart`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Cart server response:', errorText);
          const errorData = response.headers.get('content-type')?.includes('application/json')
            ? JSON.parse(errorText)
            : {};
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('🌐 Cart response:', data);
        if (data.success && data.data?.items?.length > 0) {
          setCartItem(data.data.items[0]);
        } else {
          setCartError(data.message || 'No cart items found');
        }
      } catch (err) {
        const errorMessage = err.message.includes('401')
          ? 'Login required to see details'
          : 'Failed to fetch cart. Please try again.';
        setCartError(errorMessage);
        console.error('❌ Cart error:', errorMessage);
      } finally {
        setCartLoading(false);
      }
    };
    fetchCart();
  }, [token]);

  // Fetch filter options using the /filtering API (only when filter modal is opened)
  const fetchFilters = async () => {
    if (!token) {
      setFilterError('Login required to see details');
      setFilterLoading(false);
      return;
    }

    try {
      setFilterLoading(true);
      setFilterError(null);

      const apiUrl = `${BASE_URL}/items/filtering`;
      const requestBody = {
        categoryId, // Use state values
        subCategoryId,
        filters: [], // No filters applied for fetching options
        name: '',
        keyword: '',
        sortBy: 'latestAddition',
        page: 1,
        limit: 1, // Minimal limit to fetch filter metadata
      };

      console.log('📥 Fetching filters from:', apiUrl, 'Body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🌐 Filter response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Filter server response:', errorText);
        const errorData = response.headers.get('content-type')?.includes('application/json')
          ? JSON.parse(errorText)
          : {};
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const json = await response.json();
      console.log('🌐 Filters response:', JSON.stringify(json, null, 2));

      if (json?.success && Array.isArray(json.data?.filters)) {
        const mappedFilters = {};
        json.data.filters.forEach(filter => {
          if (filter.key && Array.isArray(filter.values)) {
            mappedFilters[filter.key] = {};
            filter.values.forEach(val => {
              mappedFilters[filter.key][val] = appliedFilters?.[filter.key]?.[val] || false;
            });
          }
        });
        mappedFilters['Price range'] = { enabled: false };
        setFiltersData([...json.data.filters, { key: 'Price range', values: [] }]);
        setFilters(mappedFilters);
        setSelectedCategory(json.data.filters[0]?.key || 'Price range');
        console.log('✅ Filters set:', JSON.stringify(mappedFilters, null, 2));
      } else {
        throw new Error(json?.message || 'No filters available');
      }
    } catch (error) {
      const errorMessage = error.message.includes('401')
        ? 'Login required to see details'
        : 'Error fetching filters. Please try again.';
      setFilterError(errorMessage);
      console.error('❌ Filter fetch error:', errorMessage);
    } finally {
      setFilterLoading(false);
    }
  };

  // Fetch search results using the /filtering API (only when searchQuery is non-empty)
  useEffect(() => {
    if (!searchQuery) {
      setProducts([]);
      setPage(1);
      setTotalPages(1);
      console.log('ℹ️ No search query, skipping fetchProducts');
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      const filterArray = [];
      Object.keys(appliedFilters).forEach(key => {
        if (key === 'Price range' && priceRange.min && priceRange.max) {
          filterArray.push({
            key: 'Price range',
            value: `₹${priceRange.min} - ₹${priceRange.max}`,
          });
        } else {
          Object.entries(appliedFilters[key])
            .filter(([_, isSelected]) => isSelected)
            .forEach(([val]) => {
              filterArray.push({ key, value: val });
            });
        }
      });

      console.log('📋 Applied filters:', JSON.stringify(filterArray, null, 2));

      const requestBody = {
        categoryId, // Use state values
        subCategoryId,
        filters: filterArray, // Initially empty as appliedFilters is {}
        name: searchQuery,
        keyword: searchQuery,
        sortBy,
        page,
        limit,
      };

      const apiUrl = `${BASE_URL}/items/filtering`;

      console.log('📥 Fetching products from:', apiUrl, 'Body:', JSON.stringify(requestBody, null, 2));

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Filtering server response:', errorText);
          const errorData = response.headers.get('content-type')?.includes('application/json')
            ? JSON.parse(errorText)
            : {};
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const json = await response.json();
        console.log('🌐 Filtering response:', JSON.stringify(json, null, 2));

        if (json?.success) {
          const formattedItems = (json.data?.items || []).map(item => ({
            name: item.name || 'Unnamed Item',
            description: item.description || 'No description available',
            mrp: item.MRP || 0,
            price: item.discountedPrice || 0,
            discount: item.discountPercentage || 0,
            image: { uri: item.image || '' },
            itemId: item._id || '',
            defaultColor: item.defaultColor || '',
            userAverageRating: item.userAverageRating || 4.5,
          }));
          setProducts(
            page === 1 ? formattedItems : [...products, ...formattedItems],
          );
          setTotalPages(json.data?.totalPages || 1);
          setListKey(Date.now().toString());
          if (formattedItems.length === 0 && page === 1) {
            setProducts([]);
          }
          console.log('✅ Products set:', formattedItems.length);
        } else {
          throw new Error(json?.message || 'Failed to load search results');
        }
      } catch (error) {
        const errorMessage = error.message.includes('401')
          ? 'Login required to see details'
          : 'Failed to fetch search results. Please try again.';
        console.error('❌ Fetch products error:', errorMessage);
        setProducts([]);
        setListKey(Date.now().toString());
      } finally {
        setLoading(false);
      }
    };

    const debouncedFetchProducts = debounce(fetchProducts, 500);
    debouncedFetchProducts();
    return () => debouncedFetchProducts.cancel();
  }, [searchQuery, appliedFilters, sortBy, page, token, categoryId, subCategoryId]);

  // Update active filter count
  useEffect(() => {
    let count = Object.values(appliedFilters)
      .flatMap(obj => Object.values(obj))
      .filter(v => v).length;
    if (priceRange.min && priceRange.max) count += 1;
    setActiveFilterCount(count);
    console.log('📊 Active filter count:', count);
  }, [appliedFilters, priceRange]);

  // Handlers
  const handleApplyFilters = (filteredItems, filters, pagination) => {
    setProducts(filteredItems);
    setAppliedFilters(filters);
    setPage(1);
    setTotalPages(pagination?.totalPages || 1);
    setListKey(Date.now().toString());
    setFilterModalVisible(false);
    console.log('✅ Filters applied:', JSON.stringify(filters, null, 2));
  };

  const handleApplySort = sortOption => {
    setSortBy(sortOption || 'latestAddition');
    setCurrentSort(sortOption || 'latestAddition');
    setPage(1);
    setSortModalVisible(false);
    console.log('🗂️ Sort applied:', sortOption || 'latestAddition');
  };

  const openFilterModal = () => {
    if (!token) {
      setFilterError('Login required to see details');
      setFilterModalVisible(true);
      console.log('⚠️ No token, prompting login for filters');
      return;
    }
    setFilterModalVisible(true);
    fetchFilters(); // Fetch filters only when modal is opened
    console.log('ℹ️ Opening filter modal, fetching filters');
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
    console.log('ℹ️ Closing filter modal');
  };

  const openSortModal = () => {
    setSortModalVisible(true);
    console.log('ℹ️ Opening sort modal');
  };

  const closeSortModal = () => {
    setSortModalVisible(false);
    console.log('ℹ️ Closing sort modal');
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      setPage(prev => prev + 1);
      console.log('📄 Loading more, page:', page + 1);
    }
  };

  const handleFilterChange = (category, option) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [option]: !prev[category][option],
      },
    }));
    console.log('🔍 Filter changed:', category, option);
  };

  const clearAllFilters = () => {
    const cleared = {};
    filtersData.forEach(filter => {
      if (filter.key !== 'Price range') {
        cleared[filter.key] = {};
        filter.values.forEach(val => {
          cleared[filter.key][val] = false;
        });
      }
    });
    setFilters(cleared);
    setAppliedFilters({}); // Reset applied filters to ensure no filters
    setPriceRange({ min: '', max: '' });
    handleApplyFilters([], cleared, {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
    });
    console.log('🗑️ Cleared all filters');
  };

  const applyFilters = async (filterState = filters) => {
    if (!token) {
      setFilterError('Login required to see details');
      console.log('⚠️ No token, prompting login for apply filters');
      return;
    }

    if (priceRange.min && priceRange.max) {
      const min = Number(priceRange.min);
      const max = Number(priceRange.max);
      if (isNaN(min) || isNaN(max) || min > max) {
        Alert.alert(
          'Error',
          'Invalid price range. Ensure Min and Max are numbers and Min is less than Max.',
        );
        console.warn('⚠️ Invalid price range:', priceRange);
        return;
      }
    }

    const filterArray = [];
    Object.keys(filterState).forEach(key => {
      if (key === 'Price range' && priceRange.min && priceRange.max) {
        filterArray.push({
          key: 'Price range',
          value: `₹${priceRange.min} - ₹${priceRange.max}`,
        });
      } else {
        Object.entries(filterState[key])
          .filter(([_, isSelected]) => isSelected)
          .forEach(([val]) => {
            filterArray.push({ key, value: val });
          });
      }
    });

    console.log('📋 Applying filters:', JSON.stringify(filterArray, null, 2));

    const apiUrl = `${BASE_URL}/items/filtering`;
    try {
      setFilterLoading(true);
      console.log('📥 Applying filters to:', apiUrl, 'Body:', JSON.stringify(requestBody, null, 2));
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Filter apply server response:', errorText);
        const errorData = response.headers.get('content-type')?.includes('application/json')
          ? JSON.parse(errorText)
          : {};
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🌐 Filter apply response:', JSON.stringify(data, null, 2));

      if (data?.success) {
        const formattedItems = (data.data?.items || []).map(item => ({
          name: item.name || 'Unnamed Item',
          description: item.description || '',
          mrp: item.MRP || 0,
          price: item.discountedPrice || 0,
          discount: item.discountPercentage || 0,
          image: { uri: item.image || '' },
          itemId: item._id || '',
          defaultColor: item.defaultColor || '',
          userAverageRating: item.userAverageRating || 4.5,
        }));
        handleApplyFilters(formattedItems, filterState, {
          currentPage: data.data?.currentPage || 1,
          totalPages: data.data?.totalPages || 1,
          totalItems: data.data?.totalItems || 0,
        });
        if (formattedItems.length === 0) {
          setProducts([]);
        }
        console.log('✅ Applied filters, products set:', formattedItems.length);
      } else {
        throw new Error(data?.message || 'Failed to apply filters');
      }
    } catch (error) {
      const errorMessage = error.message.includes('401')
        ? 'Login required to see details'
        : 'Error applying filters. Please try again.';
      setFilterError(errorMessage);
      console.error('❌ Apply filters error:', errorMessage);
    } finally {
      setFilterLoading(false);
    }
  };

  // SubCategoryItem logic
  const renderSubCategoryItem = ({ item }) => {
    const handleHeartPress = async () => {
      const itemId = item?.itemId;
      const color = item?.defaultColor || 'Default'; // Fallback to 'Default' to avoid invalid color issues

      if (!itemId) {
        console.warn('⚠️ item.itemId is missing');
        Alert.alert('Error', 'Item ID is missing. Please try again.');
        return;
      }

      if (!token) {
        dispatch(setSelectedItem({ itemId, color }));
        navigation.navigate('Login', {
          fromScreen: 'SearchCategory',
          actionAfterLogin: 'like_item',
          itemId,
        });
        console.log('⚠️ No token, redirecting to login for wishlist');
        return;
      }

      try {
        console.log('📥 Adding to wishlist:', `${BASE_URL}/userwishlist/create`, { itemId, color });
        const res = await fetch(`${BASE_URL}/userwishlist/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ itemId, color }),
        });

        const responseText = await res.text();
        let errorData = {};
        try {
          errorData = res.headers.get('content-type')?.includes('application/json')
            ? JSON.parse(responseText)
            : {};
        } catch (parseError) {
          console.error('❌ Failed to parse response:', parseError);
        }

        if (!res.ok) {
          console.error('❌ Wishlist create server response:', responseText);
          const errorMessage = errorData.message || `Failed to add to wishlist (Status: ${res.status})`;
          Alert.alert('Error', errorMessage);
          return; // Exit without throwing
        }

        const data = JSON.parse(responseText);
        console.log('🌐 Wishlist create response:', data);

        if (data.success) {
          navigation.navigate('Wishlist');
          console.log('✅ Added to wishlist, navigating to Wishlist');
        } else {
          Alert.alert('Error', data.message || 'Failed to add to wishlist');
        }
      } catch (error) {
        const errorMessage = error.message.includes('401')
          ? 'Login required to add to wishlist'
          : error.message || 'An unexpected error occurred while adding to wishlist';
        console.error('❌ Wishlist add error:', errorMessage);
        Alert.alert('Error', errorMessage);
      }
    };

    const rating = item.userAverageRating || 4.5;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate('ProductDetail', { itemId: item.itemId });
          console.log('ℹ️ Navigating to ProductDetail:', item.itemId);
        }}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image?.uri || 'https://via.placeholder.com/150' }}
            style={styles.image}
            onError={e => console.log('❌ Image load error:', e.nativeEvent.error)}
          />
          <TouchableOpacity style={styles.heartIcon} onPress={handleHeartPress}>
            <View style={styles.heartBackground}>
              <Image
                source={require('../../assets/Images/Heart.png')}
                style={styles.heartImage}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <Text numberOfLines={2} style={styles.title}>
            {item.name || 'No Name'}
          </Text>
          <Text style={styles.subtitle}>Women's Party Wear</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.mrpLabel}>MRP</Text>
            <Text style={styles.mrp}>₹{(item.mrp || 0).toFixed(2)}</Text>
            <Text style={styles.price}>₹{(item.price || 0).toFixed(2)}</Text>
            <Text style={styles.discount}>
              {Math.round(item.discount) || 0}% Off
            </Text>
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[...Array(fullStars)].map((_, index) => (
                <Icon key={index} name="star" size={12} color="#FF9017" />
              ))}
              {hasHalfStar && (
                <Icon name="star-half-empty" size={12} color="#FF9017" />
              )}
              {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map(
                (_, index) => (
                  <Icon
                    key={index + fullStars + 1}
                    name="star-o"
                    size={12}
                    color="#FF9017"
                  />
                ),
              )}
              <Text style={styles.rating}> {rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Filter modal logic
  const CustomCheckbox = ({ value, onValueChange }) => (
    <TouchableOpacity
      onPress={onValueChange}
      style={[styles.checkboxBase, value && styles.checkboxChecked]}>
      {value && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );

  const renderFilterOptions = () => {
    if (!selectedCategory || !filters[selectedCategory]) return null;

    if (selectedCategory === 'Price range') {
      return (
        <View style={styles.priceRangeContainer}>
          <Text style={styles.optionText}>Price Range (₹)</Text>
          <View style={styles.priceInputRow}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min"
              keyboardType="numeric"
              value={priceRange.min}
              onChangeText={text =>
                setPriceRange(prev => ({ ...prev, min: text }))
              }
            />
            <Text style={styles.priceDash}> - </Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Max"
              keyboardType="numeric"
              value={priceRange.max}
              onChangeText={text =>
                setPriceRange(prev => ({ ...prev, max: text }))
              }
            />
          </View>
        </View>
      );
    }

    return Object.keys(filters[selectedCategory]).map(option => (
      <View key={option} style={styles.optionRow}>
        <CustomCheckbox
          value={filters[selectedCategory][option]}
          onValueChange={() => handleFilterChange(selectedCategory, option)}
        />
        <Text
          style={[
            styles.optionText,
            filters[selectedCategory][option] && styles.selectedOptionText,
          ]}>
          {option}
        </Text>
      </View>
    ));
  };

  const renderFilterModal = () => {
    if (filterLoading) {
      return (
        <View style={styles.filterModalContainer}>
          <ActivityIndicator size="large" color="#F36F25" />
        </View>
      );
    }

    if (filterError) {
      return (
        <View style={styles.filterModalContainer}>
          <Text style={styles.errorText}>{filterError}</Text>
          <TouchableOpacity
            onPress={() => {
              if (filterError.includes('Login required')) {
                navigation.navigate('Login', {
                  fromScreen: 'SearchCategory',
                  actionAfterLogin: 'view_filters',
                });
                console.log('ℹ️ Navigating to Login from filter error');
              } else {
                closeFilterModal();
              }
            }}
            style={styles.closeButton}>
            <Text style={styles.closeButtonText}>
              {filterError.includes('Login required') ? 'Login' : 'Close'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.filterModalContainer}>
        <View style={styles.filterContent}>
          <View style={styles.filterHeader}>
            <TouchableOpacity
              onPress={closeFilterModal}
              style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.filterHeaderTitle}>FILTER</Text>
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterBody}>
            <ScrollView style={styles.leftColumn}>
              {filtersData.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat.key && styles.activeCategory,
                  ]}
                  onPress={() => setSelectedCategory(cat.key)}>
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === cat.key && styles.activeCategoryText,
                    ]}>
                    {cat.key} (
                    {cat.key === 'Price range' ? 'Custom' : cat.values.length})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView style={styles.rightColumn}>
              {renderFilterOptions()}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => applyFilters()}
            disabled={filterLoading}>
            <Text style={styles.applyButtonText}>
              {filterLoading ? 'Applying...' : 'APPLY'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Sort modal logic
  const renderSortModal = () => (
    <View style={styles.sortModalContainer}>
      <ScrollView style={styles.sortContent}>
        <Text style={styles.sortTitle}>SORT BY</Text>

        <TouchableOpacity
          style={styles.sortCloseButton}
          onPress={closeSortModal}>
          <Text style={styles.sortCloseText}>×</Text>
        </TouchableOpacity>

        {sortOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={styles.sortOptionRow}
            onPress={() => setCurrentSort(option.value)}>
            <Text
              style={[
                styles.sortOptionText,
                currentSort === option.value && styles.sortSelectedOption,
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.sortClearButton}
          onPress={() => setCurrentSort(null)}>
          <Text style={styles.sortClearButtonText}>CLEAR ALL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sortApplyButton}
          onPress={() => handleApplySort(currentSort)}>
          <Text style={styles.sortApplyButtonText}>APPLY</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Main content
  const renderContent = () => {
    if (searchQuery) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setPage(1);
                setProducts([]);
                console.log('ℹ️ Cleared search query');
              }}>
              <Image
                source={require('../../assets/Images/Back1.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>

            <View style={styles.searchBox}>
              <Image
                source={require('../../assets/Images/SearchIcon.png')}
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Search your style"
                placeholderTextColor="#999999"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={text => {
                  setSearchQuery(text);
                  setPage(1);
                  setProducts([]);
                  console.log('🔍 Search query updated:', text);
                }}
                autoFocus={true}
              />
            </View>
          </View>

          <View style={styles.resultsContainer}>
            {loading && page === 1 ? (
              <ActivityIndicator
                size="large"
                color="#9B5AF5"
                style={{ marginTop: 20 }}
              />
            ) : products.length === 0 ? (
              <Text style={styles.noItemsText}>No items found</Text>
            ) : (
              <FlatList
                key={listKey}
                data={products}
                keyExtractor={item => item.itemId}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                renderItem={renderSubCategoryItem}
                contentContainerStyle={styles.grid}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() =>
                  loading && page > 1 ? (
                    <ActivityIndicator
                      size="small"
                      color="#9B5AF5"
                      style={{ marginVertical: 10 }}
                    />
                  ) : page === totalPages && products.length > 0 ? (
                    <Text style={styles.noMoreText}>No more items to load</Text>
                  ) : null
                }
              />
            )}
          </View>

          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={[styles.filterBtn, !token && styles.disabledBtn]}
              onPress={openFilterModal}
              disabled={!token}
              accessibilityLabel={`Filter products${
                activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''
              }`}>
              <Image
                source={require('../../assets/Images/Filter.png')}
                style={[styles.icon, !token && styles.disabledIcon]}
              />
              <Text style={[styles.iconText, !token && styles.disabledText]}>
                FILTER{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortBtn}
              onPress={openSortModal}
              accessibilityLabel="Sort products">
              <Image
                source={require('../../assets/Images/Sort.png')}
                style={styles.icon}
              />
              <Text style={styles.iconText}>SORT</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../assets/icon/BackIcon.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>

          <View style={styles.searchBox}>
            <Image
              source={require('../../assets/icon/SearchIcon.png')}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search your style"
              placeholderTextColor="#999999"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={text => {
                setSearchQuery(text);
                setPage(1);
                setProducts([]);
                console.log('🔍 Search query updated:', text);
              }}
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.mainContentContainer}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentSearchesContainer}>
            <TouchableOpacity
              style={styles.recentItem}
              onPress={() => {
                setSearchQuery('Chiffon Saree');
                setPage(1);
                setProducts([]);
                console.log('🔍 Selected recent search: Chiffon Saree');
              }}>
              <Image source={girl1Image} style={styles.recentImage} />
              <Text style={styles.recentLabel}>Chiffon Saree</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.recentItem}
              onPress={() => {
                setSearchQuery('Formal Shirt');
                setPage(1);
                setProducts([]);
                console.log('🔍 Selected recent search: Formal Shirt');
              }}>
              <Image source={girl2Image} style={styles.recentImage} />
              <Text style={styles.recentLabel}>Formal Shirt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.recentItem}
              onPress={() => {
                setSearchQuery('Formal Shirt');
                setPage(1);
                setProducts([]);
                console.log('🔍 Selected recent search: Formal Shirt');
              }}>
              <Image source={girl3Image} style={styles.recentImage} />
              <Text style={styles.recentLabel}>Formal Shirt</Text>
            </TouchableOpacity>
          </ScrollView>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
            Popular Categories
          </Text>
          <GenderTabs />

          <ScrollView contentContainerStyle={styles.suggestionContainer}>
            {wishlistLoading ? (
              <Text style={styles.loadingText}>Loading wishlist...</Text>
            ) : wishlistError || !wishlistItem ? (
              <TouchableOpacity
                onPress={() =>
                  wishlistError.includes('Login required') &&
                  navigation.navigate('Login', {
                    fromScreen: 'SearchCategory',
                    actionAfterLogin: 'view_wishlist',
                  })
                }>
                <Text style={styles.errorText}>
                  {wishlistError || 'No wishlist items available'}
                </Text>
              </TouchableOpacity>
            ) : (
              <SuggestionCard
                title="Searching from wishlist?"
                productImage={{ uri: wishlistItem.url }}
                productName={wishlistItem.itemId.name}
                productDesc={wishlistItem.itemId.description}
                price={wishlistItem.itemId.discountedPrice}
                oldPrice={wishlistItem.itemId.MRP}
                discount={Math.round(
                  ((wishlistItem.itemId.MRP - wishlistItem.itemId.discountedPrice) /
                    wishlistItem.itemId.MRP) *
                    100,
                )}
                rating={4.5}
                reviews="79 Ratings & 55"
                sizes={['XS', 'S', 'M', 'L', 'XL']}
                colors={[wishlistItem.color.toLowerCase()]}
                buttonLabel="VIEW WISHLIST"
                onButtonPress={() => {
                  navigation.navigate('Wishlist');
                  console.log('ℹ️ Navigating to Wishlist from suggestion card');
                }}
              />
            )}

            {cartLoading ? (
              <Text style={styles.loadingText}>Loading cart...</Text>
            ) : cartError || !cartItem ? (
              <TouchableOpacity
                onPress={() =>
                  cartError.includes('Login required') &&
                  navigation.navigate('Login', {
                    fromScreen: 'SearchCategory',
                    actionAfterLogin: 'view_cart',
                  })
                }>
                <Text style={styles.errorText}>
                  {cartError || 'No cart items available'}
                </Text>
              </TouchableOpacity>
            ) : (
              <SuggestionCard
                title="Missing anything from bag?"
                productImage={{ uri: cartItem.itemId.image }}
                productName={cartItem.itemId.name}
                productDesc={cartItem.itemId.description}
                price={cartItem.itemId.discountedPrice}
                oldPrice={cartItem.itemId.MRP}
                discount={Math.round(
                  ((cartItem.itemId.MRP - cartItem.itemId.discountedPrice) /
                    cartItem.itemId.MRP) *
                    100,
                )}
                rating={4.5}
                reviews="121 Ratings & 59"
                sizes={[cartItem.size]}
                colors={[cartItem.color.toLowerCase()]}
                buttonLabel="VIEW CART"
                onButtonPress={() => {
                  navigation.navigate('Cart');
                  console.log('ℹ️ Navigating to Cart from suggestion card');
                }}
              />
            )}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      <Modal
        animationType="slide"
        transparent
        visible={isFilterModalVisible}
        onRequestClose={closeFilterModal}>
        {renderFilterModal()}
      </Modal>
      <Modal
        animationType="slide"
        transparent
        visible={isSortModalVisible}
        onRequestClose={closeSortModal}>
        {renderSortModal()}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContentContainer: {
    paddingBottom: 20,
  },
  suggestionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  resultsContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backIcon: {
    marginTop: 30,
    width: 30,
    height: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  recentSearchesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  recentItem: {
    marginRight: 16,
    alignItems: 'center',
    width: 90,
  },
  recentImage: {
    width: 90,
    height: 90,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },
  recentLabel: {
    fontSize: 12,
    color: '#333333',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '400',
  },
  searchBox: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#CCCCCC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 0,
    marginRight: 12,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    paddingVertical: 8,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginVertical: 20,
    textDecorationLine: 'underline',
  },
  grid: {
    padding: 10,
    paddingBottom: 100,
  },
  noItemsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  filterBtn: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '45%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sortBtn: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '45%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledBtn: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 6,
    resizeMode: 'contain',
  },
  disabledIcon: {
    opacity: 0.5,
  },
  iconText: {
    fontSize: 14,
    fontWeight: '500',
  },
  disabledText: {
    color: '#999',
  },
  noMoreText: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
    color: '#666',
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: '1.5%',
    borderRadius: 8,
    overflow: 'visible',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
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
  contentContainer: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
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
  mrpLabel: {
    fontSize: 12,
    color: '#666666',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  mrp: {
    fontSize: 12,
    color: '#666666',
    textDecorationLine: 'line-through',
  },
  discount: {
    fontSize: 12,
    color: '#FF6B00',
    fontWeight: '500',
  },
  ratingContainer: {
    marginTop: 4,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#333333',
    marginLeft: 2,
  },
  filterModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContent: {
    flex: 1,
    width: '100%',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  backText: {
    fontSize: 24,
    color: '#000',
  },
  filterHeaderTitle: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  clearText: {
    fontSize: 14,
    color: '#F36F25',
    fontWeight: '400',
  },
  filterBody: {
    flexDirection: 'row',
    flex: 1,
  },
  leftColumn: {
    width: '50%',
    backgroundColor: '#F5F5F5',
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
  },
  rightColumn: {
    width: '50%',
    backgroundColor: '#fff',
  },
  categoryButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },
  activeCategory: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#F36F25',
  },
  activeCategoryText: {
    color: '#F36F25',
    fontWeight: '500',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },
  selectedOptionText: {
    color: '#F36F25',
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#F36F25',
    margin: 16,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  checkboxBase: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#F36F25',
    borderColor: '#F36F25',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#F36F25',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  priceRangeContainer: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 8,
    width: 80,
    textAlign: 'center',
  },
  priceDash: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  sortModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sortContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    maxHeight: '55%',
  },
  sortTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sortCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  sortCloseText: {
    fontSize: 24,
    color: '#000',
  },
  sortOptionRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sortOptionText: {
    fontSize: 16,
  },
  sortSelectedOption: {
    color: '#D86427',
    fontWeight: 'bold',
  },
  sortApplyButton: {
    backgroundColor: '#D86427',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  sortApplyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sortClearButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D86427',
  },
  sortClearButtonText: {
    color: '#D86427',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchCategory;