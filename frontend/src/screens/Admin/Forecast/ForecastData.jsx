import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ForecastData = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Forecast Data</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});

export default ForecastData;
