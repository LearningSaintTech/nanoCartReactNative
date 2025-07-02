// // import React, { useEffect } from 'react';
// // import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
// // import { useNavigation } from '@react-navigation/native';

// // const CardSlider = ({ images }) => {
// //   const screenWidth = Dimensions.get('window').width;
// //   const navigation = useNavigation();

// //   // Log images prop with detailed information
// //   useEffect(() => {
// //     console.log('CardSlider Mounted - Images Prop:', {
// //       images,
// //       isArray: Array.isArray(images),
// //       length: images?.length || 0,
// //       sample: images?.slice(0, 2) || [],
// //       type: typeof images,
// //     });
// //   }, [images]);

// //   // Process images based on type (URL strings or static assets)
// //   const imageItems = Array.isArray(images)
// //     ? images
// //         .map((image, index) => {
// //           try {
// //             let uri;
// //             if (typeof image === 'string') {
// //               // Handle URL strings (e.g., from API)
// //               uri = image;
// //             } else if (typeof image === 'object' && image?.url) {
// //               // Handle objects with url property (e.g., imagesByColor[].images[])
// //               uri = image.url;
// //             } else if (image && Image.resolveAssetSource) {
// //               // Handle static assets
// //               uri = Image.resolveAssetSource(image)?.uri;
// //             } else {
// //               throw new Error('Invalid image format');
// //             }

// //             if (!uri) {
// //               throw new Error('No valid URI found');
// //             }

// //             return {
// //               _id: `image-${index}`, // Temporary ID; replace with actual itemId if available
// //               image: uri,
// //             };
// //           } catch (error) {
// //             console.error(`Error processing image at index ${index}:`, {
// //               image,
// //               error: error.message,
// //             });
// //             return null;
// //           }
// //         })
// //         .filter(item => item !== null)
// //     : [];

// //   console.log('Processed Image Items:', {
// //     imageItems,
// //     count: imageItems.length,
// //   });

// //   return (
// //     <ScrollView
// //       horizontal
// //       showsHorizontalScrollIndicator={false}
// //       style={styles.sliderContainer}
// //       contentContainerStyle={styles.contentContainer}
// //     >
// //       {imageItems.length > 0 ? (
// //         imageItems.map((item, index) => (
// //           <View key={item._id} style={[styles.card, { width: screenWidth * 0.8 }]}>
// //             <Image
// //               source={{ uri: item.image }}
// //               style={styles.image}
// //               resizeMode="cover"
// //               onError={(e) => console.error(`Image load error for ${item.image}:`, e.nativeEvent.error)}
// //             />
// //             <View style={styles.overlay}>
// //               <TouchableOpacity
// //                 style={styles.shopButton}
// //                 onPress={() => {
// //                   console.log('Shop Now Pressed:', { itemId: item._id, image: item.image });
// //                   navigation.navigate('ProductDetail', { itemId: item._id }); // Replace item._id with actual itemId
// //                 }}
// //               >
// //                 <Text style={styles.shopButtonText}>SHOP NOW</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         ))
// //       ) : (
// //         <View style={styles.errorContainer}>
// //           <Text style={styles.errorText}>No images to display</Text>
// //         </View>
// //       )}
// //     </ScrollView>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   sliderContainer: {
// //     height: 480,
// //   },
// //   contentContainer: {
// //     paddingLeft: 16,
// //     paddingRight: 16,
// //   },
// //   card: {
// //     height: 460,
// //     marginRight: 12,
// //     borderRadius: 4,
// //     overflow: 'hidden',
// //     backgroundColor: '#ffffff',
// //     position: 'relative',
// //   },
// //   image: {
// //     width: '100%',
// //     height: '100%',
// //   },
// //   overlay: {
// //     ...StyleSheet.absoluteFillObject,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   shopButton: {
// //     marginTop: 80,
// //     borderWidth: 1,
// //     borderColor: '#FFFFFF',
// //     paddingHorizontal: 32,
// //     paddingVertical: 12,
// //     minWidth: 140,
// //     alignItems: 'center',
// //     backgroundColor: 'transparent',
// //   },
// //   shopButtonText: {
// //     color: '#FFFFFF',
// //     fontSize: 14,
// //     fontWeight: '500',
// //     textTransform: 'uppercase',
// //     letterSpacing: 1,
// //   },
// //   errorContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     height: 480,
// //   },
// //   errorText: {
// //     color: 'red',
// //     padding: 10,
// //   },
// // });

