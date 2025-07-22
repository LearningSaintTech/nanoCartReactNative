
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const PartnerPromoBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('https://api.maahi.lifestyle/api/home-page-banner', {
          headers: {
            Authorization: 'Bearer YOUR_BEARER_TOKEN', // Replace with your actual token
          },
        });
        const data = await response.json();
        if (data.banners) {
          setBanners(data.banners);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };
    fetchBanners();
  }, []);

  // Automatic carousel scroll
  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        if (flatListRef.current) {
          const nextIndex = (currentIndex + 1) % banners.length;
          flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
          setCurrentIndex(nextIndex);
        }
      }, 3000); // Scroll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [currentIndex, banners]);

  // Render each banner item
  const renderItem = ({ item }) => (
    <View style={styles.bannerCard}>
      <Image
        source={{ uri: item.bannerImageUrl }}
        style={styles.bannerImage}
        resizeMode="stretch"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deals you don't want to miss</Text>
      {banners.length > 0 ? (
        <>
          <FlatList
            ref={flatListRef}
            data={banners}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            onScrollToIndexFailed={(info) => {
              // Fallback for scrollToIndex failure
              flatListRef.current.scrollToOffset({
                offset: info.index * wp('100%'),
                animated: true,
              });
            }}
          />
          <View style={styles.dotContainer}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.bannerCard}>
          <Image
            source={require('../../assets/Images/Summer.png')}
            style={styles.bannerImage}
            resizeMode="stretch"
          />
        </View>
      )}
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
  dotContainer: {
    position: 'absolute',
    bottom: hp('1%'),
    alignSelf: 'center',
    flexDirection: 'row',
  },
  dot: {
    height: hp('1%'),
    width: wp('2%'),
    backgroundColor: '#FFFFFF',
    borderRadius: wp('1%'),
    marginHorizontal: wp('1%'),
  },
  activeDot: {
    width: wp('6%'),
    backgroundColor: '#000000',
  },
});

export default PartnerPromoBanner;