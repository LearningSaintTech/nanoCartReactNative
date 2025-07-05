import React, {useState, useCallback} from 'react';
import {
  Alert,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {logout} from '../../redux/reducers/authReducer';
import {clearCart} from '../../redux/reducers/cartSlice';
import {BASE_URL} from '../../config/apiConfig';
import Icon from 'react-native-vector-icons/Ionicons';
const {width} = Dimensions.get('window');
const scaleFont = size => (width / 414) * size; // Scale font/icon based on 414px reference (e.g., iPhone 11 Pro)
const scalePadding = size => (width / 414) * size;
const MyAccountScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const token = useSelector(state => state.auth.token);
  const cartItems = useSelector(state => state.cart.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [name, setName] = useState('');

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data?.data?.name) {
        setName(data.data.name);
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token) fetchProfile();
    }, [token]),
  );

  const handleDeleteAccount = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete the account?',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const response = await fetch(`${BASE_URL}/auth`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });

              const data = await response.json();
              if (response.ok && data.success) {
                Alert.alert('Deleted', 'Your account has been deleted.', [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('Login'),
                  },
                ]);
              } else {
                Alert.alert(
                  'Error',
                  data.message || 'Failed to delete account.',
                );
              }
            } catch (error) {
              Alert.alert(
                'Error',
                'Something went wrong while deleting account.',
              );
              console.error(error);
            }
          },
        },
      ],
    );
  };

  if (!token) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require('../../assets/icon/BackIcon.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>MY ACCOUNT </Text>
          </View>
          <View style={styles.rightIcons}>
            <TouchableOpacity>
              <Image
                source={require('../../assets/icon/SearchIcon.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.cartIconWrapper}>
              <Image
                source={require('../../assets/icon/CartIcon.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.popupContainer}>
          <Text style={styles.uhOhText}>Uh-oh!</Text>
          <Text style={styles.popupSubtitle}>
            Looks like you haven't logged in!
          </Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() =>
              navigation.navigate('Login', {fromScreen: 'MyAccount'})
            }>
            <Text style={styles.loginButtonText}>LOGIN TO CONTINUE</Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            Having trouble logging in?{' '}
            <Text style={styles.helpLink}>Whatsapp Us</Text>
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Image
            source={require('../../assets/icon/BackIcon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity> */}

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MY ACCOUNT</Text>
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.searchIcon}>
            <Image
              source={require('../../assets/icon/SearchIcon.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartIconWrapper}
            onPress={() => {
              if (token) navigation.navigate('Cart');
              else
                Alert.alert(
                  'Login Required',
                  'Please login to view your cart.',
                );
            }}>
            <Image
              source={require('../../assets/icon/CartIcon.png')}
              style={styles.icon}
            />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image
            source={require('../../assets/Images/Group.png')}
            style={styles.profileLogo}
          />
          <Text style={styles.greeting}>Hi, {name || 'User'}</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.menuText}>Profile</Text>
            <Icon
              name="chevron-forward"
              size={scaleFont(20)}
              color="#333"
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('OrderHistory')}>
            <Text style={styles.menuText}>Order History</Text>

            <Icon
              name="chevron-forward"
              size={scaleFont(20)}
              color="#333"
              style={styles.arrowIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Saved')}>
            <Text style={styles.menuText}>Saved Address</Text>

            <Icon
              name="chevron-forward"
              size={scaleFont(20)}
              color="#333"
              style={styles.arrowIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Try Before You Buy (TBYB)</Text>
            <Icon
              name="chevron-forward"
              size={scaleFont(20)}
              color="#333"
              style={styles.arrowIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('PartnerRegister')}>
            <Text style={styles.menuText}>Become Partner</Text>
            <Icon
              name="chevron-forward"
              size={scaleFont(20)}
              color="#333"
              style={styles.arrowIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Settings</Text>
            <Icon
              name="chevron-forward"
              size={scaleFont(20)}
              color="#333"
              style={styles.arrowIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Help Centre</Text>
            <Icon
              name="chevron-forward"
              size={scaleFont(20)}
              color="#333"
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            dispatch(logout());
            dispatch(clearCart());
            navigation.replace('Login');
          }}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MyAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
  },
  backIcon: {width: 24, height: 24, resizeMode: 'contain', marginRight: 8},
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
    marginLeft: 12,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  searchIcon: {
    marginRight: 16,
  },
  cartIconWrapper: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B00',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  profileLogo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 16,
  },
  greeting: {
    fontSize: 32,
    color: '#000',
    fontFamily: 'Poppins-Medium',
  },
  menuContainer: {
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuText: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  arrowIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  logoutButton: {
    backgroundColor: '#FF6B00',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uhOhText: {fontSize: 26, fontWeight: 'bold', marginBottom: 10},
  popupSubtitle: {fontSize: 14, color: '#666', marginBottom: 20},
  loginButton: {
    backgroundColor: '#f37022',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginBottom: 20,
  },
  loginButtonText: {color: '#fff', fontSize: 14, fontWeight: 'bold'},
  helpText: {fontSize: 12, color: '#666'},
  helpLink: {color: '#f37022', fontWeight: 'bold'},
});
