import React, {useEffect, useState} from 'react';
import {AppState} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {store, persistor} from './Src/redux/store';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {setCartItems} from './Src/redux/reducers/cartSlice';

// Screens
import SplashScreen from './Src/UserFlow/Screen/SplashScreen';
import LoginScreen from './Src/UserFlow/Screen/LoginScreen';
import RegisterScreen from './Src/UserFlow/Screen/UserRegisterScreen';
import LoginVerifyOtpScreen from './Src/UserFlow/Screen/LoginVerifyOtpScreen';
import RegisterVerificationScreen from './Src/UserFlow/Screen/RegisterVerificationScreen';
import PartnerRegisterScreen from './Src/Partner/Screens/PartnerRegisterScreen';
import BottomTabBar from './Src/UserFlow/Component/BottomTabBar';
import PromoBanner from './Src/UserFlow/Component/PromoBanner';
import CardSlider from './Src/UserFlow/Component/CardSlider';
import SearchCategory from './Src/UserFlow/Screen/SearchCategory';
import SubCategoryScreen from './Src/UserFlow/Screen/SubCategoryScreen';
import ProductDetailScreen from './Src/UserFlow/Screen/ProductDetailScreen';
import ProductDetailPhotoScreen from './Src/UserFlow/Screen/ProductDetailPhotoScreen';
import SizeChartScreen from './Src/UserFlow/Screen/SizeChartScreen';
import CartScreen from './Src/UserFlow/Screen/CartScreen';
import DeliveryAddressScreen from './Src/UserFlow/Screen/DeliveryAddressScreen';
import AddNewAddressScreen from './Src/UserFlow/Screen/AddNewAddressScreen';
import EditScreen from './Src/UserFlow/Screen/EditScreen';
import PaymentScreen from './Src/UserFlow/Screen/PaymentScreen';
import MyAccountScreen from './Src/UserFlow/Screen/MyAccountScreen';
import WishlistScreen from './Src/UserFlow/Screen/WishlistScreen';
import SavedAddressScreen from './Src/UserFlow/Screen/SavedAddressScreen';
import ProfileScreen from './Src/UserFlow/Screen/ProfileScreen';
import RateProductScreen from './Src/UserFlow/Screen/RateProductScreen';
import OrderHistoryScreen from './Src/UserFlow/Screen/OrderHistoryScreen';
import TrackOrderScreen from './Src/UserFlow/Screen/TrackOrderScreen';
import OrderConfirmationScreen from './Src/UserFlow/Screen/OrderConfirmationScreen';
import CancelOrderScreen from './Src/UserFlow/Screen/CancelOrderScreen';
import ReturnExchangeScreen from './Src/UserFlow/Screen/ReturnExchnageScreen';
import ReturnConfirmationScreen from './Src/UserFlow/Screen/ReturnConfirmationScreen';
import TBYBScreen from './Src/UserFlow/Screen/TBYBScreen';
import UploadTBYB from './Src/UserFlow/Screen/UploadTBYB';

