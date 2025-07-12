import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const SortComponent = ({ onClose, onApplySort, selectedSort }) => {
  const [currentSort, setCurrentSort] = React.useState(selectedSort || 'latestAddition');

  const sortOptions = [
    { label: 'Latest', value: 'latestAddition' },
    { label: 'Popularity', value: 'popularity' },
    { label: 'Price: High to Low', value: 'priceHighToLow' },
    { label: 'Price: Low to High', value: 'priceLowToHigh' },
    { label: 'Offers & Discount', value: 'offer' },
  ];

  const applySort = () => {
    onApplySort(currentSort);
    onClose();
  };

  const clearSort = () => {
    setCurrentSort('latestAddition');
    onApplySort('latestAddition');
    onClose();
  };

  return (
    <View style={styles.modalContainer}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>SORT BY</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>

        {sortOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={styles.optionRow}
            onPress={() => setCurrentSort(option.value)}
          >
            <Text
              style={[
                styles.optionText,
                currentSort === option.value && styles.selectedOption,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.clearButton} onPress={clearSort}>
          <Text style={styles.clearButtonText}>CLEAR ALL</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyButton} onPress={applySort}>
          <Text style={styles.applyButtonText}>APPLY</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    maxHeight: '55%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeText: {
    fontSize: 24,
    color: '#000',
  },
  optionRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
  },
  selectedOption: {
    color: '#D86427',
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#D86427',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D86427',
  },
  clearButtonText: {
    color: '#D86427',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SortComponent;