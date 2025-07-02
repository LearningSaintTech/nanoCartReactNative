import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

const PartnerOrderHistoryScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.auth.token);
console.log("token",token)
  // Function to fetch orders from the API using fetch
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check for token
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Make API request using fetch
      const response = await fetch('http://192.168.1.20 :4000/api/partner/order/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("data orderhistoryscreen",data)
      // Check if the response is successful
      if (data.success) {
        // Transform API data to match frontend format
        const transformedOrders = data.data.orderSummaries.map((summary) => ({
          id: summary.orderId,
          date: new Date(summary.orderDate).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }).replace(/,/, ''), // Format like "13 Jun 2025 07:36 pm"
          itemCount: summary.numberOfItems,
          items: summary.itemNames.join(', '),
          status: data.data.orders.find((o) => o.orderId === summary.orderId)?.orderStatus || 'Unknown',
        }));

        setOrders(transformedOrders);
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err.message);
      setError(err.message || 'An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders when the component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#D2691E" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
          <Icon name="chevron-back-outline" size={24} color="#000" />
        <Text style={styles.headerTitle}>ORDER HISTORY</Text>
      </View>
      {orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noOrdersText}>No orders found</Text>
        </View>
      ) : (
        orders.map((order, index) => (
          <View key={index} style={styles.orderContainer}>
            <View style={styles.orderHeader}>
              <Text
                style={[
                  styles.statusText,
                  {
                    backgroundColor:
                      order.status === 'Confirmed'
                        ? '#FFFFFF'
                        : order.status === 'Delivered'
                        ? 'rgba(210, 105, 30, 1)'
                        : order.status === 'In transit'
                        ? '#FFD700' // Gold for In transit
                        : '#000000', // Default for others like Returned
                    color:
                      order.status === 'Confirmed'
                        ? 'rgba(210, 105, 30, 1)'
                        : order.status === 'In transit'
                        ? '#000000' // Black text for In transit
                        : '#FFFFFF',
                  },
                ]}
              >
                {order.status.toUpperCase()}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('PartnerTrackOrderScreen', { orderId: order.id })}
              >
                <Icon name="chevron-forward-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.orderDetails}>
              <View style={styles.orderIdText}>
                <Text style={styles.label}>Order ID</Text>
                <Text style={styles.label}>{order.id}</Text>
              </View>
              <View style={styles.orderIdText}>
                <Text style={styles.label}>Order Date</Text>
                <Text style={styles.label}>{order.date}</Text>
              </View>
              <View style={styles.separator} />
              <Text style={styles.itemCountText}>{order.itemCount} ITEMS</Text>
              <Text style={styles.itemsText}>{order.items}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default PartnerOrderHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  orderContainer: {
    margin: 10,
    backgroundColor: 'rgba(210, 105, 30, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  orderDetails: {
    padding: 15,
  },
  orderIdText: {
    fontSize: 14,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginVertical: 5,
  },
  itemCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemsText: {
    fontSize: 14,
    color: '#666',
  },
  label: {
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#D2691E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noOrdersText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});