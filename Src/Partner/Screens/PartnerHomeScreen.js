import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import PartnerHeader from '../Components/PartnerHeader';
import PartnerCarouselSlider from '../Components/PartnerCarouselSlider';
import PartnerPromoBanner from '../Components/PartnerPromoBanner';
import PartnerCardSlider from '../Components/PartnerCardSlider';
import PartnerTrendingDeals from '../Components/PartnerTrendingDeals';

const PartnerHomeScreen = () => {
  const images = [
    require('../../assets/Images/card1.png'),
    require('../../assets/Images/card1.png'),
    require('../../assets/Images/card1.png'),
    require('../../assets/Images/card1.png'),
    require('../../assets/Images/card1.png'),
  ];

  console.log('partner HomeScreen images of [partner flow]:', images);

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <PartnerHeader />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <PartnerCarouselSlider />
        <PartnerPromoBanner />
        <View style={styles.sliderWrapper}>
          <PartnerCardSlider images={images} />
        </View>
        <PartnerTrendingDeals />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  sliderWrapper: {
    height: 320,
  },
});

export default PartnerHomeScreen;