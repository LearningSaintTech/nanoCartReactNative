// // PromoBanner.js
// import React from 'react';
// import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

// const { width } = Dimensions.get('window');

// const PromoBanner = () => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Deals you don't want to miss</Text>
//       <View style={styles.bannerCard}>
//         <Image
//           source={require('../../assets/Images/Promo.png')}
//           style={styles.bannerImage}
//           resizeMode="stretch"
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginVertical: 10,
//     paddingHorizontal: 0, // Removed horizontal padding to allow full width
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '600',
//     marginBottom: 10,
//     paddingHorizontal: 16, // Added padding to title only
//   },
//   bannerCard: {
//     width: width, // Full screen width
//     height: width * 0.5, // Aspect ratio of roughly 2:1
//     backgroundColor: '#E8F4FF',
//   },
//   bannerImage: {
//     width: '100%',
//     height: '100%',
//   },
// });

// export default PromoBanner;




import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const PromoBanner = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deals you don't want to miss</Text>
      <View style={styles.bannerCard}>
        <Image
          source={require('../../assets/Images/Promo.png')}
          style={styles.bannerImage}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: hp('2%'),
    paddingHorizontal: 0,
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: '600',
    marginBottom: hp('2%'),
    paddingHorizontal: wp('4%'),
  },
  bannerCard: {
    width: wp('100%'),
    height: wp('50%'),
    maxHeight: 300,
    backgroundColor: '#E8F4FF',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
});

export default PromoBanner;