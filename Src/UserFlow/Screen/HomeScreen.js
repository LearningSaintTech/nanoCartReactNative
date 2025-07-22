
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import CarouselSlider from '../Component/CarouselSlider';
import Header from '../Component/Header';
import PromoBanner from '../Component/PromoBanner';
import CardSlider from '../Component/CardSlider';
import TrendingDeals from '../Component/TrendingDeals';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [triggerRefresh, setTriggerRefresh] = useState(false);

  const images = [
    require('../../assets/Images/card1.png'),
    require('../../assets/Images/card2.png'),
    require('../../assets/Images/card3.png'),
    require('../../assets/Images/card4.png'),
    require('../../assets/Images/card5.png'),
    require('../../assets/Images/card6.png'),
  ];

  // Handle pull-to-refresh
  const onRefresh = () => {
    console.log('Pull-to-refresh triggered');
    setRefreshing(true);
    setTriggerRefresh(true); // Trigger TrendingDeals refresh
  };

  // Handle refresh completion
  const handleRefreshComplete = () => {
    console.log('Refresh completed');
    setRefreshing(false);
    setTriggerRefresh(false);
  };

  // Refresh data when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('HomeScreen focused, triggering refresh');
      setTriggerRefresh(true);
    });
    return unsubscribe;
  }, [navigation]);

  console.log('HomeScreen rendering, triggerRefresh:', triggerRefresh);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + hp('4%') }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#FF6B00']}
          tintColor="#FF6B00"
        />
      }
    >
      <Header />
      <CarouselSlider />
      <PromoBanner />
      <View style={styles.sliderWrapper}>
        <CardSlider images={images || []} />
      </View>
      <TrendingDeals refreshDeals={triggerRefresh} onRefreshComplete={handleRefreshComplete} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: hp('4%'),
  },
  sliderWrapper: {
    height: hp('40%'),
    maxHeight: 400,
  },
});

export default HomeScreen;