// Partner Screens
import PartnerBottomTabBar from './Src/Partner/Components/PartnerBottomTabBar';
import PartnerSearchCategory from './Src/Partner/Screens/PartnerSearchCategoryScreen';
import PartnerSubCategoryScreen from './Src/Partner/Screens/PartnerSubCategoryScreen';
import PartnerProductDetail from './Src/Partner/Screens/PartnerProductDetail';
import PartnerSizeChartScreen from './Src/Partner/Screens/PartnerSizeChartScreen';
import PartnerAddNewAddressScreen from './Src/Partner/Screens/PartnerAddNewAddressScreen';
import PartnerDeliveryAddressScreen from './Src/Partner/Screens/PartnerDeliveryAddressScreen';
import PartnerEditScreen from './Src/Partner/Screens/PartnerEditScreen';
import PartnerSavedAddressScreen from './Src/Partner/Screens/PartnerSavedAddressScreen';
import PartnerProfileScreen from './Src/Partner/Screens/PartnerProfileScreen';
import PartnerAccountScreen from './Src/Partner/Screens/PartnerAccountScreen';
import PartnerCatalogueScreen from './Src/Partner/Screens/PartnerCatalogueScreen';
import PartnerWalletScreen from './Src/Partner/Screens/PartnerWalletScreen';
import PartnerOrderConfirmationScreen from './Src/Partner/Screens/PartnerOrderConfirmScreen';
import PartnerOrderHistoryScreen from './Src/Partner/Screens/PartnerOrderHistoryScreen';
import PartnerCartScreen from './Src/Partner/Screens/PartnerCartScreen';
import PartnerWishlistScreen from './Src/Partner/Screens/PartnerWishlistScreen';
import PartnerPaymentScreen from './Src/Partner/Screens/PartnerPaymentScreen';
import PartnerProductDetailPhotoScreen from './Src/Partner/Screens/PartnerProductDetailPhotoScreen';
import PartnerTrackOrderScreen from './Src/Partner/Screens/PartnerTrackOrderScreen';
import PartnerReturnOrderScreen from './Src/Partner/Screens/PartnerReturnOrderScreen';
import { BASE_URL } from './Src/config/apiConfig';

const Stack = createStackNavigator();

// 🔐 Auth + Skip flow screens
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="UserRegister" component={RegisterScreen} />
    <Stack.Screen name="LoginVerifyOtp" component={LoginVerifyOtpScreen} />
    <Stack.Screen
      name="RegisterVerifyOtp"
      component={RegisterVerificationScreen}
    />
    <Stack.Screen name="BottomTabBar" component={BottomTabBar} />
    <Stack.Screen name="Search" component={SearchCategory} />
    <Stack.Screen name="PartnerSearch" component={PartnerSearchCategory} />
    <Stack.Screen name="SubCategory" component={SubCategoryScreen} />
    <Stack.Screen
      name="PartnerSubCategory"
      component={PartnerSubCategoryScreen}
    />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen
      name="PartnerProductDetail"
      component={PartnerProductDetail}
    />
    <Stack.Screen name="PartnnerHome" component={PartnerBottomTabBar} />
  </Stack.Navigator>
);

