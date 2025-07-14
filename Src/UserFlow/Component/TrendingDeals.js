import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../../config/apiConfig';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error in TrendingDeals: {this.state.error?.message || 'Unknown error'}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const TrendingDeals = ({ refreshDeals, onRefreshComplete }) => {
  const navigation = useNavigation();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const screenWidth = Dimensions.get('window').width;

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      // Add cache-busting timestamp
      const url = `${BASE_URL}/subcategory/trendy?_t=${Date.now()}`;
      console.log('Fetching deals from:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      const result = await response.json();
      console.log('Trending Deals response:', JSON.stringify(result, null, 2));

      if (!response.ok) {
        console.error('Trending Deals API error, status:', response.status);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      if (result.success && Array.isArray(result.data)) {
        console.log('Trending deals fetched, count:', result.data.length, 'items:', result.data);
        setDeals(result.data);
      } else {
        console.error('Failed to fetch deals:', result.message || 'No success or data');
        setError(result.message || 'Failed to fetch deals');
      }
    } catch (error) {
      console.error('Error fetching deals:', error.message);
      setError(error.message || 'Error fetching deals');
    } finally {
      setLoading(false);
      if (onRefreshComplete) {
        console.log('Calling onRefreshComplete');
        onRefreshComplete();
      }
    }
  };

  // Fetch deals on mount and when refreshDeals changes
  useEffect(() => {
    console.log('fetchDeals triggered, refreshDeals:', refreshDeals);
    fetchDeals();
  }, [refreshDeals]);

  // Refresh deals when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('TrendingDeals focused, fetching deals');
      fetchDeals();
    });
    return unsubscribe;
  }, [navigation]);

  // Render individual deal card
  const renderDeal = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        console.log('Navigating to SubCategory with ID:', item._id);
        navigation.navigate('SubCategory', { subCategoryId: item._id });
      }}
      style={styles.card}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.image}
        onError={e => console.error(`Image error for deal ${item._id}:`, e.nativeEvent.error)}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>{item.name || 'Unnamed Deal'}</Text>
        <View style={styles.iconContainer}>
          <Icon name="chevron-right" size={20} color="#FFFFFF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Text style={styles.title}>Trendy Deals of the Day</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#FF6B00" style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : deals.length === 0 ? (
          <Text style={styles.noDataText}>No deals available</Text>
        ) : (
          <FlatList
            data={deals}
            renderItem={renderDeal}
            keyExtractor={item => item._id.toString()}
            contentContainerStyle={styles.cardsContainer}
            showsVerticalScrollIndicator={false}
            key={deals.length} 
          />
        )}
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
    paddingHorizontal: 16,
  },
  cardsContainer: {
    paddingHorizontal: 16,
  },
  card: {
    width: Dimensions.get('window').width - 32, // Account for padding
    height: (Dimensions.get('window').width - 32) * 0.9, // Maintain aspect ratio
    marginBottom: 16,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
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
  loader: {
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default TrendingDeals;