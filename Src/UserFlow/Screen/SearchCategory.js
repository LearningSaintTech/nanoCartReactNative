import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedItem } from '../../redux/reducers/itemSlice';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import GenderTabs from '../Component/GenderTabs';
import SuggestionCard from '../Component/SuggestionCard';
import { debounce } from 'lodash'; // Import lodash for debouncing
import { BASE_URL } from '../../config/apiConfig';

// Sample recent searches data
const recentSearches = [
  { label: 'Chiffon Saree', image: require('../../assets/Images/Girl1.png') },
  { label: 'Formal Shirt', image: require('../../assets/Images/Girl2.png') },
  { label: 'Cargo Pants', image: require('../../assets/Images/Girl3.png') },
  { label: 'Chiffon Saree', image: require('../../assets/Images/Girl1.png') },
  { label: 'Formal Shirt', image: require('../../assets/Images/Girl2.png') },
  { label: 'Cargo Pants', image: require('../../assets/Images/Girl3.png') },
];

const SearchCategory = () => {
  const navigation = useNavigation();
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const [wishlistItem, setWishlistItem] = useState(null);
  const [cartItem, setCartItem] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState(null);
  const [cartError, setCartError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [sortBy, setSortBy] = useState('popularity');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [listKey, setListKey] = useState(Date.now().toString());
  const [filtersData, setFiltersData] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterLoading, setFilterLoading] = useState(true);
  const [filterError, setFilterError] = useState(null);
  const [currentSort, setCurrentSort] = useState(sortBy);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const limit = 5;

  // Sort options
  const sortOptions = [
    { label: 'Latest', value: 'latest' },
    { label: 'Popularity', value: 'popularity' },
    { label: 'Price: High to Low', value: 'priceHighToLow' },
    { label: 'Price: Low to High', value: 'priceLowToHigh' },
    { label: 'Offers & Discount', value: 'offer' },
  ];

  // Fetch wishlist data
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (!token) {
          setWishlistError('Please log in to view wishlist');
          setWishlistLoading(false);
          return;
        }
        const response = await fetch(`${BASE_URL}/userwishlist`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok && data.success && data.data?.items?.length > 0) {
          setWishlistItem(data.data.items[0]);
        } else {
          setWishlistError(data.message || 'No wishlist items found');
        }
      } catch (err) {
        setWishlistError('Failed to fetch wishlist');
      } finally {
        setWishlistLoading(false);
      }
    };
    fetchWishlist();
  }, [token]);

  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (!token) {
          setCartError('Please log in to view cart');
          setCartLoading(false);
          return;
        }
        const response = await fetch(`${BASE_URL}/usercart`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok && data.success && data.data?.items?.length > 0) {
          setCartItem(data.data.items[0]);
        } else {
          setCartError(data.message || 'No cart items found');
        }
      } catch (err) {
        setCartError('Failed to fetch cart');
      } finally {
        setCartLoading(false);
      }
    };
    fetchCart();
  }, [token]);

  // Fetch filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setFilterLoading(true);
        const apiUrl = `${BASE_URL}/filter/`;
        const response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        const json = await response.json();
        console.log("json",json)
        if (json?.success && Array.isArray(json.data)) {
          const mappedFilters = {};
          json.data.forEach((filter) => {
            if (filter.key && Array.isArray(filter.values)) {
              mappedFilters[filter.key] = {};
              filter.values.forEach((val) => {
                mappedFilters[filter.key][val] = appliedFilters?.[filter.key]?.[val] || false;
              });
            }
          });
          mappedFilters['Price range'] = { enabled: false };
          setFiltersData([...json.data, { key: 'Price range', values: [] }]);
          setFilters(mappedFilters);
          setSelectedCategory(json.data[0]?.key || 'Price range');
        } else {
          setFilterError(json?.message || 'No filters available');
          Alert.alert('Error', json?.message || 'No filters available');
        }
      } catch (error) {
        setFilterError('Error fetching filters');
        Alert.alert('Error', 'Error fetching filters');
      } finally {
        setFilterLoading(false);
      }
    };

    fetchFilters();
  }, [token]);

  // Fetch search results
  useEffect(() => {
    if (!searchQuery) {
      setProducts([]);
      setPage(1);
      setTotalPages(1);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      const queryParams = [
        `keyword=${encodeURIComponent(searchQuery)}`,
        `page=${page}`,
        `limit=${limit}`,
        `sortBy=${encodeURIComponent(sortBy)}`,
      ];

      Object.keys(appliedFilters).forEach((key) => {
        if (key === 'Price range' && priceRange.min && priceRange.max) {
          queryParams.push(`Price range=${encodeURIComponent(`₹${priceRange.min} - ₹${priceRange.max}`)}`);
        } else {
          const selectedValues = Object.entries(appliedFilters[key])
            .filter(([_, isSelected]) => isSelected)
            .map(([val]) => val);
          if (selectedValues.length > 0) {
            queryParams.push(
              `${encodeURIComponent(key)}=${encodeURIComponent(selectedValues.join(','))}`
            );
          }
        }
      });

      const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
      const apiUrl = `${BASE_URL}/items/search${queryString}`;

      try {
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json',
          },
        });
        const json = await response.json();
        if (json?.success) {
          const formattedItems = (json.data?.items || []).map((item) => ({
            name: item.name || 'Unnamed Item',
            description: item.description || 'No description available',
            mrp: item.MRP || 0,
            price: item.discountedPrice || 0,
            discount: item.discountPercentage || 0,
            image: { uri: item.image || '' },
            itemId: item._id || '',
            defaultColor: item.defaultColor || '',
            userAverageRating: item.userAverageRating || 4.5,
          }));
          setProducts(page === 1 ? formattedItems : [...products, ...formattedItems]);
          setTotalPages(json.data?.totalPages || 1);
          setListKey(Date.now().toString());
          if (formattedItems.length === 0 && page === 1) {
            Alert.alert('No Results', 'No items found for your search');
          }
        } else {
          Alert.alert('Error', json?.message || 'Failed to load search results');
          setProducts([]);
          setListKey(Date.now().toString());
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch search results');
        setProducts([]);
        setListKey(Date.now().toString());
      } finally {
        setLoading(false);
      }
    };

    const debouncedFetchProducts = debounce(fetchProducts, 500);
    debouncedFetchProducts();
    return () => debouncedFetchProducts.cancel();
  }, [searchQuery, appliedFilters, sortBy, page, token]);

  // Update active filter count
  useEffect(() => {
    let count = Object.values(appliedFilters)
      .flatMap((obj) => Object.values(obj))
      .filter((v) => v).length;
    if (priceRange.min && priceRange.max) count += 1;
    setActiveFilterCount(count);
  }, [appliedFilters, priceRange]);

  // Handlers
  const handleApplyFilters = (filteredItems, filters, pagination) => {
    setProducts(filteredItems);
    setAppliedFilters(filters);
    setPage(1);
    setTotalPages(pagination?.totalPages || 1);
    setListKey(Date.now().toString());
    setFilterModalVisible(false);
  };

  const handleApplySort = (sortOption) => {
    setSortBy(sortOption || 'popularity');
    setCurrentSort(sortOption || 'popularity');
    setPage(1);
    setSortModalVisible(false);
  };

  const openFilterModal = () => setFilterModalVisible(true);
  const closeFilterModal = () => setFilterModalVisible(false);
  const openSortModal = () => setSortModalVisible(true);
  const closeSortModal = () => setSortModalVisible(false);

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const handleFilterChange = (category, option) => {
    setFilters((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [option]: !prev[category][option],
      },
    }));
  };

  const clearAllFilters = () => {
    const cleared = {};
    filtersData.forEach((filter) => {
      if (filter.key !== 'Price range') {
        cleared[filter.key] = {};
        filter.values.forEach((val) => {
          cleared[filter.key][val] = false;
        });
      }
    });
    setFilters(cleared);
    setPriceRange({ min: '', max: '' });
    handleApplyFilters([], cleared, { currentPage: 1, totalPages: 1, totalItems: 0 });
  };

  const applyFilters = async (filterState = filters) => {
    if (priceRange.min && priceRange.max) {
      const min = Number(priceRange.min);
      const max = Number(priceRange.max);
      if (isNaN(min) || isNaN(max) || min > max) {
        Alert.alert('Error', 'Invalid price range. Ensure Min and Max are numbers and Min is less than Max.');
        return;
      }
    }

    const queryParams = [
      `keyword=${encodeURIComponent(searchQuery)}`,
      'page=1',
      `limit=${limit}`,
      `sortBy=${encodeURIComponent(sortBy)}`,
    ];

    Object.keys(filterState).forEach((key) => {
      if (key === 'Price range' && priceRange.min && priceRange.max) {
        queryParams.push(`Price range=${encodeURIComponent(`₹${priceRange.min} - ₹${priceRange.max}`)}`);
      } else {
        const selectedValues = Object.entries(filterState[key])
          .filter(([_, isSelected]) => isSelected)
          .map(([val]) => val);
        if (selectedValues.length > 0) {
          queryParams.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(selectedValues.join(','))}`
          );
        }
      }
    });

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const apiUrl = `${BASE_URL}/items/search${queryString}`;

    try {
      setFilterLoading(true);
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data?.success) {
        const formattedItems = (data.data?.items || []).map((item) => ({
          name: item.name || 'Unnamed Item',
          description: item.description || '',
          mrp: item.MRP || 0,
          price: item.discountedPrice || 0,
          discount: item.discountPercentage || 0,
          image: { uri: item.image || '' },
          itemId: item._id || '',
          defaultColor: item.defaultColor || '',
          userAverageRating: item.userAverageRating || 4.5,
        }));
        handleApplyFilters(formattedItems, filterState, {
          currentPage: data.data?.currentPage || 1,
          totalPages: data.data?.totalPages || 1,
          totalItems: data.data?.totalItems || 0,
        });
        if (formattedItems.length === 0) {
          Alert.alert('No Results', 'No items match the selected filters');
        }
      } else {
        setFilterError(data?.message || 'Failed to apply filters');
        Alert.alert('Error', data?.message || 'Failed to apply filters');
      }
    } catch (error) {
      setFilterError('Error applying filters');
      Alert.alert('Error', 'Error applying filters');
    } finally {
      setFilterLoading(false);
    }
  };

  // SubCategoryItem logic
  const renderSubCategoryItem = ({ item }) => {
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
          fromScreen: 'SearchCategory',
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
        Alert.alert('Error', 'Something went wrong while adding to wishlist');
      }
    };

    const rating = item.userAverageRating || 4.5;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

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
          <Text style={styles.subtitle}>Women's Party Wear</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.mrpLabel}>MRP</Text>
            <Text style={styles.mrp}>₹{(item.mrp || 0).toFixed(2)}</Text>
            <Text style={styles.price}>₹{(item.price || 0).toFixed(2)}</Text>
            <Text style={styles.discount}>{Math.round(item.discount) || 0}% Off</Text>
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[...Array(fullStars)].map((_, index) => (
                <Icon key={index} name="star" size={12} color="#FF9017" />
              ))}
              {hasHalfStar && (
                <Icon name="star-half-empty" size={12} color="#FF9017" />
              )}
              {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, index) => (
                <Icon key={index + fullStars + 1} name="star-o" size={12} color="#FF9017" />
              ))}
              <Text style={styles.rating}> {rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Filter modal logic
  const CustomCheckbox = ({ value, onValueChange }) => (
    <TouchableOpacity
      onPress={onValueChange}
      style={[styles.checkboxBase, value && styles.checkboxChecked]}
    >
      {value && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );

  const renderFilterOptions = () => {
    if (!selectedCategory || !filters[selectedCategory]) return null;

    if (selectedCategory === 'Price range') {
      return (
        <View style={styles.priceRangeContainer}>
          <Text style={styles.optionText}>Price Range (₹)</Text>
          <View style={styles.priceInputRow}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min"
              keyboardType="numeric"
              value={priceRange.min}
              onChangeText={(text) => setPriceRange((prev) => ({ ...prev, min: text }))}
            />
            <Text style={styles.priceDash}> - </Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Max"
              keyboardType="numeric"
              value={priceRange.max}
              onChangeText={(text) => setPriceRange((prev) => ({ ...prev, max: text }))}
            />
          </View>
        </View>
      );
    }

    return Object.keys(filters[selectedCategory]).map((option) => (
      <View key={option} style={styles.optionRow}>
        <CustomCheckbox
          value={filters[selectedCategory][option]}
          onValueChange={() => handleFilterChange(selectedCategory, option)}
        />
        <Text
          style={[
            styles.optionText,
            filters[selectedCategory][option] && styles.selectedOptionText,
          ]}
        >
          {option}
        </Text>
      </View>
    ));
  };

  const renderFilterModal = () => {
    if (filterLoading) {
      return (
        <View style={styles.filterModalContainer}>
          <ActivityIndicator size="large" color="#F36F25" />
        </View>
      );
    }

    if (filterError) {
      return (
        <View style={styles.filterModalContainer}>
          <Text style={styles.errorText}>{filterError}</Text>
          <TouchableOpacity onPress={closeFilterModal} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.filterModalContainer}>
        <View style={styles.filterContent}>
          <View style={styles.filterHeader}>
            <TouchableOpacity onPress={closeFilterModal} style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.filterHeaderTitle}>FILTER</Text>
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterBody}>
            <ScrollView style={styles.leftColumn}>
              {filtersData.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat.key && styles.activeCategory,
                  ]}
                  onPress={() => setSelectedCategory(cat.key)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === cat.key && styles.activeCategoryText,
                    ]}
                  >
                    {cat.key} ({cat.key === 'Price range' ? 'Custom' : cat.values.length})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView style={styles.rightColumn}>{renderFilterOptions()}</ScrollView>
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => applyFilters()}
            disabled={filterLoading}
          >
            <Text style={styles.applyButtonText}>{filterLoading ? 'Applying...' : 'APPLY'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Sort modal logic
  const renderSortModal = () => (
    <View style={styles.sortModalContainer}>
      <ScrollView style={styles.sortContent}>
        <Text style={styles.sortTitle}>SORT BY</Text>

        <TouchableOpacity style={styles.sortCloseButton} onPress={closeSortModal}>
          <Text style={styles.sortCloseText}>×</Text>
        </TouchableOpacity>

        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.sortOptionRow}
            onPress={() => setCurrentSort(option.value)}
          >
            <Text
              style={[
                styles.sortOptionText,
                currentSort === option.value && styles.sortSelectedOption,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.sortClearButton} onPress={() => setCurrentSort(null)}>
          <Text style={styles.sortClearButtonText}>CLEAR ALL</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sortApplyButton} onPress={() => handleApplySort(currentSort)}>
          <Text style={styles.sortApplyButtonText}>APPLY</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Main content
  const renderContent = () => {
    if (searchQuery) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setPage(1);
                setProducts([]);
              }}
            >
              <Image
                source={require('../../assets/Images/Back1.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>

            <View style={styles.searchBox}>
              <Image
                source={require('../../assets/Images/SearchIcon.png')}
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Search your style"
                placeholderTextColor="#999999"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setPage(1);
                  setProducts([]);
                }}
                autoFocus={true}
              />
            </View>
          </View>

          <View style={styles.resultsContainer}>
            {loading && page === 1 ? (
              <ActivityIndicator size="large" color="#9B5AF5" style={{ marginTop: 20 }} />
            ) : products.length === 0 ? (
              <Text style={styles.noItemsText}>No items found</Text>
            ) : (
              <FlatList
                key={listKey}
                data={products}
                keyExtractor={(item) => item.itemId}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                renderItem={renderSubCategoryItem}
                contentContainerStyle={styles.grid}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() =>
                  loading && page > 1 ? (
                    <ActivityIndicator size="small" color="#9B5AF5" style={{ marginVertical: 10 }} />
                  ) : page === totalPages && products.length > 0 ? (
                    <Text style={styles.noMoreText}>No more items to load</Text>
                  ) : null
                }
              />
            )}
          </View>

          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={openFilterModal}
              accessibilityLabel={`Filter products${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
            >
              <Image source={require('../../assets/Images/Filter.png')} style={styles.icon} />
              <Text style={styles.iconText}>
                FILTER{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortBtn}
              onPress={openSortModal}
              accessibilityLabel="Sort products"
            >
              <Image source={require('../../assets/Images/Sort.png')} style={styles.icon} />
              <Text style={styles.iconText}>SORT</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../assets/Images/Back1.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>

          <View style={styles.searchBox}>
            <Image
              source={require('../../assets/Images/SearchIcon.png')}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search your style"
              placeholderTextColor="#999999"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setPage(1);
                setProducts([]);
              }}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Searches</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentSearchesContainer}
        >
          {recentSearches.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentItem}
              onPress={() => {
                setSearchQuery(item.label);
                setPage(1);
                setProducts([]);
              }}
            >
              <Image source={item.image} style={styles.recentImage} />
              <Text style={styles.recentLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Popular Categories</Text>
        <GenderTabs />

        {wishlistLoading ? (
          <Text style={styles.loadingText}>Loading wishlist...</Text>
        ) : wishlistError || !wishlistItem ? (
          <Text style={styles.errorText}>{wishlistError || 'No wishlist items available'}</Text>
        ) : (
          <SuggestionCard
            title="Searching from wishlist?"
            productImage={{ uri: wishlistItem.url }}
            productName={wishlistItem.itemId.name}
            productDesc={wishlistItem.itemId.description}
            price={wishlistItem.itemId.discountedPrice}
            oldPrice={wishlistItem.itemId.MRP}
            discount={Math.round(
              ((wishlistItem.itemId.MRP - wishlistItem.itemId.discountedPrice) /
                wishlistItem.itemId.MRP) *
                100
            )}
            rating={4.5}
            reviews="79 Ratings & 55"
            sizes={['XS', 'S', 'M', 'L', 'XL']}
            colors={[wishlistItem.color.toLowerCase()]}
            buttonLabel="VIEW WISHLIST"
            onButtonPress={() => navigation.navigate('Wishlist')}
          />
        )}

        {cartLoading ? (
          <Text style={styles.loadingText}>Loading cart...</Text>
        ) : cartError || !cartItem ? (
          <Text style={styles.errorText}>{cartError || 'No cart items available'}</Text>
        ) : (
          <SuggestionCard
            title="Missing anything from bag?"
            productImage={{ uri: cartItem.itemId.image }}
            productName={cartItem.itemId.name}
            productDesc={cartItem.itemId.description}
            price={cartItem.itemId.discountedPrice}
            oldPrice={cartItem.itemId.MRP}
            discount={Math.round(
              ((cartItem.itemId.MRP - cartItem.itemId.discountedPrice) / cartItem.itemId.MRP) * 100
            )}
            rating={4.5}
            reviews="121 Ratings & 59"
            sizes={[cartItem.size]}
            colors={[cartItem.color.toLowerCase()]}
            buttonLabel="VIEW CART"
            onButtonPress={() => navigation.navigate('Cart')}
          />
        )}
      </SafeAreaView>
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      <Modal
        animationType="slide"
        transparent
        visible={isFilterModalVisible}
        onRequestClose={closeFilterModal}
      >
        {renderFilterModal()}
      </Modal>
      <Modal
        animationType="slide"
        transparent
        visible={isSortModalVisible}
        onRequestClose={closeSortModal}
      >
        {renderSortModal()}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resultsContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backIcon: {
    marginTop: 30,
    width: 24,
    height: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  recentSearchesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  recentItem: {
    marginRight: 16,
    alignItems: 'center',
    width: 90,
  },
  recentImage: {
    width: 90,
    height: 90,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },
  recentLabel: {
    fontSize: 12,
    color: '#333333',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '400',
  },
  searchBox: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#CCCCCC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 0,
    marginRight: 12,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#999999',
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    paddingVertical: 8,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
  grid: {
    padding: 10,
    paddingBottom: 100,
  },
  noItemsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  filterBtn: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '45%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sortBtn: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '45%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 6,
    resizeMode: 'contain',
  },
  iconText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noMoreText: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
    color: '#666',
  },
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
    aspectRatio: 3 / 4,
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
  filterModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContent: {
    flex: 1,
    width: '100%',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  backText: {
    fontSize: 24,
    color: '#000',
  },
  filterHeaderTitle: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  clearText: {
    fontSize: 14,
    color: '#F36F25',
    fontWeight: '400',
  },
  filterBody: {
    flexDirection: 'row',
    flex: 1,
  },
  leftColumn: {
    width: '50%',
    backgroundColor: '#F5F5F5',
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
  },
  rightColumn: {
    width: '50%',
    backgroundColor: '#fff',
  },
  categoryButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },
  activeCategory: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#F36F25',
  },
  activeCategoryText: {
    color: '#F36F25',
    fontWeight: '500',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },
  selectedOptionText: {
    color: '#F36F25',
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#F36F25',
    margin: 16,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  checkboxBase: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#F36F25',
    borderColor: '#F36F25',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#F36F25',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  priceRangeContainer: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 8,
    width: 80,
    textAlign: 'center',
  },
  priceDash: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  sortModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sortContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    maxHeight: '55%',
  },
  sortTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sortCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  sortCloseText: {
    fontSize: 24,
    color: '#000',
  },
  sortOptionRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sortOptionText: {
    fontSize: 16,
  },
  sortSelectedOption: {
    color: '#D86427',
    fontWeight: 'bold',
  },
  sortApplyButton: {
    backgroundColor: '#D86427',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  sortApplyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sortClearButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D86427',
  },
  sortClearButtonText: {
    color: '#D86427',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchCategory;