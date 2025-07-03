import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import PartnerCategoryGrid from './PartnerCategoryGrid';

const { width } = Dimensions.get('window');
const TAB_WIDTH = (width - 32) / 2; // 32 is total horizontal padding (16 * 2)

const PartnerGenderTabs = () => {
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Fetch categories on mount
  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/category`)
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
    navigation.navigate('PartnerSubCategory', { subCategory: item });
  };

  return (
    <View style={styles.container}>
      {/* Scrollable Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category._id}
            onPress={() => handleTabPress(category._id)}
            style={[
              styles.tab,
              { width: TAB_WIDTH }
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === category._id && styles.activeTabText,
              ]}
            >
              For {category.name}
            </Text>
            {activeTab === category._id && (
              <View style={[styles.underline, styles.activeUnderline]} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Subcategory Grid */}
      {loading ? (
        <ActivityIndicator size="large" color="#F36F25" style={styles.loader} />
      ) : subCategories.length === 0 ? (
        <Text style={styles.noDataText}>No subcategories available</Text>
      ) : (
        <PartnerCategoryGrid data={subCategories} onItemPress={handleItemPress} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  tab: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#F36F25',
    fontWeight: '600',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  activeUnderline: {
    backgroundColor: '#F36F25',
  },
  loader: {
    marginTop: 20,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999999',
    fontSize: 16,
  },
});

export default PartnerGenderTabs;