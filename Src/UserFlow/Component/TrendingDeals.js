import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';

const TrendingDeals = () => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('http://192.168.1.20 :4000/api/subcategory/trendy', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        if (result.success) {
          setDeals(result.data); // Store the API data
        } else {
          console.error('Failed to fetch deals:', result.message);
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      }
    };

    fetchDeals();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trendy Deals of the Day</Text>
      <View style={styles.cardsContainer}>
        {deals.length > 0 && (
          <TouchableOpacity 
            onPress={() => navigation.navigate('SubCategory', { subCategoryId: deals[0]._id })} 
            style={styles.card}
          >
            <Image
              source={{ uri: deals[0].image }} // Use image URL from API
              style={styles.image}
            />
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>{deals[0].name}</Text> {/* Use name from API */}
              <View style={styles.iconContainer}>
                <Icon name="chevron-right" size={20} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {deals.length > 1 && (
          <TouchableOpacity 
            onPress={() => navigation.navigate('SubCategory', { subCategoryId: deals[1]._id })} 
            style={styles.card}
          >
            <Image
              source={{ uri: deals[1].image }} // Use image URL from API
              style={styles.image}
            />
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>{deals[1].name}</Text> {/* Use name from API */}
              <View style={styles.iconContainer}>
                <Icon name="chevron-right" size={20} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
    paddingHorizontal: 16,
  },
  cardsContainer: {
    width: '100%',
  },
  card: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.50,
    marginBottom: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  iconContainer: {
    backgroundColor: '#FF6B00',
    borderRadius: 4,
    padding: 8,
  },
});

export default TrendingDeals;