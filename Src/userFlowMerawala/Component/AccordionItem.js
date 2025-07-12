import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AccordionItem = ({ title, children }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggleExpand}>
        <Text style={styles.title}>{title}</Text>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={20} />
      </TouchableOpacity>
      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const PincodeChecker = ({ deliveryPincode }) => {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState(null);

  const handleCheck = () => {
    if (!pincode) return;
    if (deliveryPincode.includes(Number(pincode))) {
      setResult('available');
    } else {
      setResult('not_available');
    }
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 4,
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: '#fff',
            fontSize: 15,
          }}
          placeholder="Enter Pincode"
          keyboardType="numeric"
          value={pincode}
          onChangeText={setPincode}
          maxLength={6}
        />
        <TouchableOpacity
          style={{
            backgroundColor: '#FF6B00',
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 4,
            marginLeft: 8,
          }}
          onPress={handleCheck}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>CHECK</Text>
        </TouchableOpacity>
      </View>
      {result === 'available' && (
        <Text style={{ color: 'green', fontSize: 14, marginTop: 2 }}>
          Delivery available to this pincode!
        </Text>
      )}
      {result === 'not_available' && (
        <Text style={{ color: 'red', fontSize: 14, marginTop: 2 }}>
          Sorry, delivery is not available to this pincode.
        </Text>
      )}
    </View>
  );
};

export default AccordionItem;

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  content: {
    paddingVertical: 10,
  },
});
