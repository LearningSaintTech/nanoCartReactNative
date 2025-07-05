import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import PartnerHomeScreen from '../Screens/PartnerHomeScreen';
import PartnerWishlistScreen from '../Screens/PartnerWishlistScreen';
import PartnerMyAccountScreen from './PartnerMyAccountScreen';

const Tab = createBottomTabNavigator();

const PartnerBottomTabBar = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopWidth: 0,
          height: 80,
          paddingTop: 15,
        },
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'wishlist':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'Account':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={26} color={focused ? '#D2691E' : '#999'} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={PartnerHomeScreen} />
      <Tab.Screen name="wishlist" component={PartnerWishlistScreen} />
      <Tab.Screen name="Account" component={PartnerMyAccountScreen} />
    </Tab.Navigator>
  );
};

export default PartnerBottomTabBar;
