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
  StatusBar,
} from 'react-native';
import PartnerHeader from '../Components/PartnerHeader';
import FilterComponent from '../../UserFlow/Component/FilterComponent';
import SortComponent from '../../UserFlow/Component/SortComponent';
import PartnerSubCategoryItem from '../Components/PartnerSubCategoryItem';
import { BASE_URL } from '../../config/apiConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      .flatMap(obj => Object.values(obj))
      .filter(v => v).length;
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

      const formattedFilters = Object.entries(filters).flatMap(
        ([key, values]) =>
          Object.entries(values)
            .filter(([_, isSelected]) => isSelected)
            .map(([val]) => ({ key, value: val })),
      );

      const requestBody = {
        subCategoryId: subcategoryId,
        sortBy: sortOption,
        page: pageNum,
        limit: limit,
      };

      if (formattedFilters.length > 0) {
        requestBody.filters = formattedFilters;
      }

      try {
        const response = await fetch(`${BASE_URL}/items/filtering`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const json = await response.json();
        console.log('✅ Parsed JSON Response:', json);

        if (json?.success) {
          const formattedItems = (json.data || []).map((item) => ({
            itemId: item._id,
            name: item.name || 'Unnamed Item',
            description: item.description || 'No description available',
            mrp: item.MRP || 0,
            price: item.discountedPrice || 0,
            discount: item.discountPercentage || 0,
            image: { uri: item.image || (item.itemImageId ? `https://yoraaecommerce.s3.ap-south-1.amazonaws.com/Nanocart/categories/${item.categoryId._id}/subCategories/${item.subCategoryId._id}/item/${item._id}/${item.itemImageId}.jpg` : '') },
            defaultColor: item.defaultColor || '',
            filters: item.filters || [],
          }));
          setProducts(pageNum === 1 ? formattedItems : [...products, ...formattedItems]);
          setTotalPages(Math.ceil(json.count / limit) || 1);
          if (formattedItems.length === 0 && pageNum === 1) {
            Alert.alert('No Results', 'No data found');
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
    [subcategoryId, products],
  );

  const handleApplyFilters = (filteredItems, filters, pagination) => {
    setProducts(filteredItems);
    setAppliedFilters(filters);
    setPage(1);
    setTotalPages(pagination?.totalPages || 1);
  };

  const handleApplySort = sortOption => {
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
      setPage(prev => prev + 1);
    }
  };

  const renderFooter = () => {
    if (loading && page > 1) {
      return (
        <ActivityIndicator
          size="small"
          color="#9B5AF5"
          style={{ marginVertical: 10 }}
        />
      );
    }
    if (page === totalPages && products.length > 0) {
      return <Text style={styles.noMoreText}>No more items to load</Text>;
    }
    return null;
  };

  const renderItem = ({ item }) => (
    <PartnerSubCategoryItem item={item} navigation={navigation} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <PartnerHeader />
      {loading && page === 1 ? (
        <ActivityIndicator
          size="large"
          color="#9B5AF5"
          style={{ marginTop: 20 }}
        />
      ) : products.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data found</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.itemId}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
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
          accessibilityLabel={`Filter products${
            activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''
          }`}>
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
          accessibilityLabel="Sort products">
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
        onRequestClose={closeFilterModal}>
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
        onRequestClose={closeSortModal}>
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
  },
  footerButtons: {
    flexDirection: 'row',
    paddingBottom: 10,
    paddingLeft: 30,
    gap: 15,
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
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
});

export default PartnerSubCategoryScreen;
