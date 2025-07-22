// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   ScrollView,
// } from 'react-native';
// import React, { useEffect, useState } from 'react';
// import { useNavigation } from '@react-navigation/native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/Ionicons';

// const PartnerWalletScreen = () => {
//   const navigation = useNavigation();
//   const insets = useSafeAreaInsets();
//   const [data, setData] = useState({ totalMoney: 0, transactions: [] });

//   useEffect(() => {
//     const response = {
//       totalMoney: 25600,
//       transactions: [
//         {
//           date: '13th Feb 2025',
//           orderId: '#13698765',
//           description: 'Refund for the returned order',
//           amount: 3000,
//         },
//         {
//           date: '27th Jan 2025',
//           orderId: '#13698002',
//           description: 'Used to place new order',
//           amount: -50800,
//         },
//         {
//           date: '22nd Dec 2024',
//           orderId: '#13600567',
//           description: 'Spent to club with discount offer',
//           amount: -7200,
//         },
//         {
//           date: '19th Dec 2024',
//           orderId: '#13600567',
//           description: 'Refund for requested return',
//           amount: 11000,
//         },
//       ],
//     };

//     setData(response);
//   }, []);

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={22} color="#000" />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>MY WALLET</Text>
//       </View>
//       <View style={styles.content}>
//         <Text style={styles.title}>Total Money</Text>
//         <Text style={styles.totalMoney}>
//           ₹ {data.totalMoney.toLocaleString()}
//         </Text>
//         <Text style={styles.sectionTitle}>TRANSACTION LOG</Text>
//         <View style={styles.itemList}>
//           <View style={styles.tableHeader}>
//             <Text style={[styles.tableCell, styles.headerCell]}>Date</Text>
//             <Text style={[styles.tableCell, styles.headerCell]}>Order ID</Text>
//             <Text style={[styles.tableCell, styles.headerCell]}>Description</Text>
//             <Text style={[styles.tableCell, styles.headerCell]}>Amount</Text>
//           </View>
//           <ScrollView
//             style={styles.itemBody}
//             showsVerticalScrollIndicator={false}
//           >
//             {data.transactions.map((item, index) => (
//               <View style={styles.tableRow} key={index}>
//                 <Text style={styles.tableCell}>{item.date}</Text>
//                 <Text style={styles.tableCell}>{item.orderId}</Text>
//                 <Text style={styles.tableCell}>{item.description}</Text>
//                 <Text
//                   style={[
//                     styles.tableCell,
//                     {
//                       color: item.amount > 0 ? 'green' : 'red',
//                       fontWeight: 'bold',
//                     },
//                   ]}
//                 >
//                   {item.amount > 0
//                     ? `+ ₹${item.amount.toLocaleString()}`
//                     : `- ₹${Math.abs(item.amount).toLocaleString()}`}
//                 </Text>
//               </View>
//             ))}
//           </ScrollView>
//         </View>
//         <TouchableOpacity style={styles.viewButton}>
//           <Text style={styles.viewText}>VIEW MORE</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.footer}
//           onPress={() => navigation.navigate('')}
//         >
//           <Text style={styles.footerText}>TERMS & CONDITIONS</Text>
//           <Icon name="chevron-forward-outline" size={24} color="#000" />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.footer}
//           onPress={() => navigation.navigate('')}
//         >
//           <Text style={styles.footerText}>FAQs</Text>
//           <Icon name="chevron-forward-outline" size={24} color="#000" />
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default PartnerWalletScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 10, // Ensure header touches screen edges
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//     backgroundColor: '#fff',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginLeft: 10,
//     color: '#000',
//     textTransform: 'uppercase',
//   },
//   content: {
//     paddingHorizontal: 15, // Apply padding to non-header content
//   },
//   title: {
//     marginTop: 25,
//     fontSize: 16,
//     textAlign: 'center',
//     color: '#333',
//     fontWeight: 'bold',
//   },
//   totalMoney: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginVertical: 10,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     marginTop: 20,
//     marginBottom: 20,
//     color: '#000',
//   },
//   itemList: {
//     marginBottom: 0,
//   },
//   itemBody: {
//     paddingBottom: 5,
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingVertical: 10,
//   },
//   tableRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingVertical: 10,
//   },
//   tableCell: {
//     flex: 1,
//     fontSize: 12,
//     paddingRight: 5,
//   },
//   headerCell: {
//     fontWeight: 'bold',
//     fontSize: 13,
//   },
//   viewButton: {
//     marginVertical: 20,
//     backgroundColor: '#fff',
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ff6200',
//     marginHorizontal: 20,
//     borderRadius: 5,
//   },
//   viewText: {
//     color: '#ff6200',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   footer: {
//     padding: 15,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   footerText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//   },
// });









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
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../config/apiConfig'; // Adjust the path as per your project structure

const PartnerWalletScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useSelector(state => state.auth.token); // Assuming token is stored in Redux state
  const [data, setData] = useState({ totalMoney: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to format ISO date to "DDth MMM YYYY" (e.g., "13th Feb 2025")
  const formatDate = (isoDate) => {
    try {
      const date = new Date(isoDate);
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const dayWithSuffix = addOrdinalSuffix(day);
      return `${dayWithSuffix} ${month} ${year}`;
    } catch (err) {
      console.error('Error formatting date:', isoDate, err.message);
      return isoDate; // Fallback to raw date if parsing fails
    }
  };

  // Helper function to add ordinal suffix (e.g., 1st, 2nd, 3rd, 4th)
  const addOrdinalSuffix = (day) => {
    const j = day % 10;
    const k = day % 100;
    if (j === 1 && k !== 11) return `${day}st`;
    if (j === 2 && k !== 12) return `${day}nd`;
    if (j === 3 && k !== 13) return `${day}rd`;
    return `${day}th`;
  };

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!token) {
        console.warn('No token available, skipping wallet fetch');
        setError('Please log in to view wallet details.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching wallet data with token:', token);
        const response = await fetch(`${BASE_URL}/wallet`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response received:', text.slice(0, 200));
          throw new Error('Server did not return JSON response');
        }

        const json = await response.json();
        console.log('Wallet API response:', JSON.stringify(json, null, 2));

        if (response.ok && json.success && json.data) {
          const formattedData = {
            totalMoney: json.data.totalBalance || 0,
            transactions: json.data.transactions.map((txn) => ({
              date: formatDate(txn.createdAt),
              orderId: txn.orderId || 'N/A',
              description: txn.description || '',
              amount: txn.type === 'credit' ? txn.amount : -txn.amount,
            })),
          };
          setData(formattedData);
          console.log('Formatted wallet data set:', formattedData);
        } else {
          console.error('Failed to fetch wallet data:', json.message || 'Unknown error');
          setError(json.message || 'Failed to fetch wallet data.');
          setData({ totalMoney: 0, transactions: [] });
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error.message);
        setError('An error occurred while fetching wallet data.');
        setData({ totalMoney: 0, transactions: [] });
      } finally {
        setLoading(false);
        console.log('Wallet fetch complete, loading:', false);
      }
    };

    fetchWalletData();
  }, [token]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerText}>MY WALLET</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Loading wallet data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerText}>MY WALLET</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          ₹{data.totalMoney.toLocaleString('en-IN')}
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
            {data.transactions.length === 0 ? (
              <Text style={styles.tableCell}>No transactions available</Text>
            ) : (
              data.transactions.map((item, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.tableCell}>{item.date}</Text>
                  <Text style={styles.tableCell}>{item.orderId}</Text>
                  <Text style={styles.tableCell}>{item.description}</Text>
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        color: item.amount >= 0 ? 'green' : 'red',
                        fontWeight: 'bold',
                      },
                    ]}
                  >
                    {item.amount >= 0
                      ? `+ ₹${item.amount.toLocaleString('en-IN')}`
                      : `- ₹${Math.abs(item.amount).toLocaleString('en-IN')}`}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewText}>VIEW MORE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footer}
          onPress={() => navigation.navigate('TermsAndConditions')} // Adjust to your route name
        >
          <Text style={styles.footerText}>TERMS & CONDITIONS</Text>
          <Icon name="chevron-forward-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footer}
          onPress={() => navigation.navigate('FAQs')} // Adjust to your route name
        >
          <Text style={styles.footerText}>FAQs</Text>
          <Icon name="chevron-forward-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingVertical: 12,
    paddingHorizontal: 10,
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
    paddingHorizontal: 15,
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

export default PartnerWalletScreen;