// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { BASE_URL } from '../../config/apiConfig';

// const CustomCheckbox = ({ value, onValueChange }) => (
//   <TouchableOpacity
//     onPress={onValueChange}
//     style={[styles.checkboxBase, value && styles.checkboxChecked]}
//   >
//     {value && <Text style={styles.checkmark}>✓</Text>}
//   </TouchableOpacity>
// );

// const FilterComponent = ({ onClose, onApplyFilters, subCategoryId, initialFilters, sortBy }) => {
//   const [filtersData, setFiltersData] = useState([]);
//   const [filters, setFilters] = useState(initialFilters || {});
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchFilters = async () => {
//       try {
//         const res = await fetch(`${BASE_URL}filter`);
//         const json = await res.json();
//         if (json?.success) {
//           const mappedFilters = {};
//           json.data.forEach((filter) => {
//             mappedFilters[filter.key] = {};
//             filter.values.forEach((val) => {
//               mappedFilters[filter.key][val] = initialFilters?.[filter.key]?.[val] || false;
//             });
//           });
//           setFiltersData(json.data);
//           setFilters((prev) => ({ ...mappedFilters, ...prev }));
//           setSelectedCategory(json.data[0]?.key);
//         } else {
//           setError(json?.message || 'Failed to load filters');
//           Alert.alert('Error', json?.message || 'Failed to load filters');
//         }
//       } catch (error) {
//         setError('Error fetching filters');
//         console.error('❌ Error fetching filters:', error);
//         Alert.alert('Error', 'Error fetching filters');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (Object.keys(filters).length === 0 || !initialFilters) {
//       fetchFilters();
//     } else {
//       setLoading(false);
//       setFiltersData(Object.keys(initialFilters).map((key) => ({
//         key,
//         values: Object.keys(initialFilters[key]),
//       })));
//       setSelectedCategory(Object.keys(initialFilters)[0] || null);
//     }
//   }, [initialFilters]);

//   const handleFilterChange = (category, option) => {
//     setFilters((prev) => ({
//       ...prev,
//       [category]: {
//         ...prev[category],
//         [option]: !prev[category][option],
//       },
//     }));
//   };

//   const clearAll = () => {
//     const cleared = {};
//     filtersData.forEach((filter) => {
//       cleared[filter.key] = {};
//       filter.values.forEach((val) => {
//         cleared[filter.key][val] = false;
//       });
//     });
//     setFilters(cleared);
//     onApplyFilters([], cleared, { currentPage: 1, totalPages: 1, totalItems: 0 });
//     onClose();
//   };

//   const applyFilters = async (filterState = filters) => {
//     const queryParams = [
//       `subCategoryId=${encodeURIComponent(subCategoryId)}`,
//       'page=1',
//       'limit=5',
//       `sortBy=${encodeURIComponent(sortBy)}`, // Include sortBy
//     ];

//     Object.keys(filterState).forEach((key) => {
//       const selectedValues = Object.entries(filterState[key])
//         .filter(([_, isSelected]) => isSelected)
//         .map(([val]) => val);

//       if (selectedValues.length > 0) {
//         queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(selectedValues.join(','))}`);
//       }
//     });

//     const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
//     const apiUrl = `${BASE_URL}/items/filter${queryString}`;

//     console.log('🌐 Fetching filtered items from:', apiUrl);

//     try {
//       setLoading(true);
//       const response = await fetch(apiUrl);
//       const data = await response.json();
//       console.log('data inside filter', data);

//       if (data?.success) {
//         const formattedItems = (data.data?.items || []).map((item) => ({
//           name: item.name || 'Unnamed Item',
//           description: item.description || '',
//           mrp: item.MRP || 0,
//           price: item.discountedPrice || 0,
//           discount: item.discountPercentage || 0,
//           image: { uri: item.image || '' },
//           itemId: item._id || '',
//           defaultColor: item.defaultColor || '',
//           filters: item.filters || [],
//         }));
//         onApplyFilters(formattedItems, filterState, {
//           currentPage: data.data?.currentPage || 1,
//           totalPages: data.data?.totalPages || 1,
//           totalItems: data.data?.totalItems || 0,
//         });
//         if (formattedItems.length === 0) {
//           Alert.alert('No Results', 'No items match the selected filters');
//         }
//         onClose();
//       } else {
//         setError(data?.message || 'Failed to apply filters');
//         Alert.alert('Error', data?.message || 'Failed to apply filters');
//         console.error('❌ Failed to apply filters:', data?.message);
//       }
//     } catch (error) {
//       setError('Error applying filters');
//       console.error('❌ Error applying filters:', error);
//       Alert.alert('Error', 'Error applying filters');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderOptions = () => {
//     if (!selectedCategory || !filters[selectedCategory]) return null;
//     return Object.keys(filters[selectedCategory]).map((option) => (
//       <View key={option} style={styles.optionRow}>
//         <CustomCheckbox
//           value={filters[selectedCategory][option]}
//           onValueChange={() => handleFilterChange(selectedCategory, option)}
//         />
//         <Text
//           style={[
//             styles.optionText,
//             filters[selectedCategory][option] && styles.selectedOptionText,
//           ]}
//         >
//           {option}
//         </Text>
//       </View>
//     ));
//   };

//   if (loading) {
//     return (
//       <View style={styles.modalContainer}>
//         <ActivityIndicator size="large" color="#F36F25" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.modalContainer}>
//         <Text style={styles.errorText}>{error}</Text>
//         <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//           <Text style={styles.closeButtonText}>Close</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.modalContainer}>
//       <View style={styles.content}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={onClose} style={styles.backButton}>
//             <Text style={styles.backText}>←</Text>
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>FILTER</Text>
//           <TouchableOpacity onPress={clearAll}>
//             <Text style={styles.clearText}>Clear all</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.body}>
//           <ScrollView style={styles.leftColumn}>
//             {filtersData.map((cat) => (
//               <TouchableOpacity
//                 key={cat.key}
//                 style={[
//                   styles.categoryButton,
//                   selectedCategory === cat.key && styles.activeCategory,
//                 ]}
//                 onPress={() => setSelectedCategory(cat.key)}
//               >
//                 <Text
//                   style={[
//                     styles.categoryText,
//                     selectedCategory === cat.key && styles.activeCategoryText,
//                   ]}
//                 >
//                   {cat.key} ({cat.values.length})
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>

//           <ScrollView style={styles.rightColumn}>{renderOptions()}</ScrollView>
//         </View>

//         <TouchableOpacity style={styles.applyButton} onPress={() => applyFilters()} disabled={loading}>
//           <Text style={styles.applyButtonText}>{loading ? 'Applying...' : 'APPLY'}</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   content: {
//     flex: 1,
//     width: '100%',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     justifyContent: 'space-between',
//     borderBottomWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   backButton: {
//     padding: 4,
//   },
//   backText: {
//     fontSize: 24,
//     color: '#000',
//   },
//   headerTitle: {
//     fontSize: 16,
//     color: '#000',
//     fontWeight: '500',
//   },
//   clearText: {
//     fontSize: 14,
//     color: '#F36F25',
//     fontWeight: '400',
//   },
//   body: {
//     flexDirection: 'row',
//     flex: 1,
//   },
//   leftColumn: {
//     width: '50%',
//     backgroundColor: '#F5F5F5',
//     borderRightWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   rightColumn: {
//     width: '50%',
//     backgroundColor: '#fff',
//   },
//   categoryButton: {
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   categoryText: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '400',
//   },
//   activeCategory: {
//     backgroundColor: '#fff',
//     borderLeftWidth: 4,
//     borderLeftColor: '#F36F25',
//   },
//   activeCategoryText: {
//     color: '#F36F25',
//     fontWeight: '500',
//   },
//   optionRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   optionText: {
//     marginLeft: 12,
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '400',
//   },
//   selectedOptionText: {
//     color: '#F36F25',
//     fontWeight: '500',
//   },
//   applyButton: {
//     backgroundColor: '#F36F25',
//     margin: 16,
//     paddingVertical: 14,
//     borderRadius: 4,
//     alignItems: 'center',
//   },
//   applyButtonText: {
//     color: '#fff',
//     fontWeight: '500',
//     fontSize: 16,
//   },
//   checkboxBase: {
//     width: 20,
//     height: 20,
//     borderRadius: 4,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   checkboxChecked: {
//     backgroundColor: '#F36F25',
//     borderColor: '#F36F25',
//   },
//   checkmark: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#FF0000',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   closeButton: {
//     backgroundColor: '#F36F25',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 4,
//   },
//   closeButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });

// export default FilterComponent;



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
import { useSelector, useDispatch } from 'react-redux';
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
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const [filtersData, setFiltersData] = useState([]);
  const [filters, setFilters] = useState(initialFilters || {});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!token) {
          Alert.alert(
            'Login Required',
            'Please log in to access filters.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Login', {
                  fromScreen: 'FilterComponent',
                  subCategoryId,
                }),
              },
            ],
            { cancelable: false }
          );
          return;
        }

        const res = await fetch(`${BASE_URL}/filter`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ Server response:', errorText);
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        // Check Content-Type to ensure it's JSON
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const errorText = await res.text();
          console.error('❌ Non-JSON response:', errorText);
          throw new Error('Server returned non-JSON response');
        }

        const json = await res.json();
        console.log('🌐 Filters response:', json);

        if (json?.success) {
          const mappedFilters = {};
          json.data.forEach((filter) => {
            mappedFilters[filter.key] = {};
            filter.values.forEach((val) => {
              mappedFilters[filter.key][val] = initialFilters?.[filter.key]?.[val] || false;
            });
          });
          setFiltersData(json.data);
          setFilters((prev) => ({ ...mappedFilters, ...prev }));
          setSelectedCategory(json.data[0]?.key);
        } else {
          throw new Error(json?.message || 'Failed to load filters');
        }
      } catch (error) {
        const errorMessage = error.message.includes('401')
          ? 'Session expired. Please log in again.'
          : error.message || 'Error fetching filters';
        setError(errorMessage);
        console.error('❌ Error fetching filters:', error);
        Alert.alert(
          'Error',
          errorMessage,
          [
            {
              text: 'OK',
              onPress: () => {
                if (errorMessage.includes('401')) {
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
      }
    };

    if (Object.keys(filters).length === 0 || !initialFilters) {
      fetchFilters();
    } else {
      setLoading(false);
      setFiltersData(Object.keys(initialFilters).map((key) => ({
        key,
        values: Object.keys(initialFilters[key]),
      })));
      setSelectedCategory(Object.keys(initialFilters)[0] || null);
    }
  }, [initialFilters, token, navigation, subCategoryId]);

  const handleFilterChange = (category, option) => {
    setFilters((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [option]: !prev[category][option],
      },
    }));
  };

  const clearAll = () => {
    const cleared = {};
    filtersData.forEach((filter) => {
      cleared[filter.key] = {};
      filter.values.forEach((val) => {
        cleared[filter.key][val] = false;
      });
    });
    setFilters(cleared);
    onApplyFilters([], cleared, { currentPage: 1, totalPages: 1, totalItems: 0 });
    onClose();
  };

  const applyFilters = async (filterState = filters) => {
    if (!token) {
      Alert.alert(
        'Login Required',
        'Please log in to apply filters.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login', {
              fromScreen: 'FilterComponent',
              subCategoryId,
            }),
          },
        ],
        { cancelable: false }
      );
      return;
    }

    const queryParams = [
      `subCategoryId=${encodeURIComponent(subCategoryId)}`,
      'page=1',
      'limit=5',
      `sortBy=${encodeURIComponent(sortBy)}`,
    ];

    Object.keys(filterState).forEach((key) => {
      const selectedValues = Object.entries(filterState[key])
        .filter(([_, isSelected]) => isSelected)
        .map(([val]) => val);

      if (selectedValues.length > 0) {
        queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(selectedValues.join(','))}`);
      }
    });

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const apiUrl = `${BASE_URL}/items/filter${queryString}`;

    console.log('🌐 Fetching filtered items from:', apiUrl);

    try {
      setLoading(true);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server response:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error('❌ Non-JSON response:', errorText);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      console.log('🌐 Filtered items response:', data);

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
          filters: item.filters || [],
        }));
        onApplyFilters(formattedItems, filterState, {
          currentPage: data.data?.currentPage || 1,
          totalPages: data.data?.totalPages || 1,
          totalItems: data.data?.totalItems || 0,
        });
        if (formattedItems.length === 0) {
          Alert.alert('No Results', 'No items match the selected filters');
        }
        onClose();
      } else {
        throw new Error(data?.message || 'Failed to apply filters');
      }
    } catch (error) {
      const errorMessage = error.message.includes('401')
        ? 'Session expired. Please log in again.'
        : error.message || 'Error applying filters';
      setError(errorMessage);
      console.error('❌ Error applying filters:', error);
      Alert.alert(
        'Error',
        errorMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              if (errorMessage.includes('401')) {
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
    }
  };

  const renderOptions = () => {
    if (!selectedCategory || !filters[selectedCategory]) return null;
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

  if (loading) {
    return (
      <View style={styles.modalContainer}>
        <ActivityIndicator size="large" color="#F36F25" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.modalContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.modalContainer}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FILTER</Text>
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearText}>Clear all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
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
                  {cat.key} ({cat.values.length})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.rightColumn}>{renderOptions()}</ScrollView>
        </View>

        <TouchableOpacity style={styles.applyButton} onPress={() => applyFilters()} disabled={loading}>
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