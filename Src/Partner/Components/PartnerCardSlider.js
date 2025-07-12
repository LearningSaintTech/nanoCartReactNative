import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BASE_URL } from '../../config/apiConfig';
const PartnerCardSlider = ({ images }) => {
  const screenWidth = Dimensions.get('window').width;
const [items, setItems] = useState([]);
  const navigation = useNavigation();
    useEffect(() => {
      // Fetch items from the API
      fetch(`${BASE_URL}/items`)
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
             <View key={item._id} style={[styles.card, { width: screenWidth * 0.8 }]}>
               <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
               <View style={styles.overlay}>
                 <TouchableOpacity 
                   style={styles.shopButton}
                   onPress={() => navigation.navigate('PartnerProductDetail', { itemId: item._id })}
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
    height: 480,
  },
  contentContainer: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  card: {
    height: 460,
    marginRight: 12,
    borderRadius: 4,
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
    marginTop:100,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 140,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  errorText: {
    color: 'red',
    padding: 10,
  },
});

export default PartnerCardSlider;
