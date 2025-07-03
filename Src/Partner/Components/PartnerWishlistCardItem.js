// import React from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
// } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';

// const PartnerWishlistCardItem = ({ item, navigation, onRemove }) => {
//   const dispatch = useDispatch();
//   const token = useSelector(state => state.auth.token);

//   const itemId = item?.itemId; // ✅ itemId is a string
//   const color = item?.color;

//   const handleHeartPress = async () => {
//     console.log('Heart press triggered');
//     console.log('Extracted itemId:', itemId);
//     console.log('Extracted color:', color);
//     console.log('Token:', token);

//     if (!token || !itemId || !color) {
//       console.warn('❌ Missing token, itemId, or color');
//       return;
//     }

//     try {
//       const response = await fetch('${BASE_URL}/partner/wishlist/removeitem', {
//         method: 'PUT',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ itemId, color }),
//       });

//       const data = await response.json();
//       console.log('✅ Partner Wishlist Remove Response:', data);

//       if (response.ok) {
//         Alert.alert('Partner Removed', 'Partner Item removed from wishlist.');
//         onRemove(); // Reload wishlist
//       } else {
//         Alert.alert('Error', data.message || 'Failed to remove from wishlist');
//       }
//     } catch (error) {
//       console.error(' API Error:', error);
//       Alert.alert('Error', 'Something went wrong.');
//     }
//   };

//   // For UI purpose, dummy product display (optional logic)
//   const dummyProduct = {
//     name: 'Item Name',
//     description: 'Some description',
//     image: 'https://via.placeholder.com/200x150',
//     MRP: 999,
//     discountedPrice: 599,
//     discountPercentage: 40,
//   };

//   return (
//     <TouchableOpacity style={styles.card}>
//       <Image source={{ uri: dummyProduct.image }} style={styles.image} />

//       <TouchableOpacity style={styles.heartIcon} onPress={handleHeartPress}>
//         <Image
//           source={require('../../assets/Images/Heart.png')}
//           style={{ width: 18, height: 18 }}
//         />
//       </TouchableOpacity>

//       <Text numberOfLines={1} style={styles.title}>
//         {dummyProduct.name}
//       </Text>

//       <Text style={styles.subtitle}>{dummyProduct.description}</Text>

//       <View style={styles.priceRow}>
//         <Text style={styles.mrp}>MRP ₹{dummyProduct.MRP}</Text>
//         <Text style={styles.price}>₹{dummyProduct.discountedPrice}</Text>
//         <Text style={styles.discount}>
//           ({dummyProduct.discountPercentage}% Off)
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     width: '47%',
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     marginVertical: 8,
//     marginHorizontal: '1.5%',
//     padding: 10,
//     position: 'relative',
//   },
//   image: {
//     width: '100%',
//     height: 160,
//     borderRadius: 6,
//     backgroundColor: '#f0f0f0',
//   },
//   heartIcon: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 4,
//     elevation: 2,
//   },
//   title: {
//     fontWeight: 'bold',
//     marginTop: 8,
//     fontSize: 13,
//   },
//   subtitle: {
//     fontSize: 11,
//     color: '#888',
//   },
//   priceRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//     flexWrap: 'wrap',
//   },
//   mrp: {
//     fontSize: 11,
//     textDecorationLine: 'line-through',
//     marginRight: 4,
//     color: '#888',
//   },
//   price: {
//     fontWeight: 'bold',
//     marginRight: 4,
//     fontSize: 13,
//   },
//   discount: {
//     fontSize: 11,
//     color: 'orange',
//   },
// });

// export default PartnerWishlistCardItem;



import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const PartnerWishlistCardItem = ({ item, navigation, onRemove }) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  // Ensure itemId and color are properly extracted
  const itemId = item?.itemId?._id || item?.itemId; // Handle both object and string cases
  const color = item?.color;

  const handleHeartPress = async () => {
    console.log('Heart press triggered');
    console.log('Extracted itemId:', itemId);
    console.log('Extracted color:', color);
    console.log('Token:', token);

    if (!token || !itemId || !color) {
      console.warn('❌ Missing token, itemId, or color');
      Alert.alert('Error', 'Missing required data to remove item from wishlist.');
      return;
    }

    try {
      const response = await fetch('${BASE_URL}/partner/wishlist/removeitem', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, color }),
      });

      const data = await response.json();
      console.log('✅ Partner Wishlist Remove Response:', data);

      if (response.ok) {
        Alert.alert('Success', 'Item removed from wishlist.');
        onRemove(); // Trigger the callback to reload the wishlist
      } else {
        Alert.alert('Error', data.message || 'Failed to remove item from wishlist.');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Something went wrong while removing the item.');
    }
  };

  // For UI purpose, dummy product display (optional logic)
  const dummyProduct = {
    name: item?.itemId?.name || 'Item Name',
    description: item?.itemId?.description || 'Some description',
    image: item?.itemId?.image || 'https://via.placeholder.com/200x150',
    MRP: item?.itemId?.MRP || 999,
    discountedPrice: item?.itemId?.discountedPrice || 599,
    discountPercentage: item?.itemId?.discountPercentage || 40,
  };

  return (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: dummyProduct.image }} style={styles.image} />

      <TouchableOpacity style={styles.heartIcon} onPress={handleHeartPress}>
        <Image
          source={require('../../assets/Images/Heart.png')}
          style={{ width: 18, height: 18 }}
        />
      </TouchableOpacity>

      <Text numberOfLines={1} style={styles.title}>
        {dummyProduct.name}
      </Text>

      <Text style={styles.subtitle}>{dummyProduct.description}</Text>

      <View style={styles.priceRow}>
        <Text style={styles.mrp}>MRP ₹{dummyProduct.MRP}</Text>
        <Text style={styles.price}>₹{dummyProduct.discountedPrice}</Text>
        <Text style={styles.discount}>
          ({dummyProduct.discountPercentage}% Off)
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: '1.5%',
    padding: 10,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  heartIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 13,
  },
  subtitle: {
    fontSize: 11,
    color: '#888',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  mrp: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginRight: 4,
    color: '#888',
  },
  price: {
    fontWeight: 'bold',
    marginRight: 4,
    fontSize: 13,
  },
  discount: {
    fontSize: 11,
    color: 'orange',
  },
});

export default PartnerWishlistCardItem;