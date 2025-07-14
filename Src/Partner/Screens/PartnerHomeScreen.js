import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <PartnerHeader />
        </View>
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
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    marginTop: 60, // Adjust based on header height
  },
  contentContainer: {
    paddingBottom: 20,
  },
  sliderWrapper: {
    height: 320,
  },
});

export default PartnerHomeScreen;