import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const PADDING = 16;
const COLUMN_GAP = 12;
const NUM_COLUMNS = 3;
const ITEM_WIDTH = (width - (2 * PADDING) - (2 * COLUMN_GAP)) / NUM_COLUMNS;

const PartnerCategoryGrid = ({ data, onItemPress }) => {
  const rows = [];
  for (let i = 0; i < data.length; i += 3) {
    rows.push(data.slice(i, i + 3));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item, index) => (
            <TouchableOpacity
              key={item._id}
              style={styles.item}
              onPress={() => onItemPress(item)}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                // defaultSource={require('../../assets/Images/placeholder.png')}
              />
              <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>
          ))}
          {row.length < 3 && [...Array(3 - row.length)].map((_, i) => (
            <View key={`empty-${i}`} style={styles.item} />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  item: {
    width: ITEM_WIDTH,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.2,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default PartnerCategoryGrid;