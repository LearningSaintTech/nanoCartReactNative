import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import PartnerWishlistCardItem from '../Components/PartnerWishlistCardItem';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../config/apiConfig';

const PartnerWishlistScreen = () => {
  const navigation = useNavigation();
  const token = useSelector(state => state.auth.token);
  const cartItems = useSelector(state => state.cart.items);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Calculate scaling factor based on reference width (e.g., 375 for iPhone SE)
  const scale = (size) => (width / 375) * size;

  // Calculate total cart count
  const totalCartCount = cartItems.reduce((sum, item) => {
    const count = item.orderDetails.reduce(
      (colorSum, colorObj) =>
        colorSum + colorObj.sizeAndQuantity.reduce((sizeSum, s) => sizeSum + s.quantity, 0),
      0
    );
    return sum + count;
  }, 0);

  // Log for debugging
  console.log('PartnerWishlistScreen - Cart Items:', cartItems);
  console.log('PartnerWishlistScreen - Total Cart Count:', totalCartCount);

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/partner/wishlist`, {
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

  const handleCartPress = () => {
    if (token) {
      navigation.navigate('PartnerCart');
    } else {
      navigation.navigate('Login', { fromScreen: 'PartnerWishlistScreen' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PARTNER WISHLIST</Text>
        </View>
        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('PartnerSearch')}>
            <Image source={require('../../assets/icon/SearchIcon.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartIconWrapper} onPress={handleCartPress}>
            <Image source={require('../../assets/icon/CartIcon.png')} style={styles.icon} />
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
    </SafeAreaView>
  );
};

export default PartnerWishlistScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'uppercase',
    marginLeft: 8,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    marginHorizontal: 8,
  },
  cartIconWrapper: {
    position: 'relative',
  },
  grid: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
});