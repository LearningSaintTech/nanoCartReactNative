import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../config/apiConfig';

const PartnerOrderHistoryScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.auth.token);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}/partner/order`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Non-OK response:', response.status, errorData);
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const transformedOrders = data.data.orderSummaries.map((summary) => ({
          id: summary.orderId,
          date: new Date(summary.orderDate).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }).replace(/,/, ''),
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

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#D2691E" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ORDER HISTORY  </Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
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
                          ? '#FFD700'
                          : '#000000',
                      color:
                        order.status === 'Confirmed'
                          ? 'rgba(210, 105, 30, 1)'
                          : order.status === 'In transit'
                          ? '#000000'
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
                  <Text style={styles.label}>Order Date </Text>
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
    </SafeAreaView>
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
    paddingVertical: 12,
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
    marginLeft: 10,
    color: '#000',
    textTransform: 'uppercase',
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