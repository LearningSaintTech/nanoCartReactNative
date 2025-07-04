// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
// } from 'react-native';
// import { useSelector, useDispatch } from 'react-redux';
// import { setSelectedItem } from '../../redux/reducers/itemSlice';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import { BASE_URL } from '../../config/apiConfig';

// const SubCategoryItem = ({ item, navigation }) => {
//   const token = useSelector((state) => state.auth.token);
//   const dispatch = useDispatch();
//   const [showModal, setShowModal] = useState(false);

//   console.log('📦 Rendering SubCategoryItem:', JSON.stringify(item, null, 2));

//   const handleHeartPress = async () => {
//     const itemId = item?.itemId;
//     const color = item?.defaultColor || 'Black';

//     if (!itemId) {
//       console.warn('item.itemId is missing');
//       return;
//     }

//     if (!token) {
//       dispatch(setSelectedItem({ itemId, color }));
//       navigation.navigate('Login', {
//         fromScreen: 'SubCategoryScreen',
//         actionAfterLogin: 'like_item',
//         itemId,
//       });
//       return;
//     }

//     try {
//       const res = await fetch(`${BASE_URL}/userwishlist/create`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ itemId, color }),
//       });

//       const data = await res.json();
//       if (res.ok && data.success) {
//         Alert.alert('Success', 'Item added to wishlist!');
//         navigation.navigate('Wishlist');
//       } else {
//         Alert.alert('Error', data.message || 'Failed to add to wishlist');
//       }
//     } catch (error) {
//       console.error('Wishlist API error:', error);
//       Alert.alert('Error', 'Something went wrong while adding to wishlist');
//     }
//   };

//   return (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() => navigation.navigate('ProductDetail', { itemId: item.itemId })}
//     >
//       <View style={styles.imageContainer}>
//         <Image
//           source={{ uri: item.image?.uri || 'https://via.placeholder.com/150' }}
//           style={styles.image}
//           onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
//         />
//         <TouchableOpacity style={styles.heartIcon} onPress={handleHeartPress}>
//           <View style={styles.heartBackground}>
//             <Image source={require('../../assets/Images/Heart.png')} style={styles.heartImage} />
//           </View>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.contentContainer}>
//         <Text numberOfLines={2} style={styles.title}>{item.name || 'No Name'}</Text>
//         <Text style={styles.subtitle}>Women's Party Wear</Text>

//         <View style={styles.priceContainer}>
//           <Text style={styles.mrpLabel}>MRP</Text>
//           <Text style={styles.mrp}>₹{item.mrp || 'N/A'}</Text>
//           <Text style={styles.price}>₹{item.price || 'N/A'}</Text>
//           <Text style={styles.discount}>{Math.round(item.discount) || 0}% Off</Text>
//         </View>

//         <View style={styles.ratingContainer}>
//           <View style={styles.stars}>
//             {[1, 2, 3, 4].map((_, index) => (
//               <Icon key={index} name="star" size={12} color="#FF9017" />
//             ))}
//             <Icon name="star-half-empty" size={12} color="#FF9017" />
//             <Text style={styles.rating}> 4.5</Text>
//           </View>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
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
//     aspectRatio: 3/4,
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
// });

// export default SubCategoryItem;



import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedItem } from '../../redux/reducers/itemSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BASE_URL } from '../../config/apiConfig';

const SubCategoryItem = ({ item, navigation }) => {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  console.log('📦 Rendering SubCategoryItem:', JSON.stringify(item, null, 2));

  const handleHeartPress = async () => {
    const itemId = item?.itemId;
    const color = item?.defaultColor || 'Black';

    if (!itemId) {
      console.warn('item.itemId is missing');
      return;
    }

    if (!token) {
      dispatch(setSelectedItem({ itemId, color }));
      navigation.navigate('Login', {
        fromScreen: 'SubCategoryScreen',
        actionAfterLogin: 'like_item',
        itemId,
      });
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/userwishlist/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId, color }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        Alert.alert('Success', 'Item added to wishlist!');
        navigation.navigate('Wishlist');
      } else {
        Alert.alert('Error', data.message || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Wishlist API error:', error);
      Alert.alert('Error', 'Something went wrong while adding to wishlist');
    }
  };

  // Function to render dynamic stars based on userAverageRating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating); // Number of full stars
    const hasHalfStar = rating % 1 >= 0.5; // Check for half star (0.5 or greater)
    const totalStars = 5; // Total stars to display
    const stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={`full-${i}`} name="star" size={12} color="#FF9017" />
      );
    }

    // Add half star if applicable
    if (hasHalfStar && fullStars < totalStars) {
      stars.push(
        <Icon key="half" name="star-half-empty" size={12} color="#FF9017" />
      );
    }

    // Add empty stars to fill up to 5
    for (let i = stars.length; i < totalStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star-o" size={12} color="#FF9017" />
      );
    }

    return stars;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail', { itemId: item.itemId })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image?.uri || 'https://via.placeholder.com/150' }}
          style={styles.image}
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
        />
        <TouchableOpacity style={styles.heartIcon} onPress={handleHeartPress}>
          <View style={styles.heartBackground}>
            <Image source={require('../../assets/Images/Heart.png')} style={styles.heartImage} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text numberOfLines={2} style={styles.title}>{item.name || 'No Name'}</Text>
        {/* <Text style={styles.subtitle}>Women's Party Wear</Text> */}

        <View style={styles.priceContainer}>
          <Text style={styles.mrpLabel}>MRP</Text>
          <Text style={styles.mrp}>₹{item.mrp || 'N/A'}</Text>
          <Text style={styles.price}>₹{item.price || 'N/A'}</Text>
          <Text style={styles.discount}>{Math.round(item.discount) || 0}% Off</Text>
        </View>

        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {renderStars(item.userAverageRating || 0)}
            <Text style={styles.rating}> {item.userAverageRating ? item.userAverageRating.toFixed(1) : 'N/A'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    aspectRatio: 3/4,
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
});

export default SubCategoryItem;