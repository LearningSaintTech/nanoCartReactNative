// import {useRoute, useNavigation} from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import Feather from 'react-native-vector-icons/Feather';
// import {
//   View,
//   Text,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   Dimensions,
//   TouchableWithoutFeedback,
//   Alert,
// } from 'react-native';
// import React, {useEffect, useState} from 'react';
// import {useDispatch, useSelector} from 'react-redux';
// import {addToWishlist} from '../../redux/reducers/wishlistSlice';
// import {setCartItems} from '../../redux/reducers/cartSlice';
// import PartnerHeader from '../Components/PartnerHeader';
// import PartnerAccordionItem from '../Components/PartnerAccordionItem';
// import {BASE_URL} from '../../config/apiConfig';

// const {width} = Dimensions.get('window');

// const PartnerProductDetail = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const dispatch = useDispatch();
//   const token = useSelector(state => state.auth.token);
//   const {itemId} = route.params;
//   const [loading, setLoading] = useState(true);
//   const [product, setProduct] = useState(null);
//   const [selectedColorImages, setSelectedColorImages] = useState([]);
//   const [selectedColorIndex, setSelectedColorIndex] = useState(0);
//   const [sizes, setSizes] = useState([]);
//   const [quantities, setQuantities] = useState({});
//   const [selectedSizes, setSelectedSizes] = useState([]);
//   const [availableColors, setAvailableColors] = useState([]);

//   useEffect(() => {
//     const fetchProductDetails = async () => {
//       console.log('Fetching product details for itemId:', itemId);
//       try {
//         const res = await fetch(`${BASE_URL}/itemDetails/item/${itemId}`);
//         const json = await res.json();
//         console.log('Product Details Response:', json);
//         if (json.data && json.data.length > 0) {
//           const productData = json.data[0];
//           console.log('Product Data:', productData);
//           setProduct(productData);
//           setAvailableColors(json.colors || []);
//           console.log('Available Colors:', json.colors);
//           if (productData.imagesByColor?.length > 0) {
//             console.log(
//               'Setting initial color images and sizes for color:',
//               productData.imagesByColor[0].color,
//             );
//             setSelectedColorImages(productData.imagesByColor[0].images);
//             setSizes(productData.imagesByColor[0].sizes || []);
//             const initialQuantities = {};
//             (json.colors || []).forEach(colorObj => {
//               initialQuantities[colorObj.color] = {};
//               productData.imagesByColor
//                 .find(c => c.color === colorObj.color)
//                 ?.sizes.forEach(sizeObj => {
//                   initialQuantities[colorObj.color][sizeObj.size] = 0;
//                 });
//             });
//             setQuantities(initialQuantities);
//             console.log('Initial Quantities:', initialQuantities);
//           }
//         } else {
//           console.log('No product data found in response');
//         }
//       } catch (err) {
//         console.error('Error fetching product details:', err);
//       } finally {
//         setLoading(false);
//         console.log('Loading state set to false');
//       }
//     };

//     fetchProductDetails();
//   }, [itemId]);

//   if (loading) {
//     console.log('Rendering loading indicator');
//     return <ActivityIndicator size="large" style={{marginTop: 50}} />;
//   }

//   if (!product) {
//     console.log('No product found, rendering error message');
//     return (
//       <Text style={{textAlign: 'center', marginTop: 50}}>No product found</Text>
//     );
//   }

//   const {
//     itemId: itemInfo,
//     imagesByColor,
//     sizeChart,
//     deliveryDescription,
//     returnPolicy,
//     About,
//     isSize,
//     howToMeasure,
//     PPQ,
//     deliveryPincode,
//   } = product;

//   const handleAddToWishlist = async () => {
//     console.log('Wishlist button pressed');
//     if (!token) {
//       console.log('No token found. Redirecting to login screen...');
//       navigation.navigate('Login', {
//         fromScreen: 'PartnerProductDetail',
//         itemId: product.itemId._id,
//       });
//       return;
//     }

//     console.log('Token found:', token);
//     const colorObj = imagesByColor.find(colorSet =>
//       colorSet.images.some(img => img.url === selectedColorImages[0]?.url),
//     );
//     const selectedColor = colorObj?.color || 'Black';
//     console.log('Selected color:', selectedColor);
//     console.log('Item ID:', product.itemId._id);

//     const payload = {
//       itemId: product.itemId._id,
//       color: selectedColor,
//     };

//     console.log('Request Payload:', payload);
//     try {
//       const response = await fetch(
//         `${BASE_URL}/partner/wishlist/create`,
//         {
//           method: 'POST',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(payload),
//         },
//       );

//       console.log('Wishlist API Response Status:', response.status);
//       const data = await response.json();
//       console.log('Wishlist API Response Data:', data);

//       if (response.ok && data.success) {
//         console.log('Item added to wishlist successfully.');
//         dispatch(addToWishlist(data));
//         console.log('Wishlist item dispatched to Redux:', data);
//         navigation.navigate('PartnerWishlist');
//         console.log('Navigated to PartnerWishlist');
//       } else {
//         console.error('Wishlist API error:', data.message);
//       }
//     } catch (err) {
//       console.error('Network/API Error while adding to wishlist:', err);
//     }
//   };

//   const currentColor = availableColors[selectedColorIndex]?.color || '';
//   console.log('Current Color:', currentColor);

//   const toggleSizeSelection = size => {
//     console.log('Toggling size selection for size:', size);
//     setSelectedSizes(prevSizes => {
//       if (prevSizes.includes(size)) {
//         console.log('Removing size:', size, 'from selectedSizes');
//         return prevSizes.filter(s => s !== size);
//       } else {
//         console.log('Adding size:', size, 'to selectedSizes');
//         return [...prevSizes, size];
//       }
//     });
//     console.log('Updated selectedSizes:', selectedSizes);
//   };

//   const updateQuantityForSize = (size, delta) => {
//     console.log(
//       `Updating quantity for size: ${size}, delta: ${delta}, color: ${currentColor}`,
//     );
//     setQuantities(prev => {
//       const newQuantities = {...prev};
//       if (!newQuantities[currentColor]) {
//         newQuantities[currentColor] = {};
//       }
//       if (!newQuantities[currentColor][size]) {
//         newQuantities[currentColor][size] = 0;
//       }
//       newQuantities[currentColor][size] = Math.max(
//         0,
//         newQuantities[currentColor][size] + delta,
//       );
//       console.log('Updated quantities:', newQuantities);
//       return newQuantities;
//     });
//   };

//   const calculateOverallTotalQuantity = () => {
//     console.log('Calculating overall total quantity');
//     let total = 0;
//     Object.keys(quantities).forEach(color => {
//       Object.keys(quantities[color]).forEach(size => {
//         total += quantities[color][size] || 0;
//       });
//     });
//     console.log('Total Quantity:', total);
//     return total;
//   };

