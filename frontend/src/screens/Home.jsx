import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, ImageBackground } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Hero Section with Gradient */}
      <LinearGradient
        colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
        style={styles.heroGradient}
      >
        <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
          <Text style={styles.logoText}>EnerGauge</Text>
          <Text style={styles.subtitle}>Smart Energy, Brighter Future</Text>
          <View style={styles.heroImageContainer}>
            <Image 
              source={require("../../assets/images/home.png")} 
              style={styles.heroImage} 
            />
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Mission Statement Card */}
      <Animated.View entering={FadeIn.duration(1000)} style={styles.missionCard}>
        <Text style={styles.missionText}>
          Revolutionizing energy management through cutting-edge forecasting & insights
        </Text>
        <Button
          mode="contained"
          icon="arrow-right"
          style={styles.ctaButton}
          labelStyle={styles.buttonText}
          onPress={() => navigation.navigate("UserLogin")}
        >
          Get Started
        </Button>
      </Animated.View>

      {/* Features Grid */}
      <Animated.View entering={FadeInDown.duration(800)} style={styles.featuresGrid}>
        <Text style={styles.sectionTitle}>Why Choose EnerGauge?</Text>
        
        <View style={styles.gridContainer}>
          <View style={[styles.featureBox, styles.featureBoxLeft]}>
            <MaterialCommunityIcons name="flash" size={35} color="#388E3C" />
            <Text style={styles.featureTitle}>Smart Monitoring</Text>
            <Text style={styles.featureText}>Real-time energy tracking</Text>
          </View>
          
          <View style={[styles.featureBox, styles.featureBoxRight]}>
            <MaterialCommunityIcons name="chart-line" size={35} color="#388E3C" />
            <Text style={styles.featureTitle}>AI Predictions</Text>
            <Text style={styles.featureText}>Advanced forecasting</Text>
          </View>
        </View>

        <View style={styles.gridContainer}>
          <View style={[styles.featureBox, styles.featureBoxLeft]}>
            <MaterialCommunityIcons name="currency-usd" size={35} color="#388E3C" />
            <Text style={styles.featureTitle}>Cost Savings</Text>
            <Text style={styles.featureText}>Optimize expenses</Text>
          </View>
          
          <View style={[styles.featureBox, styles.featureBoxRight]}>
            <MaterialCommunityIcons name="leaf" size={35} color="#388E3C" />
            <Text style={styles.featureTitle}>Eco-Friendly</Text>
            <Text style={styles.featureText}>Sustainable solutions</Text>
          </View>
        </View>
      </Animated.View>

      {/* Bottom CTA Section */}
      <Animated.View entering={FadeInUp.duration(800)} style={styles.bottomCta}>
        <LinearGradient
          colors={['#A5D6A7', '#81C784']}
          style={styles.ctaGradient}
        >
          <Text style={styles.ctaTitle}>Ready to Transform?</Text>
          <Text style={styles.ctaSubtext}>Join the energy revolution today</Text>
          <Button
            mode="contained"
            icon="information"
            style={styles.learnMoreButton}
            labelStyle={styles.learnMoreButtonText}
            onPress={() => navigation.navigate("AboutUs")}
          >
            About Us
          </Button>
        </LinearGradient>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  heroGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    alignItems: "center",
  },
  logoText: {
    fontSize: 42,
    fontWeight: "900",
    color: "#2E7D32",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1B5E20",
    marginTop: 10,
  },
  heroImageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  heroImage: {
    width: width * 0.8,
    height: width * 0.5,
    resizeMode: "contain",
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    marginTop: -30,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  missionText: {
    fontSize: 18,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: "#43A047",
    borderRadius: 25,
    marginTop: 20,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    color:"#fff",
    fontWeight: "bold",
    paddingVertical: 3,
  },
  featuresGrid: {
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 25,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  featureBox: {
    width: '48%',
    backgroundColor: '#F1F8E9',
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    elevation: 2,
  },
  featureBoxLeft: {
    transform: [{translateX: -10}],
  },
  featureBoxRight: {
    transform: [{translateX: 10}],
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E7D32",
    marginTop: 10,
  },
  featureText: {
    fontSize: 14,
    textAlign: "center",
    color: "#558B2F",
    marginTop: 5,
  },
  bottomCta: {
    marginTop: 30,
    marginBottom: 40,
  },
  ctaGradient: {
    marginHorizontal: 20,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  ctaSubtext: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 5,
    marginBottom: 20,
  },
  learnMoreButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 30,
  },
  learnMoreButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    paddingVertical: 3,
  },
});

export default HomeScreen;
