import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import PartnerWishlistCardItem from '../Components/PartnerWishlistCardItem';

const PartnerWishlistScreen = () => {
  const navigation = useNavigation();
  const token = useSelector(state => state.auth.token);
  const cartItems = useSelector(state => state.cart.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.20 :4000/api/partner/wishlist', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setWishlist(data?.data?.items || []);
      } else {
        console.warn('Failed to load partner wishlist:', data.message);
      }
    } catch (err) {
      console.error('Error fetching partner wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate('PartnerHome')}>
            <Image source={require('../../assets/Images/Back.png')} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PARTNER WISHLIST</Text>
        </View>

        <View style={styles.rightIcons}>
          <TouchableOpacity>
            <Image source={require('../../assets/Images/SearchIcon.png')} style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cartIconWrapper} onPress={() => navigation.navigate('Cart')}>
            <Image source={require('../../assets/Images/Cart.png')} style={styles.icon} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PartnerWishlistCardItem
              item={item}
              navigation={navigation}
              onRemove={fetchWishlist}
            />
          )}
          contentContainerStyle={styles.grid}
        />
      )}
    </View>
  );
};

export default PartnerWishlistScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f6' },
  header: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 32,
    backgroundColor: '#fff',
    elevation: 2,
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backIcon: { width: 24, height: 24, resizeMode: 'contain', marginRight: 8 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#000', textTransform: 'uppercase' },
  rightIcons: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 22, height: 22, resizeMode: 'contain', marginHorizontal: 8 },
  cartIconWrapper: { position: 'relative' },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'orange',
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  grid: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
});
