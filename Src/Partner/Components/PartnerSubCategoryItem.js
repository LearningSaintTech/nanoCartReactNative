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

const PartnerSubCategoryItem = ({ item, navigation }) => {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  console.log('PartnerSubCategoryItem rendered:', { itemId: item?.itemId, name: item?.name }); // Log component render and item data

  const handleHeartPress = async () => {
    const itemId = item?.itemId;
    const color = item?.defaultColor || 'Black';

    if (!itemId) {
      console.warn('item.itemId is missing', { item }); // Log missing itemId
      return;
    }

    console.log('handleHeartPress triggered:', { itemId, color, token }); // Log wishlist action details

    if (!token) {
      console.log('No token, redirecting to Login', { itemId, color }); // Log redirect to login
      dispatch(setSelectedItem({ itemId, color }));
      navigation.navigate('Login', {
        fromScreen: 'SubCategoryScreen',
        actionAfterLogin: 'like_item',
        itemId,
      });
      return;
    }

    try {
      console.log('Sending wishlist API request:', { itemId, color }); // Log API call start
      const res = await fetch('http://192.168.1.20 :4000/api/partner/wishlist/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId, color }),
      });

      const data = await res.json();
      console.log('Wishlist API response:', { status: res.status, data }); // Log API response

      if (res.ok && data.success) {
        Alert.alert('Success', 'Item added to wishlist!');
        navigation.navigate('PartnerWishlist');
      } else {
        console.error('Wishlist API failed:', { message: data.message, status: res.status }); // Log API error
        Alert.alert('Error', data.message || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Wishlist API error:', { error: error.message, itemId }); // Log network or parsing error
      Alert.alert('Error', 'Something went wrong while adding to wishlist');
    }
  };

  // Use the discount percentage from the item or calculate it if not provided
  const discountPercentage = item.discountPercentage
    ? Math.round(item.discountPercentage)
    : item.mrp && item.price
      ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
      : 0;

  console.log('Calculated discount:', { itemId: item?.itemId, discountPercentage }); // Log discount calculation

  // Dynamic subtitle based on filters (e.g., occasion or type)
  const getSubtitle = () => {
    if (item.filters && item.filters.length > 0) {
      const occasion = item.filters.find(f => f.key === 'Occasion')?.value;
      const type = item.filters.find(f => f.key === 'Type')?.value;
      const subtitle = occasion || type || 'Fashion Item';
      console.log('Subtitle generated:', { itemId: item?.itemId, subtitle }); // Log subtitle result
      return subtitle;
    }
    return 'Fashion Item';
  };

  // Placeholder for rating (since JSON doesn't provide it)
  const rating = 4.5; // This could be added to the API response in the future
  const stars = '★★★★☆'; // Static for now, can be dynamic based on rating

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          console.log('Navigating to ProductDetail:', { itemId: item.itemId }); // Log navigation to product detail
          navigation.navigate('PartnerProductDetail', { itemId: item.itemId });
        }}
      >
        <Image
          source={{ uri: item.image?.uri || item.image }}
          style={styles.image}
          onError={(e) => console.warn(`Failed to load image for ${item.name}`, e.nativeEvent.error)} // Log image load error
        />

        <TouchableOpacity style={styles.heartIcon} onPress={handleHeartPress}>
          <Image
            source={require('../../assets/Images/Heart.png')}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>

        <Text numberOfLines={1} style={styles.title}>
          {item.name || 'Unnamed Item'}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {getSubtitle()}
        </Text>

        <View style={styles.priceRow}>
          {item.mrp && (
            <Text style={styles.mrp}>MRP ₹{item.mrp.toFixed(2)}</Text>
          )}
          {item.price && (
            <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
          )}
          {discountPercentage > 0 && (
            <Text style={styles.discount}>{discountPercentage}% OFF</Text>
          )}
        </View>
        <View style={styles.ratingRow}>
          <Text style={styles.star}>{stars}</Text>
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  cardContainer: {
    width: '50%',
    backgroundColor: '#ffffff',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 10,
    position: 'relative',
  },
  image: {
    width: 160,
    height: 200,
    resizeMode: 'cover',
  },
  heartIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  title: {
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 14,
    color: '#000',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#696969',
    marginTop: 9,
  },
  star: {
    fontSize: 22,
    color: '#D2691E',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  price: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
    marginRight: 6,
  },
  mrp: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    color: '#888',
    marginRight: 6,
  },
  discount: {
    fontSize: 12,
    color: '#D2691E',
    fontWeight: 'bold',
  },
});

export default PartnerSubCategoryItem;