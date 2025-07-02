import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const SuggestionCard = ({
  title,
  productImage,
  productName,
  productDesc,
  price,
  oldPrice,
  discount,
  rating,
  reviews,
  sizes,
  colors,
  buttonLabel,
  onButtonPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.card}>
        <Image source={productImage} style={styles.image} />

        <View style={styles.details}>
          <Text style={styles.name}>{productName}</Text>
          <Text style={styles.desc}>{productDesc}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{price}</Text>
            <Text style={styles.oldPrice}>₹{oldPrice}</Text>
            <Text style={styles.discount}>Flat {discount}% Off</Text>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.ratingBox}>
              <Icon name="star" size={10} color="#fff" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
            <Text style={styles.review}>{reviews}</Text>
          </View>

          <Text style={styles.sizeText}>Available in {sizes.join(', ')}</Text>

          <View style={styles.colorRow}>
            {colors.map((color, index) => (
              <View
                key={index}
                style={[styles.colorDot, { backgroundColor: color }]}
              />
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={onButtonPress}>
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    width: 100,
    height: 130,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  oldPrice: {
    fontSize: 12,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  discount: {
    fontSize: 12,
    color: '#FF6B00',
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  review: {
    fontSize: 12,
    color: '#666666',
  },
  sizeText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  button: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FF6B00',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 4,
  },
  buttonText: {
    color: '#FF6B00',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SuggestionCard;
