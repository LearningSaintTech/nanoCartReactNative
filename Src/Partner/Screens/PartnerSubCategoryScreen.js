import React, { useEffect, useState, useCallback } from 'react';
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
import PartnerHeader from '../Components/PartnerHeader';
import FilterComponent from '../../UserFlow/Component/FilterComponent';
import SortComponent from '../../UserFlow/Component/SortComponent';
import PartnerSubCategoryItem from '../Components/PartnerSubCategoryItem';
import { BASE_URL } from '../../config/apiConfig';

const PartnerSubCategoryScreen = ({ navigation, route }) => {
  const { subCategory, subCategoryId } = route.params;
  const subcategoryId = subCategory?._id || subCategoryId;

  const [products, setProducts] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [sortBy, setSortBy] = useState('popularity'); // Default sort option
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const limit = 5;

  useEffect(() => {
    if (route?.params?.likedItemId) {
      console.log('✅ Like this item after login:', route.params.likedItemId);
    }
  }, [route?.params?.likedItemId]);

  useEffect(() => {
    fetchProducts(appliedFilters, sortBy, page);
  }, [subcategoryId, appliedFilters, sortBy, page]);

  useEffect(() => {
    // Calculate active filter count for UI feedback
    const count = Object.values(appliedFilters)
      .flatMap((obj) => Object.values(obj))
      .filter((v) => v).length;
    setActiveFilterCount(count);
  }, [appliedFilters]);

  const fetchProducts = useCallback(
    async (filters = {}, sortOption = 'popularity', pageNum = 1) => {
      if (!subcategoryId) {
        console.error('No subcategory ID found.');
        setLoading(false);
        return;
      }

      setLoading(true);
      const queryParams = [
        `subCategoryId=${encodeURIComponent(subcategoryId)}`,
        `page=${pageNum}`,
        `limit=${limit}`,
        `sortBy=${encodeURIComponent(sortOption)}`,
      ];

      // Add filter parameters if any
      Object.keys(filters).forEach((key) => {
        const selectedValues = Object.entries(filters[key])
          .filter(([_, isSelected]) => isSelected)
          .map(([val]) => val);
        if (selectedValues.length > 0) {
          queryParams.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(selectedValues.join(','))}`
          );
        }
      });

      const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
      const apiUrl = `${BASE_URL}/items/filter${queryString}`;

      console.log('🌐 Fetching Products with sortBy:', sortOption, 'URL:', apiUrl);

      try {
        const response = await fetch(apiUrl);
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
            filters: item.filters || [],
          }));
          setProducts(pageNum === 1 ? formattedItems : [...products, ...formattedItems]);
          setTotalPages(json.data?.totalPages || 1);
          if (formattedItems.length === 0 && pageNum === 1) {
            Alert.alert('No Results', 'No items found for the selected filters');
          }
        } else {
          console.error('Failed to load items:', json?.message);
          Alert.alert('Error', json?.message || 'Failed to load items');
        }
      } catch (error) {
        console.error('API Error:', error);
        Alert.alert('Error', 'Failed to fetch items');
      } finally {
        setLoading(false);
      }
    },
    [subcategoryId, products]
  );

  const handleApplyFilters = (filteredItems, filters, pagination) => {
    setProducts(filteredItems);
    setAppliedFilters(filters);
    setPage(1);
    setTotalPages(pagination?.totalPages || 1);
  };

  const handleApplySort = (sortOption) => {
    setSortBy(sortOption);
    setPage(1); // Reset to first page when sort changes
    setSortModalVisible(false); // Close modal after applying sort
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

  const renderFooter = () => {
    if (loading && page > 1) {
      return <ActivityIndicator size="small" color="#9B5AF5" style={{ marginVertical: 10 }} />;
    }
    if (page === totalPages && products.length > 0) {
      return <Text style={styles.noMoreText}>No more items to load</Text>;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <PartnerHeader />
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#9B5AF5" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.itemId}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PartnerSubCategoryItem item={item} navigation={navigation} />
          )}
          contentContainerStyle={styles.grid}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={openFilterModal}
          accessibilityLabel={`Filter products${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
        >
          <Image
            source={require('../../assets/Images/Filter.png')}
            style={styles.icon}
          />
          <Text style={styles.iconText}>
            FILTER{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={openSortModal}
          accessibilityLabel="Sort products"
        >
          <Image
            source={require('../../assets/Images/Sort.png')}
            style={styles.icon}
          />
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
          sortBy={sortBy} // Pass sortBy to FilterComponent
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
          selectedSort={sortBy} // Pass current sortBy to SortComponent
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  grid: {
    padding: 10,
  },
  footerButtons: {
    flexDirection: 'row',
    paddingBottom: 10,
    paddingLeft: 30,
    gap: 15,
  },
  filterBtn: {
    backgroundColor: '#fff',
    padding: 10,
    borderWidth: 1,
    borderColor: '#D2691E',
    width: '45%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sortBtn: {
    backgroundColor: '#fff',
    padding: 10,
    borderWidth: 1,
    borderColor: '#D2691E',
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
});

export default PartnerSubCategoryScreen;