import React from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import PartnerGenderTabs from '../Components/PartnerGenderTabs';
import SuggestionCard from '../../UserFlow/Component/SuggestionCard';

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

  // Scaling function based on reference width (375px, e.g., iPhone SE)
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
  console.log('PartnerSearchCategory - Cart Items:', cartItems);
  console.log('PartnerSearchCategory - Total Cart Count:', totalCartCount);
  console.log('PartnerSearchCategory - Navigation State:', navigation.getState());

  const handleCartPress = () => {
    if (token) {
      navigation.navigate('PartnerCart');
    } else {
      navigation.navigate('Login', { fromScreen: 'PartnerSearchCategory' });
    }
  };

  const renderContent = () => (
    <View style={styles.container}>
      {/* Header */}
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
              style={[styles.searchBox, { paddingHorizontal: scale(16), height: scale(48), borderRadius: scale(4) }]}
            >
              <Image
                source={require('../../assets/icon/SearchIcon.png')}
                style={[styles.searchIcon, { width: scale(20), height: scale(20), marginRight: scale(12) }]}
              />
              <TextInput
                placeholder="Search your style"
                placeholderTextColor="#999999"
                style={[styles.searchInput, { fontSize: scale(16), paddingVertical: scale(8) }]}
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

      {/* Recent Searches */}
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Recent Searches</Text>
        <View style={styles.recentSearchesContainer}>
          <FlatList
            data={recentSearches.slice(0, 3)}
            keyExtractor={(item, index) => index.toString()}
            horizontal={false}
            scrollEnabled={false}
            numColumns={3}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.recentItem}>
                <Image source={item.image} style={styles.recentImage} />
                <Text style={styles.recentLabel}>{item.label}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.recentListContainer}
          />
        </View>

        {/* Popular Categories */}
        <Text style={styles.sectionTitle}>Popular Categories</Text>
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
    // paddingHorizontal and height adjusted via scale
  },
  searchIcon: {
    // width, height, and marginRight adjusted via scale
    // tintColor: '#999999',
  },
  cartIconWrapper: {
    position: 'relative',
  },
  cartIcon: {
    // width and height adjusted via scale
  },
  searchInput: {
    flex: 1,
    // fontSize and paddingVertical adjusted via scale
    color: '#333333',
  },
  contentContainer: {
    paddingTop: 24,
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
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
    width: '31%', // Approximately one-third of container width minus margins
  },
  recentImage: {
    width: '100%',
    aspectRatio: 3/4,
    marginBottom: 8,
  },
  recentLabel: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default PartnerSearchCategory;