
// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StatusBar,
//   ActivityIndicator,
// } from 'react-native';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import {useSelector} from 'react-redux';
// import {BASE_URL} from '../../config/apiConfig';

// const OrderHistoryScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const token = useSelector(state => state.auth.token);
//   const {itemId} = route.params || {};

//   // Function to fetch orders from the backend
//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (!token) {
//         throw new Error('No authentication token found');
//       }

//       const response = await fetch(`${BASE_URL}/user/order`, {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
     
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(
//           errorData.message || `HTTP error! Status: ${response.status}`,
//         );
//       }

//       const responseData = await response.json();
//       if (!responseData.success) {
//         throw new Error(responseData.message || 'Failed to fetch orders');
//       }

//       const fetchedOrders = responseData.data;

//       // Transform backend data
//       const transformedOrders = fetchedOrders.map((order, index) => ({
//         id: order._id || index.toString(),
//         orderId: order.orderId || `#${index + 100000}`,
//         name: order.orderDetails[0]?.itemId?.name || 'Unknown Item',
//         category: order.orderDetails[0]?.itemId?.category || 'General',
//         date: new Date(order.createdAt).toLocaleString('en-US', {
//           day: 'numeric',
//           month: 'short',
//           year: 'numeric',
//           hour: 'numeric',
//           minute: 'numeric',
//           hour12: true,
//         }),
//         status: order.orderStatus || 'Unknown',
//         image:
//           order.orderDetails[0]?.itemId?.image ||
//           'https://via.placeholder.com/70',
//         itemId: order.orderDetails[0]?.itemId?._id || '',
//         button: getButtonText(order.orderStatus),
//         buttonColor: getButtonColor(order.orderStatus),
//         borderColor: getBorderColor(order.orderStatus),
//         textColor: getTextColor(order.orderStatus),
//       }));

//       setOrders(transformedOrders);
//     } catch (err) {
//       console.error('Error fetching orders:', err.message);
//       setError(
//         err.message.includes('401')
//           ? 'Session expired. Please log in again.'
//           : 'Failed to load orders. Please try again.',
//       );
//       if (err.message.includes('401')) {
//         navigation.navigate('Login');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper functions for button properties
//   const getButtonText = status => {
//     switch (status) {
//       case 'Confirmed':
//       case 'Dispatched':
//         return 'Track Order';
//       case 'Delivered':
//         return 'Rate & Review';
//       case 'Cancelled':
//         return 'View Details';
//       default:
//         return '';
//     }
//   };

//   const getButtonColor = status => {
//     switch (status) {
//       case 'Confirmed':
//       case 'Dispatched':
//       case 'Delivered':
//         return '#fff';
//       case 'Cancelled':
//         return '#F7EDEB';
//       default:
//         return '#fff';
//     }
//   };

//   const getBorderColor = status => {
//     switch (status) {
//       case 'Confirmed':
//       case 'Dispatched':
//       case 'Delivered':
//         return '#D6722F';
//       case 'Cancelled':
//         return '#E86363';
//       default:
//         return '#ccc';
//     }
//   };

//   const getTextColor = status => {
//     switch (status) {
//       case 'Confirmed':
//       case 'Dispatched':
//       case 'Delivered':
//         return '#D6722F';
//       case 'Cancelled':
//         return '#E86363';
//       default:
//         return '#000';
//     }
//   };

//   // Handle button press
//   const handleButtonPress = (button, orderId, itemId, item) => {
//     switch (button) {
//       case 'Track Order':
//         navigation.navigate('TrackOrder', {orderId});
//         break;
//       case 'Rate & Review':
//         navigation.navigate('RateProduct', {orderId, itemId, item});
//         break;
//       case 'View Details':
//         navigation.navigate('TrackOrder', {orderId});
//         break;
//       default:
//         break;
//     }
//   };

//   // Fetch orders on mount
//   useEffect(() => {
//     fetchOrders();
//   }, [token]);

//   const renderItem = ({item}) => (
    
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() => navigation.navigate('TrackOrder', {orderId: item.orderId})}
//       accessibilityLabel={`View tracking details for order ${item.orderId}`}
//       activeOpacity={0.8}>
//       <Text style={styles.orderId}>Order ID : {item.orderId}</Text>
//       <View style={styles.row}>
//         <Image
//           source={
//             typeof item.image === 'string' ? {uri: item.image} : item.image
//           }
//           style={styles.image}
//         />
//         <View style={styles.info}>
//           <Text style={styles.name}>{item.name}</Text>
//           <Text style={styles.category}>{item.category}</Text>
//           <Text style={styles.date}>{item.date}</Text>
//           <Text
//             style={[
//               styles.status,
//               item.status === 'Cancelled' && {color: '#E86363'},
//             ]}>
//             ● {item.status}
//           </Text>
//         </View>
//       </View>
//       {item.button && (
//         <TouchableOpacity
//           style={[
//             styles.button,
//             {
//               backgroundColor: item.buttonColor,
//               borderColor: item.borderColor,
//             },
//           ]}
//           onPress={e => {
//             e.stopPropagation(); // Prevent card's onPress from firing
//             handleButtonPress(item.button, item.orderId, item.itemId, item);
//           }}
//           accessibilityLabel={item.button}>
//           <Text style={[styles.buttonText, {color: item.textColor}]}>
//             {item.button}
//           </Text>
//         </TouchableOpacity>
//       )}
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor="#fff" barStyle="dark-content" />
//       <View style={styles.header}>
//         <Text style={styles.headerText}>ORDER </Text>
//       </View>
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#D6722F" />
//           <Text style={styles.loadingText}>Loading orders...</Text>
//         </View>
//       ) : error ? (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       ) : orders.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyText}>No orders found.</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={orders}
//           keyExtractor={item => item.id}
//           renderItem={renderItem}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{paddingBottom: 20}}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 15,
//   },
//   header: {
//     paddingVertical: 10,
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderColor: '#eee',
//     marginBottom: 10,
//   },
//   headerText: {
//     marginTop: 20,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   card: {
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#eee',
//     marginBottom: 12,
//   },
//   orderId: {
//     fontSize: 12,
//     color: '#999',
//     marginBottom: 8,
//     fontWeight: '500',
//   },
//   row: {
//     flexDirection: 'row',
//   },
//   image: {
//     width: 70,
//     height: 90,
//     resizeMode: 'cover',
//     borderRadius: 6,
//   },
//   info: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   name: {
//     fontWeight: 'bold',
//     fontSize: 13,
//     marginBottom: 4,
//   },
//   category: {
//     fontSize: 12,
//     color: '#666',
//   },
//   date: {
//     fontSize: 12,
//     marginTop: 4,
//     color: '#555',
//   },
//   status: {
//     fontSize: 12,
//     color: 'green',
//     marginTop: 2,
//   },
//   button: {
//     marginTop: 10,
//     borderWidth: 1,
//     paddingVertical: 8,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   buttonText: {
//     fontWeight: 'bold',
//     fontSize: 13,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#555',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#E86363',
//     marginBottom: 20,
//   },
//   retryButton: {
//     backgroundColor: '#D6722F',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   retryButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#555',
//   },
// });

