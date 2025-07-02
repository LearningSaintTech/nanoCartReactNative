import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const SizeChartScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { sizeChart = [], howToMeasure = [], itemId, imagesByColor = [] } = route.params || {};
  const token = useSelector(state => state.auth.token);
  const [unit, setUnit] = useState('inches');
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(imagesByColor?.[0]?.color || 'Black');
  const [quantity, setQuantity] = useState(1);

  // Log initial props and state
  console.log('SizeChartScreen Mounted', {
    routeParams: route.params,
    token,
    initialUnit: unit,
    initialSelectedSize: selectedSize,
    initialSelectedColor: selectedColor,
    quantity,
  });

  const handleAddToCart = async () => {
    console.log('handleAddToCart Called', { token, selectedSize, selectedColor, quantity });

    if (!token) {
      console.log('No token found, redirecting to Login');
      Alert.alert('Authentication Required', 'Please log in to add items to your cart.');
      navigation.navigate('Login', {
        fromScreen: 'SizeChart',
        itemId,
      });
      return;
    }

    if (!selectedSize) {
      console.log('No size selected');
      Alert.alert('Size Required', 'Please select a size.');
      return;
    }

    // Find the selected color object from imagesByColor
    const selectedColorObj = imagesByColor.find(colorObj => colorObj.color === selectedColor);
    console.log('Selected Color Object:', selectedColorObj);

    // Find the selected size object from the selected color's sizes
    const selectedSizeObj = selectedColorObj?.sizes?.find(sz => sz.size === selectedSize);
    console.log('Selected Size Object:', selectedSizeObj);

    if (!selectedSizeObj) {
      console.log('Invalid size for selected color');
      Alert.alert('Error', 'Selected size is not available for this color.');
      return;
    }

    const payload = {
      itemId: itemId,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
      skuId: selectedSizeObj.skuId,
    };
    console.log('Add to Cart Payload', payload);

    try {
      const response = await fetch('http://192.168.1.20 :4000/api/usercart/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Add to Cart API Response', { status: response.status, data });

      if (response.ok) {
        console.log('Item added to cart successfully');
        Alert.alert('Success', 'Added to cart successfully.');
        navigation.navigate('Cart');
      } else {
        console.log('Add to Cart API Error', { message: data.message });
        Alert.alert('Error', data.message || 'Failed to add to cart.');
      }
    } catch (error) {
      console.error('Cart API Error:', error);
      Alert.alert('Error', 'Something went wrong while adding to cart.');
    }
  };

  const handleAddToWishlist = async () => {
    console.log('handleAddToWishlist Called', { token, selectedColor });

    if (!token) {
      console.log('No token found, redirecting to Login');
      Alert.alert('Authentication Required', 'Please log in to add items to your wishlist.');
      navigation.navigate('Login', {
        fromScreen: 'SizeChart',
        itemId,
      });
      return;
    }

    const payload = {
      itemId: itemId || '6815ae9442ecd6cd1532dd72',
      color: selectedColor || 'Black',
    };
    console.log('Add to Wishlist Payload', payload);

    try {
      const response = await fetch('http://192.168.1.20 :4000/api/userwishlist/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Add to Wishlist API Response', { status: response.status, data });

      if (response.ok) {
        console.log('Item added to wishlist successfully');
        Alert.alert('Success', 'Added to wishlist successfully.');
        navigation.navigate('Wishlist');
      } else {
        console.log('Add to Wishlist API Error', { message: data.message });
        Alert.alert('Error', data.message || 'Failed to add to wishlist.');
      }
    } catch (error) {
      console.error('Wishlist API Error:', error);
      Alert.alert('Error', 'Something went wrong while adding to wishlist.');
    }
  };

  // Log state changes
  React.useEffect(() => {
    console.log('State Updated', { unit, selectedSize, selectedColor });
  }, [unit, selectedSize, selectedColor]);

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            console.log('Back Button Pressed');
            navigation.goBack();
          }}>
            <Icon name="arrow-left" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SIZE CHART - UNISEX HOODIES</Text>
        </View>

        {/* Unit Toggle */}
        <View style={styles.tabContainer}>
          <View style={styles.tabWrapper}>
            <TouchableOpacity
              style={[styles.tab, unit === 'inches' && styles.activeTab]}
              onPress={() => {
                console.log('Unit changed to inches');
                setUnit('inches');
              }}>
              <Text style={[styles.tabText, unit === 'inches' && styles.activeTabText]}>In Inches</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, unit === 'cm' && styles.activeTab]}
              onPress={() => {
                console.log('Unit changed to cm');
                setUnit('cm');
              }}>
              <Text style={[styles.tabText, unit === 'cm' && styles.activeTabText]}>In CM</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Size Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.sizeColumn]}>Size</Text>
            <Text style={[styles.tableHeaderText, styles.measureColumn]}>Length</Text>
            <Text style={[styles.tableHeaderText, styles.measureColumn]}>Width</Text>
          </View>
          {sizeChart.map((row, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tableRow}
              onPress={() => {
                console.log('Size Selected', { size: row.size });
                setSelectedSize(row.size);
              }}>
              <View style={styles.checkboxContainer}>
                <View style={[styles.checkbox, selectedSize === row.size && styles.checkboxSelected]}>
                  {selectedSize === row.size && (
                    <Icon name="check" size={12} color="#fff" />
                  )}
                </View>
              </View>
              <Text style={[styles.tableCell, styles.sizeColumn]}>{row.size}</Text>
              <Text style={[styles.tableCell, styles.measureColumn]}>
                {row[unit]?.length ?? '-'}
              </Text>
              <Text style={[styles.tableCell, styles.measureColumn]}>
                {row[unit]?.width ?? '-'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* How To Measure */}
        <View style={styles.howToMeasureSection}>
          <Text style={styles.howToMeasureTitle}>How to Measure</Text>
          {howToMeasure.map((item, idx) => {
            const [key] = Object.keys(item);
            return (
              <View key={idx} style={styles.measureItem}>
                <Text style={styles.measureKey}>{key}:</Text>
                <Text style={styles.measureValue}>{item[key]}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.wishlistButton} onPress={() => {
          console.log('Wishlist Button Pressed');
          handleAddToWishlist();
        }}>
          <Icon name="heart-o" size={20} color="#FF6B00" />
          <Text style={styles.wishlistButtonText}>WISHLIST</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addToCartButton} onPress={() => {
          console.log('Add to Cart Button Pressed');
          handleAddToCart();
        }}>
          <Icon name="shopping-cart" size={20} color="#FFF" />
          <Text style={styles.addToCartButtonText}>ADD TO CART</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SizeChartScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 15,
    color: '#333',
  },
  tabContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B00',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#FF6B00',
    fontWeight: '500',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableHeaderText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkboxContainer: {
    width: 24,
    marginRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  tableCell: {
    fontSize: 14,
    color: '#333',
  },
  sizeColumn: {
    flex: 0.8,
  },
  measureColumn: {
    flex: 1,
    textAlign: 'center',
  },
  howToMeasureSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFF5EC',
    borderRadius: 8,
  },
  howToMeasureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  measureItem: {
    marginBottom: 12,
  },
  measureKey: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  measureValue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  wishlistButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FF6B00',
    borderRadius: 4,
  },
  addToCartButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#FF6B00',
    borderRadius: 4,
    borderWidth:1
  },
  wishlistButtonText: {
    marginLeft:10,
    color: '#FF6B00',
    fontSize: 14,
    fontWeight: '600',
  },
  addToCartButtonText: {
    marginLeft:10,
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});