//   const calculatePricePerPiece = totalQuantity => {
//     console.log(
//       'Calculating price per piece for totalQuantity:',
//       totalQuantity,
//     );
//     let pricePerPcs = itemInfo.discountedPrice; // Default to discountedPrice
//     if (PPQ?.length > 0 && totalQuantity > 0) {
//       let lastRange = PPQ[PPQ.length - 1];
//       for (let i = 0; i < PPQ.length; i++) {
//         const {minQty, maxQty, pricePerUnit} = PPQ[i];
//         if (maxQty) {
//           if (totalQuantity >= minQty && totalQuantity <= maxQty) {
//             pricePerPcs = pricePerUnit;
//             console.log(
//               `Price per piece set to ₹${pricePerPcs} for quantity range ${minQty}-${maxQty}`,
//             );
//             return pricePerPcs;
//           }
//         } else if (totalQuantity >= minQty) {
//           pricePerPcs = pricePerUnit;
//           console.log(
//             `Price per piece set to ₹${pricePerPcs} for quantity >= ${minQty}`,
//           );
//           return pricePerPcs;
//         }
//       }
//       if (totalQuantity > (lastRange.maxQty || 0)) {
//         pricePerPcs = lastRange.pricePerUnit;
//         console.log(
//           `Price per piece set to ₹${pricePerPcs} for quantity > ${
//             lastRange.maxQty || lastRange.minQty
//           } (last range)`,
//         );
//       }
//     } else {
//       console.log(
//         `Using discountedPrice ₹${pricePerPcs} for quantity ${totalQuantity}`,
//       );
//     }
//     return pricePerPcs;
//   };

//   return (
//     <View style={styles.container}>
//       <PartnerHeader />
//       <ScrollView
//         contentContainerStyle={{paddingBottom: 180}}
//         showsVerticalScrollIndicator={false}>
//         <View style={styles.imageSection}>
//           <TouchableWithoutFeedback
//             onPress={() => {
//               console.log(
//                 'Navigating to PartnerProductPhoto with images:',
//                 selectedColorImages,
//               );
//               navigation.navigate('PartnerProductPhoto', {
//                 images: selectedColorImages,
//               });
//             }}>
//             <Image
//               source={{uri: selectedColorImages[0]?.url}}
//               style={styles.mainImage}
//               resizeMode="cover"
//             />
//           </TouchableWithoutFeedback>
//           <ScrollView
//             style={styles.sideImages}
//             showsVerticalScrollIndicator={true}>
//             {selectedColorImages.slice(1).map((img, idx) => (
//               <Image
//                 key={idx}
//                 source={{uri: img.url}}
//                 style={styles.thumbnail}
//                 resizeMode="cover"
//               />
//             ))}
//           </ScrollView>
//         </View>

//         <View style={styles.colors}>
//           {availableColors.map((colorObj, idx) => (
//             <TouchableOpacity
//               key={idx}
//               style={[
//                 styles.colorBox,
//                 {backgroundColor: colorObj.hexCode},
//                 selectedColorIndex === idx && styles.selectedColorBox,
//               ]}
//               onPress={() => {
//                 console.log(
//                   'Color selected, index:',
//                   idx,
//                   'color:',
//                   colorObj.color,
//                 );
//                 setSelectedColorIndex(idx);
//                 const colorMatch = imagesByColor.find(
//                   c => c.color === colorObj.color,
//                 );
//                 if (colorMatch) {
//                   console.log(
//                     'Color match found, updating images and sizes:',
//                     colorMatch,
//                   );
//                   setSelectedColorImages(colorMatch.images);
//                   const newSizes = colorMatch.sizes || [];
//                   setSizes(newSizes);
//                   setSelectedSizes([]);
//                   console.log('Updated sizes:', newSizes);
//                 }
//               }}
//             />
//           ))}
//         </View>

//         <View style={styles.details}>
//           <Text style={styles.title}>{itemInfo.name}</Text>
//           <Text style={styles.subTitle}>{itemInfo.description}</Text>
//           <View style={styles.priceRow}>
//             <Text style={styles.mrp}>MRP</Text>
//             <Text style={styles.strikeThrough}> ₹{itemInfo.MRP}</Text>
//             <Text style={styles.price}> ₹{itemInfo.discountedPrice}</Text>
//             <Text style={styles.mrp}>onwards*</Text>
//             <Text style={styles.discount}>
//               ({Math.round(itemInfo.discountPercentage)}% off)
//             </Text>
//           </View>
//           <Text style={styles.delivery}>{deliveryDescription}</Text>
//         </View>

//         {isSize && (
//           <View style={styles.priceSizeSection}>
//             <View style={styles.availableSizesRow}>
//               <Text style={styles.availableSizesText}>
//                 <Text style={{fontWeight: 'bold'}}>Available sizes: </Text>
//                 {sizes.map((sz, idx) => sz.size).join(', ')}
//               </Text>
//               <TouchableOpacity
//                 onPress={() => {
//                   console.log(
//                     'Navigating to PartnerSizeChart with sizeChart and howToMeasure:',
//                     {sizeChart, howToMeasure},
//                   );
//                   navigation.navigate('PartnerSizeChart', {
//                     sizeChart,
//                     howToMeasure,
//                   });
//                 }}>
//                 <Text style={styles.sizeChartLink}>SIZE CHART</Text>
//               </TouchableOpacity>
//             </View>
//             <Text style={styles.deliveryText}>
//               Fastest 2-3 days delivery to{' '}
//               <Text style={{fontWeight: 'bold'}}>100+</Text> pincodes
//             </Text>
//           </View>
//         )}

//         <PartnerAccordionItem title="About the Product">
//           <Text style={{color: 'gray'}}>{About}</Text>
//         </PartnerAccordionItem>

//         {PPQ.length > 0 && (
//           <PartnerAccordionItem title="Pricing Per Quantity">
//             {PPQ.map((ppqItem, index) => (
//               <View
//                 key={index}
//                 style={{alignItems: 'center', paddingVertical: 8}}>
//                 <View
//                   style={{
//                     flexDirection: 'row',
//                     justifyContent: 'space-between',
//                     width: '60%',
//                     paddingHorizontal: 10,
//                     borderBottomWidth: 1,
//                     borderBottomColor: '#ddd',
//                     paddingBottom: 4,
//                   }}>
//                   <Text style={{fontSize: 14, color: 'gray'}}>
//                     {ppqItem.maxQty
//                       ? `${ppqItem.minQty}–${ppqItem.maxQty} pcs`
//                       : `> ${ppqItem.minQty} pcs`}
//                   </Text>
//                   <Text
//                     style={{
//                       fontSize: 14,
//                       color: '#D86427',
//                       fontWeight: 'bold',
//                     }}>
//                     ₹{ppqItem.pricePerUnit}.00
//                   </Text>
//                 </View>
//               </View>
//             ))}
//           </PartnerAccordionItem>
//         )}

