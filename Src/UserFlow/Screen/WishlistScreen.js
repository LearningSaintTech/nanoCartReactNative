import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import FilterComponent from '../Component/FilterComponent';
import SortComponent from '../Component/SortComponent';
import WishlistCardItem from '../Component/WishlistCardItem';
import { BASE_URL } from '../../config/apiConfig';

const WishlistScreen = () => {
  const navigation = useNavigation();
  const token = useSelector(state => state.auth.token);
  const cartItems = useSelector(state => state.cart.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchWishlist = async () => {
    if (!token) {
      setShowLoginModal(true); //  Show login modal if token is missing
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/userwishlist`, {
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
        console.warn("Failed to load wishlist:", data.message);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
         
          <Text style={styles.headerTitle}>WISHLIST</Text>
        </View>

        <View style={styles.rightIcons}>
          <TouchableOpacity>
            <Image source={require('../../assets/Images/SearchIcon.png')} style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cartIconWrapper}
            onPress={() => {
              if (token) {
                navigation.navigate('Cart');
              } else {
                setShowLoginModal(true);
              }
            }}
          >
            <Image source={require('../../assets/Images/Cart.png')} style={styles.icon} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Wishlist Grid */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <WishlistCardItem
              item={item}
              navigation={navigation}
              onRemove={fetchWishlist}
            />
          )}
          contentContainerStyle={styles.grid}
        />
      )}

      {/* Filter and Sort Modals */}
      <Modal animationType="slide" transparent visible={isFilterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
        <FilterComponent onClose={() => setFilterModalVisible(false)} />
      </Modal>
      <Modal animationType="slide" transparent visible={isSortModalVisible} onRequestClose={() => setSortModalVisible(false)}>
        <SortComponent onClose={() => setSortModalVisible(false)} />
      </Modal>

      {/*  Not Logged In Modal */}
      <Modal visible={showLoginModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Uh-oh!</Text>
            <Text style={styles.modalMessage}>You're not logged in.</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                setShowLoginModal(false);
                navigation.navigate('Login', { fromScreen: 'Wishlist' });
              }}>
              <Text style={styles.loginButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WishlistScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f6' },
  header: {
    marginTop: 20,
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
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#000', textTransform: 'uppercase',marginLeft:30 },
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    color: '#D86427',
  },
  modalMessage: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#D86427',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
