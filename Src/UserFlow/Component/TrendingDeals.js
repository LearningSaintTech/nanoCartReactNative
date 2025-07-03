// import React, { useState, useEffect } from 'react';
// import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
// import Icon from 'react-native-vector-icons/Entypo';
// import { useNavigation } from '@react-navigation/native';
// import { BASE_URL } from '../../config/apiConfig';

// const TrendingDeals = () => {
//   const navigation = useNavigation();
//   const screenWidth = Dimensions.get('window').width;
//   const screenHeight = Dimensions.get('window').height;
//   const [deals, setDeals] = useState([]);

//   useEffect(() => {
//     const fetchDeals = async () => {
//       try {
//         const response = await fetch(`${BASE_URL}/subcategory/trendy`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });
//         const result = await response.json();
//         if (result.success) {
//           setDeals(result.data); // Store the API data
//         } else {
//           console.error('Failed to fetch deals:', result.message);
//         }
//       } catch (error) {
//         console.error('Error fetching deals:', error);
//       }
//     };

//     fetchDeals();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Trendy Deals of the Day</Text>
//       <View style={styles.cardsContainer}>
//         {deals.length > 0 && (
//           <TouchableOpacity 
//             onPress={() => navigation.navigate('SubCategory', { subCategoryId: deals[0]._id })} 
//             style={styles.card}
//           >
//             <Image
//               source={{ uri: deals[0].image }} // Use image URL from API
//               style={styles.image}
//             />
//             <View style={styles.overlay}>
//               {/* <Text style={styles.overlayText}> {deals[0].name || ""}</Text>  */}
//               <Text style={styles.overlayText}> asdasd</Text> 
//               <View style={styles.iconContainer}>
//                 <Icon name="chevron-right" size={20} color="#FFFFFF" />
//               </View>
//             </View>
//           </TouchableOpacity>
//         )}

//         {deals.length > 1 && (
//           <TouchableOpacity 
//             onPress={() => navigation.navigate('SubCategory', { subCategoryId: deals[1]._id })} 
//             style={styles.card}
//           >
//             <Image
//               source={{ uri: deals[1].image }} // Use image URL from API
//               style={styles.image}
//             />
//             <View style={styles.overlay}>
//               <Text style={styles.overlayText}>{deals[1].name}</Text> {/* Use name from API */}
//               <View style={styles.iconContainer}>
//                 <Icon name="chevron-right" size={20} color="#FFFFFF" />
//               </View>
//             </View>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     width: '100%',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 12,
//     color: '#000000',
//     paddingHorizontal: 16,
//   },
//   cardsContainer: {
//     width: '100%',
//   },
//   card: {
//     width: Dimensions.get('window').width,
//     height: Dimensions.get('window').height * 0.50,
//     marginBottom: 1,
//     position: 'relative',
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   overlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     backgroundColor: 'rgba(0, 0, 0, 0.4)',
//   },
//   overlayText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   iconContainer: {
//     backgroundColor: '#FF6B00',
//     borderRadius: 4,
//     padding: 8,
//   },
// });

// export default TrendingDeals;





import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
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

const TrendingDeals = () => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
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
        if (!response.ok) {
          const text = await response.text();
          console.error('Trending Deals API Error Response:', text);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setDeals(result.data);
        } else {
          console.error('Failed to fetch deals:', result.message);
          setError(result.message || 'Failed to fetch deals');
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
        setError('Error fetching deals');
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

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
          <View style={styles.cardsContainer}>
            {deals[0] && (
              <TouchableOpacity
                onPress={() => navigation.navigate('SubCategory', { subCategoryId: deals[0]._id })}
                style={styles.card}
              >
                <Image
                  source={{ uri: deals[0].image || 'https://via.placeholder.com/150' }}
                  style={styles.image}
                  onError={e => console.error('Deal 1 image error:', e.nativeEvent.error)}
                />
                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>{deals[0].name || 'Unnamed Deal'}</Text>
                  <View style={styles.iconContainer}>
                    <Icon name="chevron-right" size={20} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
            {deals[1] && (
              <TouchableOpacity
                onPress={() => navigation.navigate('SubCategory', { subCategoryId: deals[1]._id })}
                style={styles.card}
              >
                <Image
                  source={{ uri: deals[1].image || 'https://via.placeholder.com/150' }}
                  style={styles.image}
                  onError={e => console.error('Deal 2 image error:', e.nativeEvent.error)}
                />
                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>{deals[1].name || 'Unnamed Deal'}</Text>
                  <View style={styles.iconContainer}>
                    <Icon name="chevron-right" size={20} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ErrorBoundary>
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