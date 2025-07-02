import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import CategoryGrid from './CategoryGrid';
import { useNavigation } from '@react-navigation/native';

const GenderTabs = () => {
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Fetch categories on mount
  useEffect(() => {
    setLoading(true);
    fetch('http://192.168.1.17:4000/api/category')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);

          // Set the first category ("For Her") as the default active tab
          const firstCategoryId = json.data[0]?._id;
          if (firstCategoryId) {
            setActiveTab(firstCategoryId);
          } else {
            console.warn('No categories found in API response');
          }
        } else {
          console.warn('Failed to load categories:', json.message);
        }
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch subcategories when activeTab changes
  useEffect(() => {
    if (!activeTab) return;

    setLoading(true);
    setSubCategories([]); // Clear previous subcategories to avoid stale data
    fetch(`http://192.168.1.17:4000/api/subcategory/categories/${activeTab}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.subCategories) {
          setSubCategories(json.data.subCategories);
        } else {
          console.warn('Failed to load subcategories:', json.message);
          setSubCategories([]); // Ensure subCategories is empty if fetch fails
        }
      })
      .catch((err) => {
        console.error('Error fetching subcategories:', err);
        setSubCategories([]); // Ensure subCategories is empty on error
      })
      .finally(() => setLoading(false));
  }, [activeTab]);

  const handleTabPress = (categoryId) => {
    if (categoryId !== activeTab) {
      setActiveTab(categoryId);
    }
  };

  const handleItemPress = (item) => {
    navigation.navigate('SubCategory', { subCategory: item });
  };

  return (
    <View>
      {/* Tabs */}
      <View style={styles.tabWrapper}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
          renderItem={({ item: category }) => (
            <TouchableOpacity
              onPress={() => handleTabPress(category._id)}
              style={styles.tab}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === category._id && styles.activeTabText,
                ]}
              >
                For {category.name}
              </Text>
              {activeTab === category._id && <View style={styles.underline} />}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Subcategory Grid */}
      {loading ? (
        <ActivityIndicator size="large" color="#8B4513" style={styles.loader} />
      ) : subCategories.length === 0 ? (
        <Text style={styles.noDataText}>No subcategories available</Text>
      ) : (
        <CategoryGrid data={subCategories} onItemPress={handleItemPress} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabContainer: {
    paddingHorizontal: 16,
marginBottom:12,
  },
  tab: {
    width: Dimensions.get('window').width / 2 - 16,
    paddingVertical: 12,
    position: 'relative',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '400',
  },
  activeTabText: {
    color: '#8B4513',
    fontWeight: '500',
  },
  underline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#8B4513',
  },
  loader: {
    marginTop: 20,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 14,
  },
});

export default GenderTabs;