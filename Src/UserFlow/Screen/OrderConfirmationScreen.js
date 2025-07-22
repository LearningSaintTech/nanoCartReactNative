

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import { BASE_URL } from '../../config/apiConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useWindowDimensions } from 'react-native';


const OrderConfirmationScreen = ({ route, navigation }) => {
  // Extract order data from navigation params
  const { orderData } = route.params; // Assuming the entire API response is passed as 'orderData'

  // State to hold order details
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [createdAt, setCreatedAt] = useState('');
 const { width } = useWindowDimensions();
  // State to hold recommendations data from API
  const [recommendations, setRecommendations] = useState([]);

  // Fetch recommendations from the API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${BASE_URL}/items`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();

        // Map the API response to the format expected by the recommendations
        const mappedItems = data.data.items.map((item) => ({
          id: item._id, // Use _id as the unique key
          image: { uri: item.image }, // Use the image URL from the API
          label: 'SHOP NOW', // Static label as per original code
        }));

        // Limit to 2 items to match the original UI (optional, based on your layout)
        setRecommendations(mappedItems.slice(0, 2));
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []); // Empty dependency array to run once on mount

  // Format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  // Process the API response for order details when the component mounts
  useEffect(() => {
    if (orderData) {
      // Extract orderId
      setOrderId(orderData.data.orderId);

      // Extract orderDetails and map the required fields
      const details = orderData.data.orderDetails.map((item) => ({
        id: item._id,
        name: item.itemId.name,
        description: item.itemId.description, // Used as category in the UI
        image: { uri: item.itemId.image }, // Use URI for remote image
        date: `Placed on ${formatDate(orderData.data.createdAt)}`,
        status: orderData.data.orderStatus,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));
      setOrderDetails(details);

      // Extract orderStatus
      setOrderStatus(orderData.data.orderStatus);

      // Extract createdAt
      setCreatedAt(formatDate(orderData.data.createdAt));
    }
  }, [orderData]);
  const scale = (size) => (width / 375) * size;

  return (
    <ScrollView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <SafeAreaView style={{ backgroundColor: '#fff', flex: 0 }}>
              <View style={[styles.header, {  paddingHorizontal: scale(16), paddingVertical: scale(12) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Icon name="arrow-back" size={scale(22)} color="#333" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { marginLeft: scale(8) }]}>Order Confirmation</Text>
              </View>
            </SafeAreaView>

      {/* Confirmation message */}
      <View style={styles.messageBox}>
        <Text style={styles.thankText}>Thank you for your order!</Text>
        <Text style={styles.messageText}>
          We've received your order and will contact you as soon as your package is shipped. You can
          find your purchase information below.
        </Text>
        <Text style={styles.orderId}>Order ID: {orderId}</Text>
      </View>

      {/* Product List */}
      <View style={styles.productsBox}>
        {orderDetails.map((item) => (
          <TouchableOpacity key={item.id} style={styles.productRow}>
            <Image source={item.image} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.category}>{item.description}</Text>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.status}>● {item.status}</Text>
            </View>
            <Text style={styles.arrow}>{'›'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* View Orders */}
      <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')} style={styles.viewOrderBtn}>
        <Text style={styles.viewOrderText}>VIEW ORDERS </Text>
      </TouchableOpacity>

      {/* Recommendations */}
      <View style={styles.recommendBox}>
        <Text style={styles.subTitle}>You might also like</Text>
        <View style={styles.recommendRow}>
          {recommendations.map((item) => (
            <View key={item.id} style={styles.recommendCard}>
              <Image source={item.image} style={styles.recommendImage} />
              <TouchableOpacity onPress={()=>navigation.navigate('UserHome')} style={styles.shopNow}>
                <Text style={styles.shopNowText}>{item.label}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1, },
   header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'uppercase',
  },
  back: { fontSize: 20, marginRight: 10, marginTop: 30 },
  messageBox: {
    backgroundColor: '#FAF2EE',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  thankText: { fontWeight: 'bold', fontSize: 14, color: '#D6722F' },
  messageText: { fontSize: 12, marginTop: 4 },
  orderId: { fontSize: 12, marginTop: 6, color: '#333' },
  productsBox: { marginBottom: 16 },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdfdfd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  productImage: { width: 60, height: 80, borderRadius: 6 },
  productInfo: { flex: 1, marginLeft: 10 },
  name: { fontWeight: 'bold', fontSize: 13 },
  category: { fontSize: 11, color: '#555' },
  date: { fontSize: 11, color: '#888', marginTop: 4 },
  status: { fontSize: 11, color: '#27AE60', marginTop: 2 },
  arrow: { fontSize: 20, color: '#ccc' },
  viewOrderBtn: {
    borderWidth: 1,
    borderColor: '#D6722F',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  viewOrderText: { color: '#D6722F', fontWeight: 'bold' },
  recommendBox: {},
  subTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 10 },
  recommendRow: { flexDirection: 'row', justifyContent: 'space-between' },
  recommendCard: { width: '48%', borderRadius: 8, overflow: 'hidden' },
  recommendImage: { width: '100%', height: 140, borderRadius: 6 },
  shopNow: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  shopNowText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D6722F',
  },
});

export default OrderConfirmationScreen;