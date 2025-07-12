import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../../config/apiConfig';

const TrendingDeals = () => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/subcategory/trendy`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setDeals(result.data);
          console.log('Fetched deals:', result.data);
        } else {
          console.error('Failed to fetch deals:', result.message);
          setError(result.message || 'Failed to load trendy deals.');
        }
      } catch (error) {
        console.error('Error fetching deals:', error.message);
        setError('An error occurred while fetching deals.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D2691E" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (deals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No trendy deals available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trendy Deals of the Day</Text>
      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {deals.map((deal, index) => (
          <TouchableOpacity
            key={deal._id}
            onPress={() =>
              navigation.navigate('PartnerSubCategory', {
                subCategoryId: deal._id,
                subCategoryName: deal.name,
              })
            }
            style={[
              styles.card,
              { height: screenWidth * 0.6 }, // Increased height
            ]}
          >
            <Image
              source={{ uri: deal.image }}
              style={styles.image}
              onError={() => console.log(`Failed to load image for ${deal.name}`)}
            />
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>{deal.name}</Text>
              <View style={styles.iconContainer}>
                <Icon name="chevron-right" size={20} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 15,
    textAlign: 'center',
  },
  cardsContainer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  card: {
    width: Dimensions.get('window').width - 32,
    marginVertical: 8,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 16,
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
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  iconContainer: {
    backgroundColor: '#D2691E',
    borderRadius: 4,
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default TrendingDeals;