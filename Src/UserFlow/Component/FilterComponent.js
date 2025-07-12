import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../../config/apiConfig';

const CustomCheckbox = ({ value, onValueChange }) => (
  <TouchableOpacity
    onPress={onValueChange}
    style={[styles.checkboxBase, value && styles.checkboxChecked]}
  >
    {value && <Text style={styles.checkmark}>✓</Text>}
  </TouchableOpacity>
);

const FilterComponent = ({ onClose, onApplyFilters, subCategoryId, initialFilters, sortBy }) => {
  const navigation = useNavigation();
  const token = useSelector(state => state.auth.token);
  const [filtersData, setFiltersData] = useState([]);
  const [filters, setFilters] = useState(initialFilters || {});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getTimestamp = () => new Date().toISOString();

  useEffect(() => {
    const fetchFilters = async () => {
      console.log(`[${getTimestamp()}] 📥 [FilterComponent] Starting fetchFilters for subCategoryId: ${subCategoryId}`);
      console.log(`[${getTimestamp()}] 🔑 [FilterComponent] Token: ${token ? 'Present' : 'Missing'}`);

      if (!token) {
        const errorMsg = 'Login required to see details';
        setError(errorMsg);
        setLoading(false);
        console.error(`[${getTimestamp()}] ❌ [FilterComponent] No token, prompting login`);
        Alert.alert(
          'Login Required',
          'Please log in to access filters.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log(`[${getTimestamp()}] ➡️ [FilterComponent] Navigating to Login from FilterComponent`);
                navigation.navigate('Login', {
                  fromScreen: 'FilterComponent',
                  subCategoryId,
                });
              },
            },
          ],
          { cancelable: false }
        );
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const apiUrl = 'http://192.168.1.89:4000/api/filter';
        console.log(`[${getTimestamp()}] 🌐 [FilterComponent] Fetching filters from: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(`[${getTimestamp()}] 📥 [FilterComponent] Response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[${getTimestamp()}] ❌ [FilterComponent] Server error: ${errorText}`);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const json = await response.json();
        console.log(`[${getTimestamp()}] 📊 [FilterComponent] Response data: ${JSON.stringify(json, null, 2)}`);

        if (json?.success && Array.isArray(json.data)) {
          const mappedFilters = {};
          json.data.forEach(filter => {
            if (filter.key && Array.isArray(filter.values)) {
              mappedFilters[filter.key] = {};
              filter.values.forEach(val => {
                mappedFilters[filter.key][val] = initialFilters?.[filter.key]?.[val] || false;
              });
            }
          });
          setFiltersData(json.data);
          setFilters(prev => ({ ...mappedFilters, ...prev }));
          setSelectedCategory(json.data[0]?.key || null);
          console.log(`[${getTimestamp()}] ✅ [FilterComponent] Filters set: ${JSON.stringify(mappedFilters, null, 2)}`);
          console.log(`[${getTimestamp()}] 🗂️ [FilterComponent] Selected category: ${json.data[0]?.key || null}`);
        } else {
          throw new Error(json?.message || 'No filters available');
        }
      } catch (error) {
        const errorMessage = error.message.includes('401')
          ? 'Session expired. Please log in again.'
          : 'Error fetching filters. Please try again.';
        setError(errorMessage);
        console.error(`[${getTimestamp()}] ❌ [FilterComponent] Fetch error: ${errorMessage}`);
        console.error(`[${getTimestamp()}] 📜 [FilterComponent] Error stack: ${error.stack}`);
        Alert.alert(
          'Error',
          errorMessage,
          [
            {
              text: 'OK',
              onPress: () => {
                if (errorMessage.includes('401')) {
                  console.log(`[${getTimestamp()}] ➡️ [FilterComponent] Navigating to Login due to 401 error`);
                  navigation.navigate('Login', {
                    fromScreen: 'FilterComponent',
                    subCategoryId,
                  });
                }
              },
            },
          ],
          { cancelable: false }
        );
      } finally {
        setLoading(false);
        console.log(`[${getTimestamp()}] 🏁 [FilterComponent] Fetch filters completed, loading: ${false}`);
      }
    };

    console.log(`[${getTimestamp()}] 🚀 [FilterComponent] useEffect triggered for fetching filters`);
    fetchFilters();
  }, [token, navigation, subCategoryId, initialFilters]);

  const handleFilterChange = (category, option) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [option]: !prev[category][option],
      },
    }));
    console.log(`[${getTimestamp()}] 🔍 [FilterComponent] Filter changed - Category: ${category}, Option: ${option}, New state: ${!filters[category]?.[option]}`);
  };

  const clearAll = () => {
    const cleared = {};
    filtersData.forEach(filter => {
      cleared[filter.key] = {};
      filter.values.forEach(val => {
        cleared[filter.key][val] = false;
      });
    });
    setFilters(cleared);
    console.log(`[${getTimestamp()}] 🗑️ [FilterComponent] Cleared all filters: ${JSON.stringify(cleared, null, 2)}`);
    onApplyFilters([], cleared, { currentPage: 1, totalPages: 1, totalItems: 0 });
    onClose();
  };

  const applyFilters = async (filterState = filters) => {
    console.log(`[${getTimestamp()}] 🚀 [FilterComponent] Starting applyFilters`);

    if (!token) {
      console.error(`[${getTimestamp()}] ❌ [FilterComponent] No token, prompting login`);
      Alert.alert(
        'Login Required',
        'Please log in to apply filters.',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log(`[${getTimestamp()}] ➡️ [FilterComponent] Navigating to Login from applyFilters`);
              navigation.navigate('Login', {
                fromScreen: 'FilterComponent',
                subCategoryId,
              });
            },
          },
        ],
        { cancelable: false }
      );
      return;
    }

    const filterArray = [];
    let priceRange = { min: '', max: '' }; // Default empty priceRange
    Object.keys(filterState).forEach(key => {
      Object.entries(filterState[key])
        .filter(([_, isSelected]) => isSelected)
        .forEach(([val]) => {
          filterArray.push({ key, value: val });
          // Parse price range if selected
          if (key === 'Price range') {
            if (val.includes('Under')) {
              priceRange = { min: 0, max: 500 };
            } else if (val.includes('Over')) {
              priceRange = { min: 25000, max: '' };
            } else {
              const [min, max] = val.replace('₹', '').split(' - ').map(v => v.replace(',', '').trim());
              priceRange = { min: parseInt(min) || '', max: parseInt(max) || '' };
            }
          }
        });
    });

    const requestBody = {
      subCategoryId,
      filters: filterArray,
      name: '',
      keyword: '',
      sortBy,
      page: 1,
      limit: 5,
    };

    const apiUrl = `${BASE_URL}/items/filtering`;

    try {
      setLoading(true);
      console.log(`[${getTimestamp()}] 🌐 [FilterComponent] Applying filters to: ${apiUrl}`);
      console.log(`[${getTimestamp()}] 📤 [FilterComponent] Request body: ${JSON.stringify(requestBody, null, 2)}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`[${getTimestamp()}] 📥 [FilterComponent] Apply filters response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${getTimestamp()}] ❌ [FilterComponent] Apply filters server error: ${errorText}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[${getTimestamp()}] 📊 [FilterComponent] Apply filters response: ${JSON.stringify(data, null, 2)}`);

      if (data?.success) {
        const formattedItems = (data.data?.items || []).map(item => ({
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
        console.log(`[${getTimestamp()}] ✅ [FilterComponent] Formatted items: ${formattedItems.length} items`);
        onApplyFilters(formattedItems, filterState, {
          currentPage: data.data?.currentPage || 1,
          totalPages: data.data?.totalPages || 1,
          totalItems: data.data?.totalItems || 0,
        }, priceRange); // Include priceRange for compatibility
        if (formattedItems.length === 0) {
          console.warn(`[${getTimestamp()}] ⚠️ [FilterComponent] No items match the selected filters`);
          Alert.alert('No Results', 'No items match the selected filters');
        }
        onClose();
      } else {
        throw new Error(data?.message || 'Failed to apply filters');
      }
    } catch (error) {
      const errorMessage = error.message.includes('401')
        ? 'Session expired. Please log in again.'
        : 'Error applying filters. Please try again.';
      setError(errorMessage);
      console.error(`[${getTimestamp()}] ❌ [FilterComponent] Apply filters error: ${errorMessage}`);
      console.error(`[${getTimestamp()}] 📜 [FilterComponent] Error stack: ${error.stack}`);
      Alert.alert(
        'Error',
        errorMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              if (errorMessage.includes('401')) {
                console.log(`[${getTimestamp()}] ➡️ [FilterComponent] Navigating to Login due to 401 error in applyFilters`);
                navigation.navigate('Login', {
                  fromScreen: 'FilterComponent',
                  subCategoryId,
                });
              }
            },
          },
        ],
        { cancelable: false }
      );
    } finally {
      setLoading(false);
      console.log(`[${getTimestamp()}] 🏁 [FilterComponent] Apply filters completed, loading: ${false}`);
    }
  };

  const renderOptions = () => {
    if (!selectedCategory || !filters[selectedCategory]) {
      console.log(`[${getTimestamp()}] ℹ️ [FilterComponent] No selected category or filters for ${selectedCategory}`);
      return null;
    }

    console.log(`[${getTimestamp()}] 🖼️ [FilterComponent] Rendering options for category: ${selectedCategory}`);

    return Object.keys(filters[selectedCategory]).map(option => (
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

  if (loading) {
    console.log(`[${getTimestamp()}] ⏳ [FilterComponent] Rendering loading state`);
    return (
      <View style={styles.modalContainer}>
        <ActivityIndicator size="large" color="#F36F25" />
      </View>
    );
  }

  if (error) {
    console.log(`[${getTimestamp()}] ❌ [FilterComponent] Rendering error state: ${error}`);
    return (
      <View style={styles.modalContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>
            {error.includes('Login required') || error.includes('Session expired') ? 'Login' : 'Close'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  console.log(`[${getTimestamp()}] 🖼️ [FilterComponent] Rendering filter modal with ${filtersData.length} categories`);
  return (
    <View style={styles.modalContainer}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            console.log(`[${getTimestamp()}] 🔙 [FilterComponent] Back button pressed`);
            onClose();
          }} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FILTER</Text>
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearText}>Clear all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <ScrollView style={styles.leftColumn}>
            {filtersData.map(cat => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat.key && styles.activeCategory,
                ]}
                onPress={() => {
                  setSelectedCategory(cat.key);
                  console.log(`[${getTimestamp()}] 🗂️ [FilterComponent] Selected category: ${cat.key}`);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.key && styles.activeCategoryText,
                  ]}
                >
                  {cat.key} ({cat.values.length})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.rightColumn}>{renderOptions()}</ScrollView>
        </View>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => applyFilters()}
          disabled={loading}
        >
          <Text style={styles.applyButtonText}>{loading ? 'Applying...' : 'APPLY'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  header: {
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
  headerTitle: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  clearText: {
    fontSize: 14,
    color: '#F36F25',
    fontWeight: '400',
  },
  body: {
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
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 20,
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
});

export default FilterComponent;