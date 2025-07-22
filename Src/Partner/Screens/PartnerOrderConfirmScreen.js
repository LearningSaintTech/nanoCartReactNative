import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

const PartnerOrderConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderData } = route.params || {};
  const orderId = orderData?.orderId || '#N/A';
  const orderItems = orderData?.orderItems || [];
  const recommendedItems = [
    { id: '3', image: 'https://via.placeholder.com/100' },
    { id: '4', image: 'https://via.placeholder.com/100' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ORDER CONFIRMATION</Text>
      </View>

      <View style={styles.messageContainer}>
        <Text style={styles.message}>Thank you for your order!</Text>
        <Text style={styles.message}>We've received your order and will contact you as soon as your package is shipped. You can cancel your order before it is shipped.</Text>
        <Text style={styles.orderIdText}>
          <Text style={styles.orderIdLabel}>Order ID:</Text> {orderId}
        </Text>
      </View>

      {orderItems.map((item) => (
        <View key={item.itemId} style={styles.orderItem}>
          <Image source={{ uri: item.itemImage || 'https://via.placeholder.com/100' }} style={styles.itemImage} />
          <View style={styles.statusContainer}>
            <Text style={styles.itemName}>{item.itemName || 'Item Name'}</Text>
            <Text style={styles.itemStatus}>{item.status || 'In transit on 20th, 12:24 pm'}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.viewOrderButton} onPress={() => navigation.navigate('OrderDetails', { orderId })}>
        <Text style={styles.viewOrderText}>VIEW ORDER</Text>
      </TouchableOpacity>

      <View style={styles.recommendationContainer}>
        <Text style={styles.recommendationText}>You might also like</Text>
        <View style={styles.recommendationRow}>
          {recommendedItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.recommendationItem}>
              <Image source={{ uri: item.image }} style={styles.recommendationImage} />
              <Text style={styles.shopNowText}>SHOP NOW</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.contactInfo}>397.04 x 880 Hug</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  messageContainer: {
    padding: 20,
    backgroundColor: '#FDF6F1',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  orderIdText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  orderIdLabel: {
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  statusContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
  },
  itemStatus: {
    fontSize: 12,
    color: '#666',
  },
  viewOrderButton: {
    backgroundColor: '#F36F25',
    paddingVertical: 12,
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
  },
  viewOrderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recommendationContainer: {
    padding: 16,
  },
  recommendationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  recommendationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recommendationItem: {
    alignItems: 'center',
  },
  recommendationImage: {
    width: 100,
    height: 100,
    marginBottom: 5,
  },
  shopNowText: {
    color: '#F36F25',
    fontSize: 12,
    fontWeight: '600',
  },
  contactInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default PartnerOrderConfirmationScreen;