// // export default CardSlider;




// import React, { useState, useEffect } from 'react';
// import { useNavigation } from '@react-navigation/native';

// import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';

// const CardSlider = ({ images }) => {
//   const screenWidth = Dimensions.get('window').width;
// const [items, setItems] = useState([]);
//   const navigation = useNavigation();
//     useEffect(() => {
//       // Fetch items from the API
//       fetch('http://192.168.1.17:4000/api/items')
//         .then(response => response.json())
//         .then(data => {
//           if (data.success && data.data && data.data.items) {
//             setItems(data.data.items);
//           }
//         })
//         .catch(error => {
//           console.error('Error fetching items:', error);
//         });
//     }, []);
//   return (
//     <ScrollView
//          horizontal
//          showsHorizontalScrollIndicator={false}
//          style={styles.sliderContainer}
//          contentContainerStyle={styles.contentContainer}
//        >
//          {items && items.length > 0 ? (
//            items.map((item, index) => (
//              <View key={item._id} style={[styles.card, { width: screenWidth * 0.8 }]}>
//                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
//                <View style={styles.overlay}>
//                  <TouchableOpacity 
//                    style={styles.shopButton}
//                    onPress={() => navigation.navigate('ProductDetail', { itemId: item._id })}
//                  >
//                    <Text style={styles.shopButtonText}>SHOP NOW</Text>
//                  </TouchableOpacity>
//                </View>
//              </View>
//            ))
//          ) : (
//            <Text style={styles.errorText}>No images to display</Text>
//          )}
//        </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   sliderContainer: {
//     height: 480,
//   },
//   contentContainer: {
//     paddingLeft: 16,
//     paddingRight: 16,
//   },
//   card: {
//     height: 460,
//     marginRight: 12,
//     borderRadius: 4,
//     overflow: 'hidden',
//     backgroundColor: '#ffffff',
//     position: 'relative',
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   shopButton: {
//     marginTop:100,
//     borderWidth: 1,
//     borderColor: '#FFFFFF',
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     minWidth: 140,
//     alignItems: 'center',
//     backgroundColor: 'transparent',
//   },
//   shopButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '500',
//     textTransform: 'uppercase',
//     letterSpacing: 1,
//   },
//   errorText: {
//     color: 'red',
//     padding: 10,
//   },
// });

// export default CardSlider;




import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const CardSlider = ({ images }) => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('http://192.168.1.17:4000/api/items')
      .then(response => response.json())
      .then(data => {
        if (data.success && data.data && data.data.items) {
          setItems(data.data.items);
        }
      })
      .catch(error => {
        console.error('Error fetching items:', error);
      });
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.sliderContainer}
      contentContainerStyle={styles.contentContainer}
    >
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <View key={item._id} style={[styles.card, { width: wp('80%') }]}>
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            <View style={styles.overlay}>
              <TouchableOpacity 
                style={styles.shopButton}
                onPress={() => navigation.navigate('ProductDetail', { itemId: item._id })}
              >
                <Text style={styles.shopButtonText}>SHOP NOW</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.errorText}>No images to display</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    height: hp('60%'),
    maxHeight: 500,
  },
  contentContainer: {
    paddingLeft: wp('4%'),
    paddingRight: wp('4%'),
  },
  card: {
    height: hp('55%'),
    maxHeight: 460,
    marginRight: wp('3%'),
    borderRadius: wp('1%'),
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopButton: {
    marginTop: hp('12%'),
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.5%'),
    minWidth: wp('35%'),
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  errorText: {
    color: 'red',
    padding: wp('3%'),
    fontSize: wp('4%'),
  },
});

export default CardSlider;