//         <PartnerAccordionItem title="Choose Items">
//           <View style={{paddingVertical: 10}}>
//             <Text style={styles.sectionTitle}>Select Quantity</Text>
//             <View style={styles.colorRow}>
//               {availableColors.map((colorObj, idx) => (
//                 <TouchableOpacity
//                   key={idx}
//                   style={[
//                     styles.quantityColorBox,
//                     {backgroundColor: colorObj.hexCode},
//                     selectedColorIndex === idx && styles.selectedColorBox,
//                   ]}
//                   onPress={() => {
//                     console.log(
//                       'Quantity Color selected, index:',
//                       idx,
//                       'color:',
//                       colorObj.color,
//                     );
//                     setSelectedColorIndex(idx);
//                     const match = imagesByColor.find(
//                       c => c.color === colorObj.color,
//                     );
//                     if (match) {
//                       console.log(
//                         'Quantity Color match found, updating images and sizes:',
//                         match,
//                       );
//                       setSelectedColorImages(match.images);
//                       const newSizes = match.sizes || [];
//                       setSizes(newSizes);
//                       setSelectedSizes([]);
//                       console.log(
//                         'Updated sizes for quantity selection:',
//                         newSizes,
//                       );
//                     }
//                   }}
//                 />
//               ))}
//             </View>
//             {sizes.length > 0 && (
//               <View style={{marginTop: 10}}>
//                 {sizes.map((sizeObj, idx) => {
//                   const size = sizeObj.size;
//                   const isOutOfStock = sizeObj.stock === 0;
//                   return (
//                     <View key={idx} style={styles.sizeRow}>
//                       <Text
//                         style={[
//                           styles.sizeLabel,
//                           isOutOfStock && {
//                             textDecorationLine: 'line-through',
//                             color: '#888',
//                           },
//                         ]}>
//                         {size}
//                       </Text>
//                       <View style={styles.quantityControl}>
//                         <TouchableOpacity
//                           onPress={() => updateQuantityForSize(size, -1)}
//                           disabled={isOutOfStock}>
//                           <Feather
//                             name="chevron-down"
//                             size={20}
//                             color={isOutOfStock ? '#ccc' : '#D86427'}
//                           />
//                         </TouchableOpacity>
//                         <Text style={styles.quantityText}>
//                           {quantities[currentColor]?.[size] || 0}
//                         </Text>
//                         <TouchableOpacity
//                           onPress={() => updateQuantityForSize(size, 1)}
//                           disabled={isOutOfStock}>
//                           <Feather
//                             name="chevron-up"
//                             size={20}
//                             color={isOutOfStock ? '#ccc' : '#D86427'}
//                           />
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   );
//                 })}
//               </View>
//             )}

//             <View style={styles.qtyPerColorContainer}>
//               <Text style={{fontSize: 14}}>
//                 Qty. for{' '}
//                 <Text style={{fontWeight: 'bold', color: '#D2691E'}}>
//                   {currentColor}
//                 </Text>
//                 :{' '}
//                 <Text style={{fontWeight: 'bold'}}>
//                   {Object.values(quantities[currentColor] || {}).reduce(
//                     (sum, qty) => sum + qty,
//                     0,
//                   )}
//                 </Text>
//               </Text>
//               <View style={styles.underline} />
//             </View>

//             {(() => {
//               const totalQuantity = calculateOverallTotalQuantity();
//               const pricePerPcs = calculatePricePerPiece(totalQuantity);
//               const totalPrice = totalQuantity * pricePerPcs;
//               return (
//                 <View style={styles.priceSummary}>
//                   <View style={styles.priceBox}>
//                     <Text style={styles.priceLabel}>Total Qty.</Text>
//                     <Text style={styles.priceValue}>{totalQuantity}</Text>
//                   </View>
//                   <View style={styles.priceBox}>
//                     <Text style={styles.priceLabel}>Price / Pcs</Text>
//                     <Text style={styles.priceValue}>₹{pricePerPcs}</Text>
//                   </View>
//                   <View style={styles.priceBox}>
//                     <Text style={styles.priceLabel}>Total Price</Text>
//                     <Text style={styles.priceValue}>₹{totalPrice}</Text>
//                   </View>
//                 </View>
//               );
//             })()}
//           </View>
//         </PartnerAccordionItem>

//         <PartnerAccordionItem title="Return Policies">
//           <Text>{returnPolicy}</Text>
//         </PartnerAccordionItem>

//         <View style={styles.reviewSection}>
//           <Text style={styles.reviewHeader}>Ratings & Reviews</Text>
//           <View
//             style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
//             <Text style={styles.reviewScore}>4.5</Text>
//             <View style={{flexDirection: 'row', marginLeft: 10, gap: 5}}>
//               <Icon name="star" size={18} color="#D2691E" />
//               <Icon name="star" size={18} color="#D2691E" />
//               <Icon name="star" size={18} color="#D2691E" />
//               <Icon name="star" size={18} color="#D2691E" />
//               <Icon name="star-half-empty" size={18} color="#D2691E" />
//             </View>
//           </View>
//           <Text style={styles.reviewSubText}>121 Ratings | 59 Reviews</Text>
//           <View
//             style={{
//               borderBottomWidth: 1,
//               borderBottomColor: '#eee',
//               marginVertical: 8,
//             }}
//           />
//           <Text style={styles.customerPhotosTitle}>Customer Photos</Text>
//           <View style={styles.customerPhotosRow}>
//             <Image
//               source={{uri: 'https://randomuser.me/api/portraits/men/1.jpg'}}
//               style={styles.customerPhoto}
//             />
//             <Image
//               source={{uri: 'https://randomuser.me/api/portraits/men/2.jpg'}}
//               style={styles.customerPhoto}
//             />
//             <Image
//               source={{uri: 'https://randomuser.me/api/portraits/women/1.jpg'}}
//               style={styles.customerPhoto}
//             />
//           </View>
//           <Text style={styles.customerSaysTitle}>Customer Says</Text>
//           <View style={styles.reviewCard}>
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 marginTop: 4,
//                 gap: 5,
//                 textAlign: 'center',
//               }}>
//               <View style={styles.ratingBadge}>
//                 <Text style={styles.ratingBadgeText}>4.8 ★</Text>
//               </View>
//               <Text style={styles.reviewName}>Adyasha Shetty</Text>
//             </View>
//             <Text style={styles.reviewMeta}>Size bought: L | 2 weeks ago</Text>
//             <Text style={styles.reviewText}>
//               I absolutely love this hoodie, the quality and price is top notch.
//               I must say, I'm impressed. The fit is just perfect making it ideal
//               for all seasons. Go for it!
//             </Text>
//           </View>
//           <View style={styles.reviewCard}>
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 marginTop: 4,
//                 gap: 5,
//               }}>
//               <View style={[styles.ratingBadge, {backgroundColor: '#D2691E'}]}>
//                 <Text style={styles.ratingBadgeText}>4.5 ★</Text>
//               </View>
//               <Text style={styles.reviewName}>Rehman Siddiqui</Text>
//             </View>
//             <Text style={styles.reviewMeta}>Size bought: M | 1 month ago</Text>
//             <Text style={styles.reviewText}>
//               Awesome product, good quality, comfortable size, cloth texture,
//               exact color shown in the app. Value for money.
//             </Text>
//           </View>
//           <View style={styles.reviewCard}>
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 marginTop: 4,
//                 gap: 5,
//               }}>
//               <View style={[styles.ratingBadge, {backgroundColor: '#D2691E'}]}>
//                 <Text style={styles.ratingBadgeText}>4.3 ★</Text>
//               </View>
//               <Text style={styles.reviewName}>Muskan Agarwala</Text>
//             </View>
//             <Text style={styles.reviewMeta}>Size bought: S | 2 months ago</Text>
//             <Text style={styles.reviewText}>
//               Ordered this hoodie for my niece, she looks super cool in this.
//               Thanks for the quick delivery.
//             </Text>
//           </View>
//         </View>
//       </ScrollView>

