// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Image } from 'react-native';
// import HomeScreen from '../Screen/HomeScreen';
// import WishlistScreen from '../Screen/WishlistScreen';
// import MyAccountScreen from '../Screen/MyAccountScreen';

//  const homeIcon = require('../../assets/Images/HOME.png');
//  const wishlistIcon = require('../../assets/Images/Wishlist.png');
//  const AccountIcon = require('../../assets/Images/MyAccount.png');

// const Tab = createBottomTabNavigator();

// const BottomTabBar = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarStyle: {
//           backgroundColor: '#000',
//           borderTopWidth: 0,
//           height: 80,
//           paddingTop:15
//         },
//         headerShown: false,
//         tabBarShowLabel: false, 
//         tabBarIcon: ({ focused }) => {
//           let iconSource;
//           switch (route.name) {
//             case 'Home':
//               iconSource = homeIcon;
//               break;
//             case 'wishlist':
//               iconSource = wishlistIcon;
//               break;
//             case 'Account':
//               iconSource = AccountIcon;
//               break;
          
//           }
//           return (
//             <Image
//               source={iconSource}
//               style={{
//                 width: 24 ,
//                 height: 24,
//                 tintColor: focused ? '#fff' : '#999', 
//               }}
//               resizeMode="contain"
//             />
//           );
//         },
//       })}>
//       <Tab.Screen name="Home" component={HomeScreen} />
//       <Tab.Screen name="wishlist" component={WishlistScreen} />
//       <Tab.Screen name="Account" component={MyAccountScreen} />
//     </Tab.Navigator>
//   );
// };

// export default BottomTabBar;




import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../Screen/HomeScreen';
import WishlistScreen from '../Screen/WishlistScreen';
import MyAccountScreen from '../Screen/MyAccountScreen';

const Tab = createBottomTabNavigator();

const BottomTabBar = () => {
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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="wishlist" component={WishlistScreen} />
      <Tab.Screen name="Account" component={MyAccountScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabBar;
