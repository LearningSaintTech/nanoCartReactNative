import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRoute, useNavigation } from '@react-navigation/native';

const PartnerSizeChartScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { sizeChart = [], howToMeasure = [] } = route.params || {};

  const [unit, setUnit] = useState('inches');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SIZE CHART</Text>
      </View>

      {/* Unit Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, unit === 'inches' && styles.activeTab]}
          onPress={() => setUnit('inches')}>
          <Text style={[styles.tabText, unit === 'inches' && styles.activeTabText]}>In Inches</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, unit === 'cm' && styles.activeTab]}
          onPress={() => setUnit('cm')}>
          <Text style={[styles.tabText, unit === 'cm' && styles.activeTabText]}>In CM</Text>
        </TouchableOpacity>
      </View>

      {/* Size Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Size</Text>
          <Text style={styles.tableHeaderText}>Chest</Text>
          <Text style={styles.tableHeaderText}>Shoulder</Text>
          <Text style={styles.tableHeaderText}>Length</Text>
        </View>
        {sizeChart.map((row, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{row.size}</Text>
            <Text style={styles.tableCell}>{row[unit]?.chest}</Text>
            <Text style={styles.tableCell}>{row[unit]?.shoulder}</Text>
            <Text style={styles.tableCell}>{row[unit]?.length}</Text>
          </View>
        ))}
      </View>

      {/* How To Measure */}
      <View style={styles.howToMeasureSection}>
        <View style={styles.howToMeasureHeader}>
          <Text style={styles.howToMeasureTitle}>How to Measure</Text>
        </View>
        {howToMeasure.map((item, idx) => {
          const [key] = Object.keys(item);
          return (
            <View key={idx} style={styles.measureItem}>
              <Text style={styles.measureKey}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
              <Text style={styles.measureValue}>{item[key]}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default PartnerSizeChartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#F57C00',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#F57C00',
    fontWeight: 'bold',
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    fontSize: 15,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
    fontSize: 15,
  },
  howToMeasureSection: {
    marginTop: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#f3e1d0',
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  howToMeasureHeader: {
    backgroundColor: '#fbeee3',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3e1d0',
  },
  howToMeasureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  measureItem: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  measureKey: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    fontSize: 15,
  },
  measureValue: {
    color: '#444',
    fontSize: 14,
    marginBottom: 6,
  },
});
