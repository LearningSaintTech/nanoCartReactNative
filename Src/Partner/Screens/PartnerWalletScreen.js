import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const PartnerWalletScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState({ totalMoney: 0, transactions: [] });

  useEffect(() => {
    const response = {
      totalMoney: 25600,
      transactions: [
        {
          date: '13th Feb 2025',
          orderId: '#13698765',
          description: 'Refund for the returned order',
          amount: 3000,
        },
        {
          date: '27th Jan 2025',
          orderId: '#13698002',
          description: 'Used to place new order',
          amount: -50800,
        },
        {
          date: '22nd Dec 2024',
          orderId: '#13600567',
          description: 'Spent to club with discount offer',
          amount: -7200,
        },
        {
          date: '19th Dec 2024',
          orderId: '#13600567',
          description: 'Refund for requested return',
          amount: 11000,
        },
      ],
    };

    setData(response);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>MY WALLET</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Total Money</Text>
        <Text style={styles.totalMoney}>
          ₹ {data.totalMoney.toLocaleString()}
        </Text>
        <Text style={styles.sectionTitle}>TRANSACTION LOG</Text>
        <View style={styles.itemList}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.headerCell]}>Date</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Order ID</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Description</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Amount</Text>
          </View>
          <ScrollView
            style={styles.itemBody}
            showsVerticalScrollIndicator={false}
          >
            {data.transactions.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableCell}>{item.date}</Text>
                <Text style={styles.tableCell}>{item.orderId}</Text>
                <Text style={styles.tableCell}>{item.description}</Text>
                <Text
                  style={[
                    styles.tableCell,
                    {
                      color: item.amount > 0 ? 'green' : 'red',
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  {item.amount > 0
                    ? `+ ₹${item.amount.toLocaleString()}`
                    : `- ₹${Math.abs(item.amount).toLocaleString()}`}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewText}>VIEW MORE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footer}
          onPress={() => navigation.navigate('')}
        >
          <Text style={styles.footerText}>TERMS & CONDITIONS</Text>
          <Icon name="chevron-forward-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footer}
          onPress={() => navigation.navigate('')}
        >
          <Text style={styles.footerText}>FAQs</Text>
          <Icon name="chevron-forward-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PartnerWalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10, // Ensure header touches screen edges
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#000',
    textTransform: 'uppercase',
  },
  content: {
    paddingHorizontal: 15, // Apply padding to non-header content
  },
  title: {
    marginTop: 25,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
  totalMoney: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    color: '#000',
  },
  itemList: {
    marginBottom: 0,
  },
  itemBody: {
    paddingBottom: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    paddingRight: 5,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  viewButton: {
    marginVertical: 20,
    backgroundColor: '#fff',
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff6200',
    marginHorizontal: 20,
    borderRadius: 5,
  },
  viewText: {
    color: '#ff6200',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});