//       <View style={styles.bottomButtons}>
//         <TouchableOpacity
//           style={styles.wishlistButton}
//           onPress={handleAddToWishlist}>
//           <Icon name="heart-o" size={18} color="black" />
//           <Text style={styles.wishlistText}>WISHLIST</Text>
//         </TouchableOpacity>
//        <TouchableOpacity
//   style={styles.cartButton}
//   onPress={async () => {
//     console.log('🛒 Add to cart button pressed');
//     if (!token) {
//       console.warn('No token found. Redirecting to login.');
//       navigation.navigate('Login', {
//         fromScreen: 'ProductDetail',
//         itemId: product.itemId._id,
//       });
//       console.log('Navigated to Login screen');
//       return;
//     }

//     console.log('Token found:', token);
//     console.log('Quantities before constructing orderDetails:', quantities);

//     const orderDetails = availableColors
//       .map(colorObj => {
//         const color = colorObj.color;
//         const colorMatch = imagesByColor.find(c => c.color === color);
//         if (!colorMatch) {
//           console.log(`No color match found for color: ${color}`);
//           return null;
//         }
//         const sizeAndQuantity = colorMatch.sizes
//           .map(sizeObj => {
//             const qty = quantities[color]?.[sizeObj.size] || 0;
//             console.log(
//               `Size: ${sizeObj.size}, Quantity: ${qty}, SKU: ${
//                 sizeObj.skuId || 'none'
//               }`,
//             );
//             return {
//               size: sizeObj.size,
//               quantity: qty,
//               skuId: sizeObj.skuId || '',
//             };
//           })
//           .filter(sizeObj => sizeObj.quantity > 0);
//         if (sizeAndQuantity.length === 0) {
//           console.log(`No sizes with quantity > 0 for color: ${color}`);
//           return null;
//         }
//         return {color, sizeAndQuantity};
//       })
//       .filter(detail => detail !== null);

//     const totalQuantity = orderDetails.reduce(
//       (total, detail) =>
//         total +
//         detail.sizeAndQuantity.reduce(
//           (subTotal, sizeObj) => subTotal + sizeObj.quantity,
//           0,
//         ),
//       0,
//     );

//     if (totalQuantity <= 0) {
//       console.log('Total quantity is 0, showing alert');
//       Alert.alert(
//         'Invalid Quantity',
//         'Please select at least one item with a quantity greater than 0.',
//         [{text: 'OK', onPress: () => console.log('Alert dismissed')}],
//       );
//       return;
//     }

//     console.log('Constructed orderDetails:', orderDetails);
//     console.log('Total Quantity:', totalQuantity);
//     const pricePerPcs = calculatePricePerPiece(totalQuantity);
//     console.log(`Price per piece: ₹${pricePerPcs}`);
//     const totalPrice = totalQuantity * pricePerPcs;
//     console.log('Total Price:', totalPrice);

//     const payload = {
//       itemId: product.itemId._id,
//       orderDetails,
//       totalQuantity,
//       totalPrice,
//       pricePerUnit: pricePerPcs,
//     };

//     console.log('Cart Payload:', payload);
//     try {
//       const response = await fetch(`${BASE_URL}/partner/cart/create`, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       console.log('Cart API Response Status:', response.status);
//       const data = await response.json();
//       console.log('Cart API Response Data:', data);

