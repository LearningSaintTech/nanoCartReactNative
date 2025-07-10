import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';

const orderItems = [
  {
    id: '1',
    name: 'MAAHI Winter Hoodie',
    category: 'Unisex Collections',
    date: 'Placed on 20th Feb, 11:24 pm',
    status: 'Confirmed',
    image: require('../../assets/Images/Carosuel1.png'),
  },
  {
    id: '2',
    name: 'MAAHI Popular: Georgette Saree',
    category: "Women's Party Wear",
    date: 'Placed on 20th Feb, 11:24 pm',
    status: 'Confirmed',
    image: require('../../assets/Images/Carosuel1.png'),
  },
];

const recommendations = [
  {
    id: '1',
    image: require('../../assets/Images/Carosuel1.png'),
    label: 'SHOP NOW',
  },
  {
    id: '2',
    image: require('../../assets/Images/Carosuel1.png'),
    label: 'SHOP NOW',
  },
];

const ReturnConfirmationScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RETURN / EXCHANGE</Text>
      </View>

      {/* Confirmation Message */}
      <View style={styles.messageBox}>
        <Text style={styles.thankText}>Pickup request has been raised!</Text>
        <Text style={styles.messageText}>
          We’ve received your return/exchange request and will arrange a pickup soon. You’ll be
          notified once your item is collected and processed.
        </Text>
        <Text style={styles.orderId}>Order ID: #134589785</Text>
      </View>

      {/* Order Items */}
      <View style={styles.productsBox}>
        {orderItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.productRow}>
            <Image source={item.image} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.status}>● {item.status}</Text>
            </View>
            <Text style={styles.arrow}>{'›'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* View Orders */}
      <TouchableOpacity style={styles.viewOrderBtn}>
        <Text style={styles.viewOrderText}>VIEW ORDERS</Text>
      </TouchableOpacity>

      {/* Recommendations */}
      <View style={styles.recommendBox}>
        <Text style={styles.subTitle}>You might also like</Text>
        <View style={styles.recommendRow}>
          {recommendations.map((item) => (
            <View key={item.id} style={styles.recommendCard}>
              <Image source={item.image} style={styles.recommendImage} />
              <TouchableOpacity style={styles.shopNow}>
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
  container: { backgroundColor: '#fff', flex: 1, padding: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  back: { fontSize: 20, marginRight: 10 },
  headerTitle: { fontWeight: 'bold', fontSize: 16 },
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

export default ReturnConfirmationScreen;
