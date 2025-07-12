import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useSelector} from 'react-redux';
import {BASE_URL} from '../../config/apiConfig';
import {useNavigation} from '@react-navigation/native';

const SuggestionCard = () => {
  const token = useSelector(state => state.auth.token);
  const navigation = useNavigation();

  const [wishlistItem, setWishlistItem] = useState(null);
  const [cartItem, setCartItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`${BASE_URL}/partner/wishlist`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      const first = json?.data?.items?.[0] || null;
      setWishlistItem(first);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch(`${BASE_URL}/partner/cart`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      const first = json?.data?.items?.[0] || null;

      console.log("this is cart item",first);
      setCartItem(first);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      setLoading(true);
      await Promise.all([fetchWishlist(), fetchCart()]);
      setLoading(false);
    };
    loadData();
  }, [token]);

  if (loading) {
    return (
      <View style={[styles.container, {alignItems: 'center'}]}>
        <ActivityIndicator size="small" color="#FF6B00" />
      </View>
    );
  }

  return (
    <>
      {/* ---------- Wishlist Card ---------- */}
      {wishlistItem && (
        <View style={styles.container}>
          <Text style={styles.title}>From your wishlist</Text>
          <View style={styles.card}>
            <Image
              source={{uri: wishlistItem.image}}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.details}>
              <Text style={styles.name}>{wishlistItem.itemId.name}</Text>
              <Text style={styles.desc}>{wishlistItem.itemId.description}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  ₹{wishlistItem.itemId.discountedPrice}
                </Text>
                <Text style={styles.oldPrice}>₹{wishlistItem.itemId.MRP}</Text>
                <Text style={styles.discount}>
                  {wishlistItem.itemId.discountPercentage.toFixed(0)}% Off
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <View style={styles.ratingBox}>
                  <Icon name="star" size={10} color="#fff" />
                  <Text style={styles.ratingText}>4.5</Text>
                </View>
                <Text style={styles.review}>79 Ratings & 55 Reviews</Text>
              </View>
              <Text style={styles.sizeText}>Color: {wishlistItem.color}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('PartnerWishlist')}>
            <Text style={styles.buttonText}>VIEW WISHLIST</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ---------- Cart Card ---------- */}
      {cartItem && (
        <View style={styles.container}>
          <Text style={styles.title}>From your cart</Text>
          <View style={styles.card}>
            <Image
              source={{uri: cartItem?.itemId?.image}}
              style={styles.image}
              resizeMode="cover"
              onError={() => console.warn('Image failed to load')}
            />

            <View style={styles.details}>
              <Text style={styles.name}>{cartItem?.itemId?.name}</Text>
              <Text style={styles.desc}>{cartItem?.itemId?.description}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{cartItem?.itemId?.discountedPrice}</Text>
                <Text style={styles.oldPrice}>₹{cartItem?.itemId?.MRP}</Text>
                <Text style={styles.discount}>20% Off</Text>
              </View>
              <View style={styles.ratingRow}>
                <View style={styles.ratingBox}>
                  <Icon name="star" size={10} color="#fff" />
                  <Text style={styles.ratingText}>4.5</Text>
                </View>
                <Text style={styles.review}>79 Ratings & 55 Reviews</Text>
              </View>
              <Text style={styles.sizeText}>
                Color: {cartItem.defaultColor}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('PartnerCart')}>
            <Text style={styles.buttonText}>VIEW CART</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  card: {flexDirection: 'row', gap: 12},
  image: {
    width: 100,
    height: 130,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },
  details: {flex: 1},
  name: {fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4},
  desc: {fontSize: 12, color: '#666', marginBottom: 8},
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  price: {fontSize: 14, fontWeight: '600', color: '#333'},
  oldPrice: {fontSize: 12, color: '#999', textDecorationLine: 'line-through'},
  discount: {fontSize: 12, color: '#FF6B00', fontWeight: '500'},
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  ratingText: {color: '#fff', fontSize: 12, fontWeight: '500'},
  review: {fontSize: 12, color: '#666'},
  sizeText: {fontSize: 12, color: '#666', marginBottom: 8},
  button: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FF6B00',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 4,
  },
  buttonText: {color: '#FF6B00', fontSize: 14, fontWeight: '500'},
});

export default SuggestionCard;
