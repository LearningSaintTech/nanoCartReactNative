import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const products = [
  {
    id: '1',
    name: 'MAAHI Winter Hoodie',
    category: 'Unisex Collections',
    dateAdded: '3rd March',
    image: require('../../assets/Images/Carosuel1.png'),
  },
  {
    id: '2',
    name: 'MAAHI Winter Hoodie',
    category: 'Unisex Collections',
    dateAdded: '3rd March',
    image: require('../../assets/Images/Carosuel1.png'),
  },
  {
    id: '3',
    name: 'MAAHI Winter Hoodie',
    category: 'Unisex Collections',
    dateAdded: '3rd March',
    image: require('../../assets/Images/Carosuel1.png'),
  },
];

const TBYBScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image source={item.image} style={styles.image} />
        {/* <TouchableOpacity style={styles.deleteIcon}>
          <Image source={require('../../assets/Images/delete.png')} style={styles.deleteImg} />
        </TouchableOpacity> */}
      </View>
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.date}>Added on {item.dateAdded}</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>VIEW PRODUCT</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TBYB</Text>
        {/* <TouchableOpacity>
          <Image source={require('../../assets/Images/info.png')} style={styles.infoIcon} />
        </TouchableOpacity> */}
      </View>

      {/* Grid */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderItem}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  backArrow: { fontSize: 20, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  infoIcon: { width: 20, height: 20, resizeMode: 'contain' },

  card: {
    backgroundColor: '#fff',
    width: (width - 40) / 2,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 170,
    resizeMode: 'cover',
  },
  deleteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
  },
  deleteImg: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  details: {
    padding: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  category: {
    fontSize: 11,
    color: '#777',
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    color: '#D6722F',
  },
  button: {
    backgroundColor: '#D6722F',
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TBYBScreen;
