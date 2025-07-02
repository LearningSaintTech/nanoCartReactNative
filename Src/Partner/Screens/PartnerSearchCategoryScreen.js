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

  // Scaling function based on reference width (375px, e.g., iPhone SE)
  const scale = (size) => (width / 375) * size;

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
              <Image
                source={require('../../assets/Images/Backward.png')}
                style={[styles.backIcon, { width: scale(24), height: scale(24) }]}
              />
            </TouchableOpacity>

            <View
              style={[styles.searchBox, { paddingHorizontal: scale(16), height: scale(48), borderRadius: scale(4) }]}
            >
              <Image
                source={require('../../assets/Images/SearchIcon.png')}
                style={[styles.searchIcon, { width: scale(20), height: scale(20), marginRight: scale(12) }]}
              />
              <TextInput
                placeholder="Search your style"
                placeholderTextColor="#999999"
                style={[styles.searchInput, { fontSize: scale(16), paddingVertical: scale(8) }]}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Recent Searches */}
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Recent Searches</Text>
        <View style={styles.recentSearchesContainer}>
          <FlatList
            data={recentSearches.slice(0, 3)} // Show only first 3 items
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
          onButtonPress={() => navigation.navigate('Wishlist')}
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
          onButtonPress={() => console.log('Cart clicked')}
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
  backIcon: {
    // width and height adjusted via scale
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
    tintColor: '#999999',
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