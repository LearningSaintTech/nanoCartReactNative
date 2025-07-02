import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

import PartnerHomeScreen from '../Screens/PartnerHomeScreen';
import PartnerWishlistScreen from '../Screens/PartnerWishlistScreen';
import PartnerMyAccountScreen from './PartnerMyAccountScreen';

 const homeIcon = require('../../assets/Images/HOME.png');
 const wishlistIcon = require('../../assets/Images/Wishlist.png');
 const AccountIcon = require('../../assets/Images/MyAccount.png');

const Tab = createBottomTabNavigator();

const PartnerBottomTabBar = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopWidth: 0,
          height: 80,
          paddingTop:15
        },
        headerShown: false,
        tabBarShowLabel: false, 
        tabBarIcon: ({ focused }) => {
          let iconSource;
          switch (route.name) {
            case 'Home':
              iconSource = homeIcon;
              break;
            case 'wishlist':
              iconSource = wishlistIcon;
              break;
            case 'Account':
              iconSource = AccountIcon;
              break;
          
          }
          return (
            <Image
              source={iconSource}
              style={{
                width: 24 ,
                height: 24,
                tintColor: focused ? '#fff' : '#999', 
              }}
              resizeMode="contain"
            />
          );
        },
      })}>
      <Tab.Screen name="Home" component={PartnerHomeScreen} />
      <Tab.Screen name="wishlist" component={PartnerWishlistScreen} />
      <Tab.Screen name="Account" component={PartnerMyAccountScreen} />
    </Tab.Navigator>
  );
};

export default PartnerBottomTabBar;
