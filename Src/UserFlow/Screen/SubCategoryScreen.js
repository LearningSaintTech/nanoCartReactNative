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
} from 'react-native';
import Header from '../Component/Header';
import SubCategoryItem from '../Component/SubCategoryItem';
import FilterComponent from '../Component/FilterComponent';
import SortComponent from '../Component/SortComponent';
import { BASE_URL } from '../../config/apiConfig';

const SubCategoryScreen = ({ navigation, route }) => {
  const { subCategory, subCategoryId } = route.params;
  const subcategoryId = subCategory?._id || subCategoryId;

  const [products, setProducts] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [listKey, setListKey] = useState(Date.now().toString());

  const fetchItems = () => {
    if (isFiltered) return; // 🔒 Prevent override after filtering

    setLoading(true);
    let url = sortBy
      ? `${BASE_URL}/items/sort?sortBy=${sortBy}`
      : `${BASE_URL}/items/subcategory/${subcategoryId}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.items) {
          const formatted = json.data.items.map((item) => ({
            name: item.name,
            description: item.description,
            mrp: item.MRP,
            price: item.discountedPrice,
            discount: item.discountPercentage,
            image: { uri: item.image },
            itemId: item._id,
          }));
          setProducts(formatted);
          setListKey(Date.now().toString());
        } else {
          setProducts([]);
          setListKey(Date.now().toString());
        }
      })
      .catch((error) => {
        console.error('API Error:', error);
        setProducts([]);
        setListKey(Date.now().toString());
      })
      .finally(() => setLoading(false));
  };

  // ⛔ Remove `isFiltered` from useEffect deps
  useEffect(() => {
    if (!subcategoryId && !sortBy) return;
    fetchItems();
  }, [subcategoryId, sortBy]);

  const openFilterModal = () => {
    setProducts([]); // Optional: clear list before filter
    setFilterModalVisible(true);
  };

  const closeFilterModal = (filteredData) => {
    setFilterModalVisible(false);
    setFilterLoading(true);
    if (filteredData && Array.isArray(filteredData)) {
      setProducts(filteredData);
      setIsFiltered(true); // ✅ This prevents fetchItems from running again
      setListKey(Date.now().toString());
    } else {
      setProducts([]);
      setIsFiltered(true);
      setListKey(Date.now().toString());
    }
    setFilterLoading(false);
  };

  const openSortModal = () => setSortModalVisible(true);
  const closeSortModal = () => setSortModalVisible(false);

  return (
    <View style={styles.container}>
      <Header />
      {(loading || filterLoading) ? (
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
          renderItem={({ item }) => (
            <SubCategoryItem item={item} itemId={item.itemId} navigation={navigation} />
          )}
          contentContainerStyle={styles.grid}
        />
      )}

      <View style={styles.footerButtons}>
        <TouchableOpacity style={styles.filterBtn} onPress={openFilterModal}>
          <Image source={require('../../assets/Images/Filter.png')} style={styles.icon} />
          <Text style={styles.iconText}>FILTER</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortBtn} onPress={openSortModal}>
          <Image source={require('../../assets/Images/Sort.png')} style={styles.icon} />
          <Text style={styles.iconText}>SORT</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent visible={isFilterModalVisible} onRequestClose={() => closeFilterModal([])}>
        <FilterComponent onClose={closeFilterModal} subcategoryId={subcategoryId} />
      </Modal>

      <Modal animationType="slide" transparent visible={isSortModalVisible} onRequestClose={closeSortModal}>
        <SortComponent onClose={closeSortModal} onApplySort={setSortBy} />
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
    paddingBottom: 10,
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
});

export default SubCategoryScreen;

