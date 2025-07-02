import {
    SafeAreaView,
    StyleSheet,
    Image,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
  } from 'react-native';
  import React, {useEffect, useState} from 'react';
  import BackIcon from '../../assets/Images/Backward.png';
  import {useNavigation} from '@react-navigation/native';
  import Icon from 'react-native-vector-icons/Ionicons';
  
  const PartnerWalletScreen = () => {
    const navigation = useNavigation();
  
    const [data, setData] = useState({totalMoney: 0, transactions: []});
  
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={BackIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerText}>MY WALLET</Text>
        </View>
        <Text style={styles.title}>Total Money</Text>
        <Text style={styles.totalMoney}>
          ₹ {data.totalMoney.toLocaleString()}
        </Text>
        <Text style={styles.sectionTitle}>TRANSACTION LOG</Text>
        {/* Table Headers */}
        <View style={styles.itemList}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.headerCell]}>Date</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Order ID</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Description</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Amount</Text>
          </View>
          <ScrollView
            style={styles.itemBody}
            showsVerticalScrollIndicator={false}>
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
                  ]}>
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
          onPress={() => navigation.navigate('')}>
          <Text style={styles.footerText}> TERMS & CONDITIONS</Text>
          <Icon name="chevron-forward-outline" size={24} color="#000" />
        </TouchableOpacity>
  
        <TouchableOpacity
          style={styles.footer}
          onPress={() => navigation.navigate('')}>
          <Text style={styles.footerText}> FAQs</Text>
          <Icon name="chevron-forward-outline" size={24} color="#000" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  };
  
  export default PartnerWalletScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 15,
      backgroundColor: '#fff',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    backIcon: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
    },
    headerText: {
      paddingLeft: 20,
      fontSize: 18,
      fontWeight: 'bold',
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