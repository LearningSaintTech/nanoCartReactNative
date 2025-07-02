import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

const PartnerOrderConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderData } = route.params || {};

  // Extract order ID with fallback
  const orderId = orderData?.orderId || '#N/A';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ORDER CONFIRMATION</Text>
      </View>

      {/* Confirmation Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.message}>Thank you for your order!</Text>
        <Text style={styles.orderIdText}>
          <Text style={styles.orderIdLabel}>Order ID:</Text> {orderId}
        </Text>
      </View>
    </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FDF6F1',
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
});

export default PartnerOrderConfirmationScreen;