// export default OrderHistoryScreen;



import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../config/apiConfig';

const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector(state => state.auth.token);
  const { itemId } = route.params || {};

  // Function to fetch orders from the backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}/user/order`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`,
        );
      }

      const responseData = await response.json();
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to fetch orders');
      }

      const fetchedOrders = responseData.data;

      // Transform backend data
      const transformedOrders = fetchedOrders.map((order, index) => ({
        id: order._id || index.toString(),
        orderId: order.orderId || `#${index + 100000}`,
        name: order.orderDetails[0]?.itemId?.name || 'Unknown Item',
        category: order.orderDetails[0]?.itemId?.category || 'General',
        date: new Date(order.createdAt).toLocaleString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }),
        status: order.orderStatus || 'Unknown',
        image: order.orderDetails[0]?.itemId?.image || 'https://via.placeholder.com/70',
        itemId: order.orderDetails[0]?.itemId?._id || '',
        size: order.orderDetails[0]?.size || 'N/A',
        color: order.orderDetails[0]?.color || 'N/A',
        MRP: order.orderDetails[0]?.itemId?.MRP || 0,
        discountedPrice: order.orderDetails[0]?.itemId?.discountedPrice || 0,
        button: getButtonText(order.orderStatus),
        buttonColor: getButtonColor(order.orderStatus),
        borderColor: getBorderColor(order.orderStatus),
        textColor: getTextColor(order.orderStatus),
      }));

      setOrders(transformedOrders);
      console.log('Transformed Orders:', transformedOrders); // Debug log
    } catch (err) {
      console.error('Error fetching orders:', err.message);
      setError(
        err.message.includes('401')
          ? 'Session expired. Please log in again.'
          : 'Failed to load orders. Please try again.',
      );
      if (err.message.includes('401')) {
        navigation.navigate('Login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for button properties
  const getButtonText = status => {
    switch (status) {
      case 'Confirmed':
      case 'Dispatched':
        return 'Track Order';
      case 'Delivered':
        return 'Rate & Review';
      case 'Cancelled':
        return 'View Details';
      default:
        return '';
    }
  };

  const getButtonColor = status => {
    switch (status) {
      case 'Confirmed':
      case 'Dispatched':
      case 'Delivered':
        return '#fff';
      case 'Cancelled':
        return '#F7EDEB';
      default:
        return '#fff';
    }
  };

  const getBorderColor = status => {
    switch (status) {
      case 'Confirmed':
      case 'Dispatched':
      case 'Delivered':
        return '#D6722F';
      case 'Cancelled':
        return '#E86363';
      default:
        return '#ccc';
    }
  };

  const getTextColor = status => {
    switch (status) {
      case 'Confirmed':
      case 'Dispatched':
      case 'Delivered':
        return '#D6722F';
      case 'Cancelled':
        return '#E86363';
      default:
        return '#000';
    }
  };

  // Handle button press
  const handleButtonPress = (button, orderId, item) => {
    console.log('handleButtonPress - Button:', button, 'OrderId:', orderId, 'Item:', item); // Debug log
    switch (button) {
      case 'Track Order':
        navigation.navigate('TrackOrder', { orderId });
        break;
      case 'Rate & Review':
        navigation.navigate('RateProduct', {
          orderId,
          itemId: item.itemId,
          item: {
            name: item.name,
            size: item.size,
            color: item.color,
            MRP: item.MRP,
            discountedPrice: item.discountedPrice,
            image: item.image,
          },
        });
        break;
      case 'View Details':
        navigation.navigate('TrackOrder', { orderId });
        break;
      default:
        break;
    }
  };

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, [token]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TrackOrder', { orderId: item.orderId })}
      accessibilityLabel={`View tracking details for order ${item.orderId}`}
      activeOpacity={0.8}>
      <Text style={styles.orderId}>Order ID: {item.orderId}</Text>
      <View style={styles.row}>
        <Image
          source={
            typeof item.image === 'string' ? { uri: item.image } : item.image
          }
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.date}>{item.date}</Text>
          <Text
            style={[
              styles.status,
              item.status === 'Cancelled' && { color: '#E86363' },
            ]}>
            ● {item.status}
          </Text>
        </View>
      </View>
      {item.button && (
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: item.buttonColor,
              borderColor: item.borderColor,
            },
          ]}
          onPress={e => {
            e.stopPropagation(); // Prevent card's onPress from firing
            handleButtonPress(item.button, item.orderId, item);
          }}
          accessibilityLabel={item.button}>
          <Text style={[styles.buttonText, { color: item.textColor }]}>
            {item.button}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerText}>ORDER</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D6722F" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders found.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  header: {
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  headerText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
  },
  image: {
    width: 70,
    height: 90,
    resizeMode: 'cover',
    borderRadius: 6,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#666',
  },
  date: {
    fontSize: 12,
    marginTop: 4,
    color: '#555',
  },
  status: {
    fontSize: 12,
    color: 'green',
    marginTop: 2,
  },
  button: {
    marginTop: 10,
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#E86363',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#D6722F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
  },
});

export default OrderHistoryScreen;