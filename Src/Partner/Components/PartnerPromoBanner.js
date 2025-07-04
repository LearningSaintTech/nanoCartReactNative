// // PromoBanner.js
// import React from 'react';
// import { View, Text, Image, StyleSheet } from 'react-native';

// const PartnerPromoBanner = () => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Deals you don’t want to miss</Text>
//       <View style={styles.bannerCard}>
//         <Image
//           source={require('../../assets/Images/Promo.png')}
//           style={styles.bannerImage}
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginVertical: 20,
//     paddingHorizontal: 16,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 10,
//   },
//   bannerCard: {
//     borderRadius: 8,
//     overflow: 'hidden',
//     elevation: 3,
//     backgroundColor: '#fff',
//   },
//   bannerImage: {
//     width: '100%',
//     height: 200, 
//     resizeMode: 'cover',
//   },
// });

// export default PartnerPromoBanner;



// PromoBanner.js
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const PartnerPromoBanner = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deals you don't want to miss</Text>
      <View style={styles.bannerCard}>
        <Image
          source={require('../../assets/Images/Summer.png')}
          style={styles.bannerImage}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 0, // Removed horizontal padding to allow full width
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
    paddingHorizontal: 26, // Added padding to title only
        marginVertical: 10,

  },
  bannerCard: {
    width: width, // Full screen width
    height: width * 0.5, // Aspect ratio of roughly 2:1
    backgroundColor: '#E8F4FF',
        marginVertical: 10,

  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
});

export default PartnerPromoBanner;