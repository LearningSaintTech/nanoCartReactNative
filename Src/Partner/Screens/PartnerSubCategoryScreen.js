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
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import Header from '../../Partner/Components/PartnerHeader';
import SubCategoryItem from '../../Partner/Components/PartnerSubCategoryItem';
import FilterComponent from '../../../Src/UserFlow/Component/FilterComponent';
import SortComponent from '../../../Src/UserFlow/Component/FilterComponent';
import { BASE_URL } from '../../config/apiConfig';

const PartnerSubCategoryScreen = ({ navigation, route }) => {
  const { subCategory, subCategoryId } = route.params;
  const subcategoryId = subCategory?._id || subCategoryId;
  const token = useSelector(state => state.auth.token);
  const [products, setProducts] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [sortBy, setSortBy] = useState('latestAddition');
  const [appliedFilters, setAppliedFilters] = useState({});
  const [listKey, setListKey] = useState(Date.now().toString());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const limit = 5;
  // Update active filter count
  useEffect(() => {
    let count = Object.values(appliedFilters)
      .flatMap(obj => Object.values(obj))
      .filter(v => v).length;
    if (priceRange.min && priceRange.max) count += 1;
    setActiveFilterCount(count);
    console.log('📊 Active filter count:', count);
  }, [appliedFilters, priceRange]);

  // Fetch products using the /items/filtering API
  useEffect(() => {
    const fetchItems = async () => {
      if (!subcategoryId) return;

      setLoading(true);
      const filterArray = [];
      Object.keys(appliedFilters).forEach(key => {
        if (key === 'Price range' && priceRange.min && priceRange.max) {
          filterArray.push({
            key: 'Price range',
            value: `₹${priceRange.min} - ₹${priceRange.max}`,
          });
        } else {
          Object.entries(appliedFilters[key])
            .filter(([_, isSelected]) => isSelected)
            .forEach(([val]) => {
              filterArray.push({ key, value: val });
            });
        }
      });

      const requestBody = {
        subCategoryId: subcategoryId,
        filters: filterArray,
        name: '',
        keyword: '',
        sortBy,
        page,
        limit,
      };

      const apiUrl = `${BASE_URL}/items/filtering`;

      try {
        console.log('📥 Fetching products from:', apiUrl, 'Body:', JSON.stringify(requestBody, null, 2));
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Filtering server response:', errorText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const json = await response.json();
        console.log('🌐 Filtering response:', JSON.stringify(json, null, 2));

        if (json?.success) {
          const formattedItems = (json.data?.items || []).map(item => ({
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
          setProducts(page === 1 ? formattedItems : [...products, ...formattedItems]);
          setTotalPages(json.data?.totalPages || 1);
          setListKey(Date.now().toString());
          if (formattedItems.length === 0 && page === 1) {
            setProducts([]);
          }
          console.log('✅ Products set:', formattedItems.length);
        } else {
          throw new Error(json?.message || 'Failed to load products');
        }
      } catch (error) {
        const errorMessage = error.message.includes('401')
          ? 'Login required to see details'
          : 'Failed to fetch products. Please try again.';
        console.error('❌ Fetch products error:', errorMessage);
        setProducts([]);
        setListKey(Date.now().toString());
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [subcategoryId, sortBy, appliedFilters, page, token]);

  const handleApplyFilters = (filteredItems, filters, pagination, newPriceRange) => {
    setProducts(filteredItems);
    setAppliedFilters(filters);
    setPriceRange(newPriceRange);
    setPage(1);
    setTotalPages(pagination?.totalPages || 1);
    setListKey(Date.now().toString());
    setFilterModalVisible(false);
    console.log('✅ Filters applied:', JSON.stringify(filters, null, 2));
  };

  const handleApplySort = sortOption => {
    setSortBy(sortOption || 'latestAddition');
    setPage(1);
    setListKey(Date.now().toString());
    setSortModalVisible(false);
    console.log('🗂️ Sort applied:', sortOption || 'latestAddition');
  };

  const openFilterModal = () => {
    if (!token) {
      navigation.navigate('Login', {
        fromScreen: 'SubCategoryScreen',
        actionAfterLogin: 'view_filters',
        subCategoryId,
      });
      console.log('⚠️ No token, redirecting to login for filters');
      return;
    }
    setFilterModalVisible(true);
    console.log('ℹ️ Opening filter modal');
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
    console.log('ℹ️ Closing filter modal');
  };

  const openSortModal = () => {
    setSortModalVisible(true);
    console.log('ℹ️ Opening sort modal');
  };

  const closeSortModal = () => {
    setSortModalVisible(false);
    console.log('ℹ️ Closing sort modal');
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      setPage(prev => prev + 1);
      console.log('📄 Loading more, page:', page + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      {(loading || filterLoading) ? (
        <ActivityIndicator size="large" color="#9B5AF5" style={{ marginTop: 20 }} />
      ) : products.length === 0 ? (
        <Text style={styles.noItemsText}>No items found</Text>
      ) : (
        <FlatList
          key={listKey}
          data={products}
          keyExtractor={item => item.itemId}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SubCategoryItem item={item} itemId={item.itemId} navigation={navigation} />
          )}
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

      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={[styles.filterBtn, !token && styles.disabledBtn]}
          onPress={openFilterModal}
          disabled={!token}
          accessibilityLabel={`Filter products${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
        >
          <Image
            source={require('../../assets/Images/Filter.png')}
            style={[styles.icon, !token && styles.disabledIcon]}
          />
          <Text style={[styles.iconText, !token && styles.disabledText]}>
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

      <Modal
        animationType="slide"
        transparent
        visible={isFilterModalVisible}
        onRequestClose={closeFilterModal}
      >
        <FilterComponent
          onClose={closeFilterModal}
          onApplyFilters={handleApplyFilters}
          subCategoryId={subcategoryId}
          initialFilters={appliedFilters}
          sortBy={sortBy}
          initialPriceRange={priceRange}
        />
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={isSortModalVisible}
        onRequestClose={closeSortModal}
      >
        <SortComponent
          onClose={closeSortModal}
          onApplySort={handleApplySort}
          selectedSort={sortBy}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
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
  noMoreText: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
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
  disabledBtn: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 6,
    resizeMode: 'contain',
  },
  disabledIcon: {
    opacity: 0.5,
  },
  iconText: {
    fontSize: 14,
    fontWeight: '500',
  },
  disabledText: {
    color: '#999',
  },
});

export default PartnerSubCategoryScreen;