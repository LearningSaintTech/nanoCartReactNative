import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const CategoryGrid = ({ data, onItemPress }) => {
  const numColumns = 3;
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 48) / numColumns; // 48 = padding (16 * 2) + gaps (8 * 2)

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {data.map((item, index) => (
          <TouchableOpacity
            key={item._id}
            style={[styles.item, { width: itemWidth }]}
            onPress={() => onItemPress(item)}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  item: {
    marginBottom: 16,
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  itemText: {
    fontSize: 13,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '400',
  },
});

export default CategoryGrid;