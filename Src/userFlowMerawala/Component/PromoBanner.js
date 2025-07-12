import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const PromoBanner = () => {
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