//       if (response.ok && data.success) {
//         console.log('Item added to cart successfully');
//         dispatch(setCartItems(data.data.items || []));
//         console.log('Dispatched setCartItems with items:', data.data.items);
//         navigation.navigate('PartnerCart', {
//           totalPrice,
//         });
//         console.log('Navigated to PartnerCart');
//         Alert.alert(data.message);
//       } else {
//         console.warn('Cart API error:', data.message);
//         Alert.alert(data.message);
//       }
//     } catch (error) {
//       console.error('Cart API Error:', error);
//       Alert.alert('An error occurred while adding to cart.');
//     }
//   }}>
//   <Feather name="shopping-cart" size={18} color="#fff" />
//   <Text style={styles.cartText}>ADD TO CART</Text>
// </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default PartnerProductDetail;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 10,
//   },
//   imageSection: {
//     flexDirection: 'row',
//     marginVertical: 10,
//   },
//   mainImage: {
//     width: '70%',
//     height: 350,
//     borderRadius: 0,
//   },
//   sideImages: {
//     marginLeft: 10,
//     width: '25%',
//     height: 350,
//   },
//   thumbnail: {
//     width: '100%',
//     height: 100,
//     borderRadius: 0,
//     marginBottom: 10,
//   },
//   colorsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   colorsText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   shareContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   shareText: {
//     fontSize: 14,
//   },
//   colors: {
//     flexDirection: 'row',
//     marginVertical: 10,
//   },
//   colorBox: {
//     width: 40,
//     height: 30,
//     borderRadius: 5,
//     borderWidth: 2,
//     borderColor: '#ccc',
//     marginRight: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   selectedColorBox: {
//     borderWidth: 3,
//     borderColor: '#d2691e',
//   },
//   quantityColorBox: {
//     width: 40,
//     height: 30,
//     borderRadius: 5,
//     borderWidth: 2,
//     borderColor: '#d2691e',
//     marginHorizontal: 5,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   details: {
//     marginVertical: 10,
//   },
//   title: {
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   subTitle: {
//     color: 'gray',
//     marginBottom: 5,
//   },
//   priceRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   strikeThrough: {
//     textDecorationLine: 'line-through',
//     color: 'gray',
//   },
//   mrp: {
//     color: 'gray',
//   },
//   price: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginLeft: 8,
//   },
//   discount: {
//     color: '#D2691E',
//     marginLeft: 8,
//     fontWeight: 'bold',
//   },
//   delivery: {
//     color: 'gray',
//     marginTop: 5,
//   },
//   priceSizeSection: {
//     padding: 10,
//     marginTop: 10,
//   },
//   availableSizesRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginTop: 0,
//     marginBottom: 2,
//   },
//   availableSizesText: {
//     fontSize: 15,
//     color: 'gray',
//     flex: 1,
//     flexWrap: 'wrap',
//   },
//   sizeChartLink: {
//     color: '#D2691E',
//     fontWeight: 'bold',
//     fontSize: 14,
//     marginLeft: 10,
//     textDecorationLine: 'underline',
//   },
//   deliveryText: {
//     color: '#888',
//     fontSize: 14,
//     marginBottom: 6,
//     marginTop: 2,
//   },
//   sizeOptions: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: 10,
//     justifyContent: 'center',
//   },
//   sizeBox: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     marginRight: 10,
//     marginBottom: 5,
//   },
//   selectedSizeBox: {
//     borderColor: '#d2691e',
//     backgroundColor: '#ffe5cc',
//   },
//   sizeBoxText: {
//     fontSize: 14,
//   },
//   bottomButtons: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#ccc',
//     justifyContent: 'space-between',
//   },
//   wishlistButton: {
//     borderWidth: 1,
//     borderColor: '#D2691E',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 3,
//     flex: 1,
//     marginRight: 10,
//     justifyContent: 'center',
//   },
//   wishlistText: {
//     marginLeft: 8,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   cartButton: {
//     backgroundColor: '#D2691E',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 3,
//     flex: 1,
//     justifyContent: 'center',
//   },
//   cartText: {
//     marginLeft: 8,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   reviewSection: {
//     backgroundColor: '#fff',
//     padding: 0,
//     marginTop: 18,
//     marginBottom: 18,
//   },
//   reviewHeader: {
//     fontWeight: 'bold',
//     fontSize: 15,
//     color: '#333',
//     marginBottom: 12,
//   },
//   reviewScore: {
//     fontWeight: 'bold',
//     fontSize: 22,
//     color: '#333',
//   },
//   reviewSubText: {
//     color: '#888',
//     fontSize: 13,
//     marginTop: 2,
//     marginBottom: 8,
//   },
//   customerPhotosTitle: {
//     fontWeight: 'bold',
//     fontSize: 15,
//     marginTop: 10,
//     marginBottom: 10,
//     color: '#696969',
//   },
//   customerPhotosRow: {
//     flexDirection: 'row',
//     marginBottom: 10,
//   },
//   customerPhoto: {
//     width: 110,
//     height: 110,
//     marginRight: 8,
//     backgroundColor: '#eee',
//   },
//   customerSaysTitle: {
//     fontWeight: 'bold',
//     fontSize: 15,
//     marginTop: 10,
//     marginBottom: 10,
//     color: '#555',
//   },
//   reviewCard: {
//     marginBottom: 8,
//   },
//   ratingBadge: {
//     backgroundColor: '#D2691E',
//     borderRadius: 3,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     alignSelf: 'flex-start',
//     marginBottom: 2,
//   },
//   ratingBadgeText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 12,
//   },
//   reviewName: {
//     fontWeight: 'bold',
//     fontSize: 14,
//     color: '#696969',
//   },
//   reviewMeta: {
//     color: '#696969',
//     fontSize: 11,
//     marginBottom: 2,
//   },
//   reviewText: {
//     color: '#696969',
//     fontSize: 13,
//     marginTop: 2,
//   },
//   seeMore: {
//     color: '#D2691E',
//     fontWeight: 'bold',
//     marginTop: 2,
//     marginBottom: 10,
//     fontSize: 14,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   colorRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginVertical: 10,
//   },
//   quantityColorBox: {
//     width: 30,
//     height: 30,
//     borderWidth: 2,
//     borderColor: '#ccc',
//     borderRadius: 4,
//     marginHorizontal: 6,
//   },
//   selectedColorBox: {
//     borderColor: '#D86427',
//   },
//   sizeRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingBottom: 6,
//     marginVertical: 4,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   sizeLabel: {
//     fontSize: 14,
//     width: 40,
//   },
//   quantityControl: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   quantityText: {
//     fontSize: 14,
//     minWidth: 20,
//     textAlign: 'center',
//     marginHorizontal: 10,
//   },
//   qtyPerColorContainer: {
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   underline: {
//     width: 140,
//     height: 1,
//     backgroundColor: '#aaa',
//     marginTop: 5,
//   },
//   priceSummary: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: 20,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#ccc',
//   },
//   priceBox: {
//     alignItems: 'center',
//   },
//   priceLabel: {
//     fontSize: 12,
//     color: '#555',
//   },
//   priceValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });




import {useRoute, useNavigation} from '@react-navigation/native';
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
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {addToWishlist} from '../../redux/reducers/wishlistSlice';
import {setCartItems} from '../../redux/reducers/cartSlice';
import PartnerHeader from '../Components/PartnerHeader';
import PartnerAccordionItem from '../Components/PartnerAccordionItem';
import {BASE_URL} from '../../config/apiConfig';

const {width} = Dimensions.get('window');

const PartnerProductDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const {itemId} = route.params;
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedColorImages, setSelectedColorImages] = useState([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [sizes, setSizes] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [reviews, setReviews] = useState({
    count: 0,
    data: [],
    arrayOfCustomerImage: [],
    totalRating: 0,
    totalReview: 0,
    averageRating: '0.0',
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      console.log('Fetching product details for itemId:', itemId);
      try {
        const res = await fetch(`${BASE_URL}/itemDetails/item/${itemId}`);
        const json = await res.json();
        console.log('Product Details Response:', json);
        if (json.data && json.data.length > 0) {
          const productData = json.data[0];
          console.log('Product Data:', productData);
          setProduct(productData);
          setAvailableColors(json.colors || []);
          console.log('Available Colors:', json.colors);
          if (productData.imagesByColor?.length > 0) {
            console.log(
              'Setting initial color images and sizes for color:',
              productData.imagesByColor[0].color,
            );
            setSelectedColorImages(productData.imagesByColor[0].images);
            setSizes(productData.imagesByColor[0].sizes || []);
            const initialQuantities = {};
            (json.colors || []).forEach(colorObj => {
              initialQuantities[colorObj.color] = {};
              productData.imagesByColor
                .find(c => c.color === colorObj.color)
                ?.sizes.forEach(sizeObj => {
                  initialQuantities[colorObj.color][sizeObj.size] = 0;
                });
            });
            setQuantities(initialQuantities);
            console.log('Initial Quantities:', initialQuantities);
          }
        } else {
          console.log('No product data found in response');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
        console.log('Loading state set to false');
      }
    };

    const fetchReviews = async () => {
      console.log('Fetching reviews for itemId:', itemId);
      try {
        setReviewsLoading(true);
        const response = await fetch(`${BASE_URL}/partner/ratingreview/${itemId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        const data = await response.text(); // Get raw response
        console.log('Reviews API Raw Response:', data);
        console.log('Reviews API Response Status:', response.status);

        let json;
        try {
          json = JSON.parse(data);
        } catch (parseError) {
          console.error('JSON parse error for reviews:', parseError.message);
          // Alert.alert('Error', 'Failed to parse reviews data.');
          return;
        }

        console.log('Reviews API Parsed Response:', json);
        if (response.ok && json.success) {
          setReviews({
            count: json.data.count || 0,
            data: json.data.data || [],
            arrayOfCustomerImage: json.data.arrayOfCustomerImage || [],
            totalRating: json.data.totalRating || 0,
            totalReview: json.data.totalReview || 0,
            averageRating: json.data.averageRating || '0.0',
          });
          console.log('Reviews data set:', json.data);
        } else {
          // console.error('Failed to fetch reviews:', json.message || 'Unknown error');
          // Alert.alert('Error', json.message || 'Failed to load reviews.');
        }
      } catch (error) {
        // console.error('Error fetching reviews:', error.message);
        // Alert.alert('Error', 'An error occurred while fetching reviews.');
      } finally {
        setReviewsLoading(false);
        // console.log('Reviews loading state set to false');
      }
    };

    fetchProductDetails();
    fetchReviews();
  }, [itemId, token]);

  if (loading) {
    console.log('Rendering loading indicator');
    return <ActivityIndicator size="large" style={{marginTop: 50}} />;
  }

  if (!product) {
    console.log('No product found, rendering error message');
    return (
      <Text style={{textAlign: 'center', marginTop: 50}}>No product found</Text>
    );
  }

  const {
    itemId: itemInfo,
    imagesByColor,
    sizeChart,
    deliveryDescription,
    returnPolicy,
    About,
    isSize,
    howToMeasure,
    PPQ,
    deliveryPincode,
  } = product;

  const handleAddToWishlist = async () => {
    console.log('Wishlist button pressed');
    if (!token) {
      console.log('No token found. Redirecting to login screen...');
      navigation.navigate('Login', {
        fromScreen: 'PartnerProductDetail',
        itemId: product.itemId._id,
      });
      return;
    }

    console.log('Token found:', token);
    const colorObj = imagesByColor.find(colorSet =>
      colorSet.images.some(img => img.url === selectedColorImages[0]?.url),
    );
    const selectedColor = colorObj?.color || 'Black';
    console.log('Selected color:', selectedColor);
    console.log('Item ID:', product.itemId._id);

    const payload = {
      itemId: product.itemId._id,
      color: selectedColor,
    };

    console.log('Request Payload:', payload);
    try {
      const response = await fetch(
        `${BASE_URL}/partner/wishlist/create`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      console.log('Wishlist API Response Status:', response.status);
      const data = await response.json();
      console.log('Wishlist API Response Data:', data);

      if (response.ok && data.success) {
        console.log('Item added to wishlist successfully.');
        dispatch(addToWishlist(data));
        console.log('Wishlist item dispatched to Redux:', data);
        navigation.navigate('PartnerWishlist');
        console.log('Navigated to PartnerWishlist');
      } else {
        console.error('Wishlist API error:', data.message);
        Alert.alert('Error', data.message || 'Failed to add to wishlist.');
      }
    } catch (err) {
      console.error('Network/API Error while adding to wishlist:', err);
      Alert.alert('Error', 'An error occurred while adding to wishlist.');
    }
  };

  const currentColor = availableColors[selectedColorIndex]?.color || '';
  console.log('Current Color:', currentColor);

  const toggleSizeSelection = size => {
    console.log('Toggling size selection for size:', size);
    setSelectedSizes(prevSizes => {
      if (prevSizes.includes(size)) {
        console.log('Removing size:', size, 'from selectedSizes');
        return prevSizes.filter(s => s !== size);
      } else {
        console.log('Adding size:', size, 'to selectedSizes');
        return [...prevSizes, size];
      }
    });
    console.log('Updated selectedSizes:', selectedSizes);
  };

  const updateQuantityForSize = (size, delta) => {
    console.log(
      `Updating quantity for size: ${size}, delta: ${delta}, color: ${currentColor}`,
    );
    setQuantities(prev => {
      const newQuantities = {...prev};
      if (!newQuantities[currentColor]) {
        newQuantities[currentColor] = {};
      }
      if (!newQuantities[currentColor][size]) {
        newQuantities[currentColor][size] = 0;
      }
      newQuantities[currentColor][size] = Math.max(
        0,
        newQuantities[currentColor][size] + delta,
      );
      console.log('Updated quantities:', newQuantities);
      return newQuantities;
    });
  };

  const calculateOverallTotalQuantity = () => {
    console.log('Calculating overall total quantity');
    let total = 0;
    Object.keys(quantities).forEach(color => {
      Object.keys(quantities[color]).forEach(size => {
        total += quantities[color][size] || 0;
      });
    });
    console.log('Total Quantity:', total);
    return total;
  };

  const calculatePricePerPiece = totalQuantity => {
    console.log(
      'Calculating price per piece for totalQuantity:',
      totalQuantity,
    );
    let pricePerPcs = itemInfo.discountedPrice;
    if (PPQ?.length > 0 && totalQuantity > 0) {
      let lastRange = PPQ[PPQ.length - 1];
      for (let i = 0; i < PPQ.length; i++) {
        const {minQty, maxQty, pricePerUnit} = PPQ[i];
        if (maxQty) {
          if (totalQuantity >= minQty && totalQuantity <= maxQty) {
            pricePerPcs = pricePerUnit;
            console.log(
              `Price per piece set to ₹${pricePerPcs} for quantity range ${minQty}-${maxQty}`,
            );
            return pricePerPcs;
          }
        } else if (totalQuantity >= minQty) {
          pricePerPcs = pricePerUnit;
          console.log(
            `Price per piece set to ₹${pricePerPcs} for quantity >= ${minQty}`,
          );
          return pricePerPcs;
        }
      }
      if (totalQuantity > (lastRange.maxQty || 0)) {
        pricePerPcs = lastRange.pricePerUnit;
        console.log(
          `Price per piece set to ₹${pricePerPcs} for quantity > ${
            lastRange.maxQty || lastRange.minQty
          } (last range)`,
        );
      }
    } else {
      console.log(
        `Using discountedPrice ₹${pricePerPcs} for quantity ${totalQuantity}`,
      );
    }
    return pricePerPcs;
  };

  const renderStars = rating => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Icon key={i} name="star" size={18} color="#D2691E" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Icon key={i} name="star-half-empty" size={18} color="#D2691E" />);
      } else {
        stars.push(<Icon key={i} name="star-o" size={18} color="#D2691E" />);
      }
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <PartnerHeader />
      <ScrollView
        contentContainerStyle={{paddingBottom: 180}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <TouchableWithoutFeedback
            onPress={() => {
              console.log(
                'Navigating to PartnerProductPhoto with images:',
                selectedColorImages,
              );
              navigation.navigate('PartnerProductPhoto', {
                images: selectedColorImages,
              });
            }}>
            <Image
              source={{uri: selectedColorImages[0]?.url}}
              style={styles.mainImage}
              resizeMode="cover"
            />
          </TouchableWithoutFeedback>
          <ScrollView
            style={styles.sideImages}
            showsVerticalScrollIndicator={true}>
            {selectedColorImages.slice(1).map((img, idx) => (
              <Image
                key={idx}
                source={{uri: img.url}}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.colors}>
          {availableColors.map((colorObj, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.colorBox,
                {backgroundColor: colorObj.hexCode},
                selectedColorIndex === idx && styles.selectedColorBox,
              ]}
              onPress={() => {
                console.log(
                  'Color selected, index:',
                  idx,
                  'color:',
                  colorObj.color,
                );
                setSelectedColorIndex(idx);
                const colorMatch = imagesByColor.find(
                  c => c.color === colorObj.color,
                );
                if (colorMatch) {
                  console.log(
                    'Color match found, updating images and sizes:',
                    colorMatch,
                  );
                  setSelectedColorImages(colorMatch.images);
                  const newSizes = colorMatch.sizes || [];
                  setSizes(newSizes);
                  setSelectedSizes([]);
                  console.log('Updated sizes:', newSizes);
                }
              }}
            />
          ))}
        </View>

        <View style={styles.details}>
          <Text style={styles.title}>{itemInfo.name}</Text>
          <Text style={styles.subTitle}>{itemInfo.description}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.mrp}>MRP</Text>
            <Text style={styles.strikeThrough}> ₹{itemInfo.MRP}</Text>
            <Text style={styles.price}> ₹{itemInfo.discountedPrice}</Text>
            <Text style={styles.mrp}>onwards*</Text>
            <Text style={styles.discount}>
              ({Math.round(itemInfo.discountPercentage)}% off)
            </Text>
          </View>
          <Text style={styles.delivery}>{deliveryDescription}</Text>
        </View>

        {isSize && (
          <View style={styles.priceSizeSection}>
            <View style={styles.availableSizesRow}>
              <Text style={styles.availableSizesText}>
                <Text style={{fontWeight: 'bold'}}>Available sizes: </Text>
                {sizes.map((sz, idx) => sz.size).join(', ')}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  console.log(
                    'Navigating to PartnerSizeChart with sizeChart and howToMeasure:',
                    {sizeChart, howToMeasure},
                  );
                  navigation.navigate('PartnerSizeChart', {
                    sizeChart,
                    howToMeasure,
                  });
                }}>
                <Text style={styles.sizeChartLink}>SIZE CHART</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.deliveryText}>
              Fastest 2-3 days delivery to{' '}
              <Text style={{fontWeight: 'bold'}}>100+</Text> pincodes
            </Text>
          </View>
        )}

        <PartnerAccordionItem title="About the Product">
          <Text style={{color: 'gray'}}>{About}</Text>
        </PartnerAccordionItem>

        {PPQ.length > 0 && (
          <PartnerAccordionItem title="Pricing Per Quantity">
            {PPQ.map((ppqItem, index) => (
              <View
                key={index}
                style={{alignItems: 'center', paddingVertical: 8}}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '60%',
                    paddingHorizontal: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#ddd',
                    paddingBottom: 4,
                  }}>
                  <Text style={{fontSize: 14, color: 'gray'}}>
                    {ppqItem.maxQty
                      ? `${ppqItem.minQty}–${ppqItem.maxQty} pcs`
                      : `> ${ppqItem.minQty} pcs`}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#D86427',
                      fontWeight: 'bold',
                    }}>
                    ₹{ppqItem.pricePerUnit}.00
                  </Text>
                </View>
              </View>
            ))}
          </PartnerAccordionItem>
        )}

        <PartnerAccordionItem title="Choose Items">
          <View style={{paddingVertical: 10}}>
            <Text style={styles.sectionTitle}>Select Quantity</Text>
            <View style={styles.colorRow}>
              {availableColors.map((colorObj, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.quantityColorBox,
                    {backgroundColor: colorObj.hexCode},
                    selectedColorIndex === idx && styles.selectedColorBox,
                  ]}
                  onPress={() => {
                    console.log(
                      'Quantity Color selected, index:',
                      idx,
                      'color:',
                      colorObj.color,
                    );
                    setSelectedColorIndex(idx);
                    const match = imagesByColor.find(
                      c => c.color === colorObj.color,
                    );
                    if (match) {
                      console.log(
                        'Quantity Color match found, updating images and sizes:',
                        match,
                      );
                      setSelectedColorImages(match.images);
                      const newSizes = match.sizes || [];
                      setSizes(newSizes);
                      setSelectedSizes([]);
                      console.log(
                        'Updated sizes for quantity selection:',
                        newSizes,
                      );
                    }
                  }}
                />
              ))}
            </View>
            {sizes.length > 0 && (
              <View style={{marginTop: 10}}>
                {sizes.map((sizeObj, idx) => {
                  const size = sizeObj.size;
                  const isOutOfStock = sizeObj.stock === 0;
                  return (
                    <View key={idx} style={styles.sizeRow}>
                      <Text
                        style={[
                          styles.sizeLabel,
                          isOutOfStock && {
                            textDecorationLine: 'line-through',
                            color: '#888',
                          },
                        ]}>
                        {size}
                      </Text>
                      <View style={styles.quantityControl}>
                        <TouchableOpacity
                          onPress={() => updateQuantityForSize(size, -1)}
                          disabled={isOutOfStock}>
                          <Feather
                            name="chevron-down"
                            size={20}
                            color={isOutOfStock ? '#ccc' : '#D86427'}
                          />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>
                          {quantities[currentColor]?.[size] || 0}
                        </Text>
                        <TouchableOpacity
                          onPress={() => updateQuantityForSize(size, 1)}
                          disabled={isOutOfStock}>
                          <Feather
                            name="chevron-up"
                            size={20}
                            color={isOutOfStock ? '#ccc' : '#D86427'}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.qtyPerColorContainer}>
              <Text style={{fontSize: 14}}>
                Qty. for{' '}
                <Text style={{fontWeight: 'bold', color: '#D2691E'}}>
                  {currentColor}
                </Text>
                :{' '}
                <Text style={{fontWeight: 'bold'}}>
                  {Object.values(quantities[currentColor] || {}).reduce(
                    (sum, qty) => sum + qty,
                    0,
                  )}
                </Text>
              </Text>
              <View style={styles.underline} />
            </View>

            {(() => {
              const totalQuantity = calculateOverallTotalQuantity();
              const pricePerPcs = calculatePricePerPiece(totalQuantity);
              const totalPrice = totalQuantity * pricePerPcs;
              return (
                <View style={styles.priceSummary}>
                  <View style={styles.priceBox}>
                    <Text style={styles.priceLabel}>Total Qty.</Text>
                    <Text style={styles.priceValue}>{totalQuantity}</Text>
                  </View>
                  <View style={styles.priceBox}>
                    <Text style={styles.priceLabel}>Price / Pcs</Text>
                    <Text style={styles.priceValue}>₹{pricePerPcs}</Text>
                  </View>
                  <View style={styles.priceBox}>
                    <Text style={styles.priceLabel}>Total Price</Text>
                    <Text style={styles.priceValue}>₹{totalPrice}</Text>
                  </View>
                </View>
              );
            })()}
          </View>
        </PartnerAccordionItem>

        <PartnerAccordionItem title="Return Policies">
          <Text>{returnPolicy}</Text>
        </PartnerAccordionItem>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewHeader}>Ratings & Reviews</Text>
          {reviewsLoading ? (
            <ActivityIndicator size="small" color="#D2691E" style={{marginTop: 10}} />
          ) : reviews.count === 0 ? (
            <Text style={styles.reviewSubText}>No ratings or reviews yet.</Text>
          ) : (
            <>
              <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                <Text style={styles.reviewScore}>{reviews.averageRating}</Text>
                <View style={{flexDirection: 'row', marginLeft: 10, gap: 5}}>
                  {renderStars(parseFloat(reviews.averageRating))}
                </View>
              </View>
              <Text style={styles.reviewSubText}>
                {reviews.totalRating} Rating{reviews.totalRating !== 1 ? 's' : ''} | {reviews.totalReview} Review{reviews.totalReview !== 1 ? 's' : ''}
              </Text>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                  marginVertical: 8,
                }}
              />
              {reviews.arrayOfCustomerImage.length > 0 && (
                <>
                  <Text style={styles.customerPhotosTitle}>Customer Photos</Text>
                  <View style={styles.customerPhotosRow}>
                    {reviews.arrayOfCustomerImage.slice(0, 3).map((image, idx) => (
                      <Image
                        key={idx}
                        source={{uri: image}}
                        style={styles.customerPhoto}
                      />
                    ))}
                  </View>
                </>
              )}
              {reviews.data.length > 0 && (
                <>
                  <Text style={styles.customerSaysTitle}>Customer Says</Text>
                  {reviews.data.map((review, idx) => (
                    <View key={idx} style={styles.reviewCard}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 4,
                          gap: 5,
                          textAlign: 'center',
                        }}>
                        <View style={styles.ratingBadge}>
                          <Text style={styles.ratingBadgeText}>{review.rating} ★</Text>
                        </View>
                        <Text style={styles.reviewName}>{review.partnerId.name}</Text>
                      </View>
                      <Text style={styles.reviewMeta}>
                        Size bought: {review.sizeBought} |{' '}
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                      {review.reviewText && (
                        <Text style={styles.reviewText}>{review.reviewText}</Text>
                      )}
                    </View>
                  ))}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={handleAddToWishlist}>
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
              console.log('Navigated to Login screen');
              return;
            }

            console.log('Token found:', token);
            console.log('Quantities before constructing orderDetails:', quantities);

            const orderDetails = availableColors
              .map(colorObj => {
                const color = colorObj.color;
                const colorMatch = imagesByColor.find(c => c.color === color);
                if (!colorMatch) {
                  console.log(`No color match found for color: ${color}`);
                  return null;
                }
                const sizeAndQuantity = colorMatch.sizes
                  .map(sizeObj => {
                    const qty = quantities[color]?.[sizeObj.size] || 0;
                    console.log(
                      `Size: ${sizeObj.size}, Quantity: ${qty}, SKU: ${
                        sizeObj.skuId || 'none'
                      }`,
                    );
                    return {
                      size: sizeObj.size,
                      quantity: qty,
                      skuId: sizeObj.skuId || '',
                    };
                  })
                  .filter(sizeObj => sizeObj.quantity > 0);
                if (sizeAndQuantity.length === 0) {
                  console.log(`No sizes with quantity > 0 for color: ${color}`);
                  return null;
                }
                return {color, sizeAndQuantity};
              })
              .filter(detail => detail !== null);

            const totalQuantity = orderDetails.reduce(
              (total, detail) =>
                total +
                detail.sizeAndQuantity.reduce(
                  (subTotal, sizeObj) => subTotal + sizeObj.quantity,
                  0,
                ),
              0,
            );

            if (totalQuantity <= 0) {
              console.log('Total quantity is 0, showing alert');
              Alert.alert(
                'Invalid Quantity',
                'Please select at least one item with a quantity greater than 0.',
                [{text: 'OK', onPress: () => console.log('Alert dismissed')}],
              );
              return;
            }

            console.log('Constructed orderDetails:', orderDetails);
            console.log('Total Quantity:', totalQuantity);
            const pricePerPcs = calculatePricePerPiece(totalQuantity);
            console.log(`Price per piece: ₹${pricePerPcs}`);
            const totalPrice = totalQuantity * pricePerPcs;
            console.log('Total Price:', totalPrice);

            const payload = {
              itemId: product.itemId._id,
              orderDetails,
              totalQuantity,
              totalPrice,
              pricePerUnit: pricePerPcs,
            };

            console.log('Cart Payload:', payload);
            try {
              const response = await fetch(`${BASE_URL}/partner/cart/create`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
              });

              console.log('Cart API Response Status:', response.status);
              const data = await response.json();
              console.log('Cart API Response Data:', data);

              if (response.ok && data.success) {
                console.log('Item added to cart successfully');
                dispatch(setCartItems(data.data.items || []));
                console.log('Dispatched setCartItems with items:', data.data.items);
                navigation.navigate('PartnerCart', {
                  totalPrice,
                });
                console.log('Navigated to PartnerCart');
                Alert.alert(data.message);
              } else {
                console.warn('Cart API error:', data.message);
                Alert.alert(data.message);
              }
            } catch (error) {
              console.error('Cart API Error:', error);
              Alert.alert('An error occurred while adding to cart.');
            }
          }}>
          <Feather name="shopping-cart" size={18} color="#fff" />
          <Text style={styles.cartText}>ADD TO CART</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  colors: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  colorBox: {
    width: 40,
    height: 30,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorBox: {
    borderWidth: 3,
    borderColor: '#d2691e',
  },
  quantityColorBox: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    marginHorizontal: 6,
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
  mrp: {
    color: 'gray',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  discount: {
    color: '#D2691E',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  delivery: {
    color: 'gray',
    marginTop: 5,
  },
  priceSizeSection: {
    padding: 10,
    marginTop: 10,
  },
  availableSizesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 0,
    marginBottom: 2,
  },
  availableSizesText: {
    fontSize: 15,
    color: 'gray',
    flex: 1,
    flexWrap: 'wrap',
  },
  sizeChartLink: {
    color: '#D2691E',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 10,
    textDecorationLine: 'underline',
  },
  deliveryText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 6,
    marginTop: 2,
  },
  reviewSection: {
    backgroundColor: '#fff',
    padding: 0,
    marginTop: 18,
    marginBottom: 18,
  },
  reviewHeader: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
  },
  reviewScore: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#333',
  },
  reviewSubText: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 8,
  },
  customerPhotosTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 10,
    color: '#696969',
  },
  customerPhotosRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  customerPhoto: {
    width: 110,
    height: 110,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  customerSaysTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 10,
    color: '#555',
  },
  reviewCard: {
    marginBottom: 8,
  },
  ratingBadge: {
    backgroundColor: '#D2691E',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  ratingBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  reviewName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#696969',
  },
  reviewMeta: {
    color: '#696969',
    fontSize: 11,
    marginBottom: 2,
  },
  reviewText: {
    color: '#696969',
    fontSize: 13,
    marginTop: 2,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  quantityColorBox: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    marginHorizontal: 6,
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 6,
    marginVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sizeLabel: {
    fontSize: 14,
    width: 40,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityText: {
    fontSize: 14,
    minWidth: 20,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  qtyPerColorContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  underline: {
    width: 140,
    height: 1,
    backgroundColor: '#aaa',
    marginTop: 5,
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  priceBox: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#555',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PartnerProductDetail;