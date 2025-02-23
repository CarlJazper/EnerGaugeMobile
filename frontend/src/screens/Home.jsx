import React from 'react';
import { Text, View, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const Home = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <LinearGradient
          colors={['#43a047', '#1b5e20']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Text style={styles.title}>EnerGauge</Text>
            <Text style={styles.subtitle}>Energy Consumption and Demand Forecasting</Text>
          </View>
        </LinearGradient>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UserLogin')}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.aboutButton]} onPress={() => navigation.navigate('AboutUs')}>
            <Text style={styles.buttonText}>About Us</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.bodyText}>
              To empower individuals and businesses with data-driven insights for efficient energy consumption and sustainable resource management.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Vision</Text>
            <Text style={styles.bodyText}>
              A world where energy efficiency is maximized, waste is minimized, and sustainability is at the core of decision-making.
            </Text>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={require('../../assets/images/home.png')}
              style={styles.image}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#e8f5e9',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -25,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginHorizontal: 10,
    elevation: 3,
  },
  aboutButton: {
    backgroundColor: '#1E88E5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#f1f8e9',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    resizeMode: 'cover',
  },
});

export default Home;