// 👤 User stack
const UserNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="UserHome" component={BottomTabBar} />
    <Stack.Screen name="Promo" component={PromoBanner} />
    <Stack.Screen name="Card" component={CardSlider} />
    <Stack.Screen name="Search" component={SearchCategory} />
    <Stack.Screen name="SubCategory" component={SubCategoryScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen
      name="ProductDetailPhoto"
      component={ProductDetailPhotoScreen}
    />
    <Stack.Screen name="SizeChart" component={SizeChartScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Delivery" component={DeliveryAddressScreen} />
    <Stack.Screen name="AddNewAddress" component={AddNewAddressScreen} />
    <Stack.Screen name="edit" component={EditScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="Account" component={MyAccountScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="RateProduct" component={RateProductScreen} />
    <Stack.Screen name="Saved" component={SavedAddressScreen} />
    <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    <Stack.Screen
      name="OrderConfirmation"
      component={OrderConfirmationScreen}
    />
    <Stack.Screen name="CancelOrder" component={CancelOrderScreen} />
    <Stack.Screen name="ReturnExchange" component={ReturnExchangeScreen} />
    <Stack.Screen name="ReturnConfirm" component={ReturnConfirmationScreen} />
    <Stack.Screen name="TBYB" component={TBYBScreen} />
    <Stack.Screen name="PartnerRegister" component={PartnerRegisterScreen} />
    <Stack.Screen name="UploadTBYB" component={UploadTBYB} />
  </Stack.Navigator>
);

//  Partner stack
const PartnerNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="PartnnerHome" component={PartnerBottomTabBar} />
    <Stack.Screen name="PartnerSearch" component={PartnerSearchCategory} />
    <Stack.Screen
      name="PartnerSubCategory"
      component={PartnerSubCategoryScreen}
    />
    <Stack.Screen
      name="PartnerProductDetail"
      component={PartnerProductDetail}
    />
    <Stack.Screen name="PartnerSizeChart" component={PartnerSizeChartScreen} />
    <Stack.Screen
      name="PartnerAddNewAddress"
      component={PartnerAddNewAddressScreen}
    />
    <Stack.Screen
      name="PartnerDelivery"
      component={PartnerDeliveryAddressScreen}
    />
    <Stack.Screen name="PartnerEdit" component={PartnerEditScreen} />
    <Stack.Screen
      name="PartnerSavedAddress"
      component={PartnerSavedAddressScreen}
    />
    <Stack.Screen name="PartnerProfile" component={PartnerProfileScreen} />
    <Stack.Screen name="PartnerAccount" component={PartnerAccountScreen} />
    <Stack.Screen name="PartnerCatalogue" component={PartnerCatalogueScreen} />
    <Stack.Screen name="PartnerWallet" component={PartnerWalletScreen} />
    <Stack.Screen
      name="PartnerOrderConfirmation"
      component={PartnerOrderConfirmationScreen}
    />
    <Stack.Screen
      name="PartnerOrderHistory"
      component={PartnerOrderHistoryScreen}
    />
    <Stack.Screen name="PartnerCart" component={PartnerCartScreen} />
    <Stack.Screen name="PartnerWishlist" component={PartnerWishlistScreen} />
    <Stack.Screen name="PartnerPayment" component={PartnerPaymentScreen} />
    <Stack.Screen
      name="PartnerProductPhoto"
      component={PartnerProductDetailPhotoScreen}
    />
    <Stack.Screen
      name="PartnerTrackOrderScreen"
      component={PartnerTrackOrderScreen}
    />
    <Stack.Screen
      name="PartnerReturnOrderScreen"
      component={PartnerReturnOrderScreen}
    />
  </Stack.Navigator>
);

// 🚦 Main navigator (role-based decision)
const MainNavigator = () => {
  const token = useSelector(state => state.auth.token);
  const role = useSelector(state => state.auth.role);

  const dispatch = useDispatch();

  // Fetch cart on app startup and when app comes to foreground
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const endpoint =
          role === 'Partner'
            ? `${BASE_URL}/partner/cart`
            : `${BASE_URL}/api/usercart`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {Authorization: `Bearer ${token}`},
        });
        const data = await response.json();
        if (response.ok) {
          dispatch(setCartItems(data.data.items || []));
        } else {
          console.warn('Failed to fetch cart:', data.message);
        }
      } catch (error) {
        console.error('Cart load error:', error);
      }
    };

    if (token) {
      fetchCartItems();
    }

    // Re-fetch cart when app comes to foreground
    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'active' && token) {
        fetchCartItems();
      }
    };
    const listener = AppState.addEventListener('change', handleAppStateChange);
    return () => listener.remove();
  }, [token, role, dispatch]);

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {token ? (
        role === 'Partner' ? (
          <Stack.Screen name="Partner" component={PartnerNavigator} />
        ) : (
          <Stack.Screen name="User" component={UserNavigator} />
        )
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

//  App Entry Point
const App = () => {
  const [rehydrated, setRehydrated] = useState(false);

  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'background') {
        persistor
          .flush()
          .then(() => console.log('Persistor flushed'))
          .catch(error => console.error('Flush error:', error));
      }
    };
    const listener = AppState.addEventListener('change', handleAppStateChange);
    return () => listener.remove();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate
        persistor={persistor}
        onBeforeLift={() => setRehydrated(true)}>
        {rehydrated ? (
          <NavigationContainer>
            <MainNavigator />
          </NavigationContainer>
        ) : null}
      </PersistGate>
    </Provider>
  );
};

export default App;
