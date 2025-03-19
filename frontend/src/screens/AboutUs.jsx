import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { Card, Surface } from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInRight } from "react-native-reanimated";

const AboutUs = () => {
  const features = [
    {
      icon: "lightning-bolt",
      title: "Energy Forecasting",
      description: "Advanced prediction models for accurate energy consumption forecasting"
    },
    {
      icon: "chart-line",
      title: "Analysis",
      description: "Detailed analysis of contributors on energy consuption"
    },
    {
      icon: "leaf",
      title: "Energy Saving",
      description: "Advanced prediction of energy saving"
    }
  ];

  const teamMembers = [
    { 
      name: "Carl Jazper C. Perez", 
      role: "BSIT Student", 
      img: require("../../assets/images/about1.jpg"),
      expertise: "Backend/Frontend"
    },
    { 
      name: "Marc Gerald T. Salonga", 
      role: "BSIT Student", 
      img: require("../../assets/images/about2.jpg"),
      expertise: "Frontend/Backend"
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#43A047', '#2E7D32']}
        style={styles.heroSection}
      >
        <Animated.View entering={FadeInDown.duration(1000)} style={styles.heroContent}>
          <Text style={styles.heroTitle}>EnerGauge</Text>
          <Text style={styles.heroSubtitle}>Revolutionizing Energy Management</Text>
        </Animated.View>
      </LinearGradient>

      {/* Mission Section */}
      <Animated.View entering={FadeInUp.duration(800)} style={styles.missionSection}>
        <Surface style={styles.missionCard}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            Empowering sustainable energy decisions through innovative forecasting technology and data-driven insights.
          </Text>
        </Surface>
      </Animated.View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>What We Offer</Text>
        {features.map((feature, index) => (
          <Animated.View 
            key={index} 
            entering={SlideInRight.delay(200 * index).duration(800)}
          >
            <Surface style={styles.featureCard}>
              <MaterialCommunityIcons name={feature.icon} size={32} color="#43A047" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </Surface>
          </Animated.View>
        ))}
      </View>

      {/* Team Section */}
      <View style={styles.teamSection}>
        <Text style={styles.sectionTitle}>Meet Our Team</Text>
        <View style={styles.teamGrid}>
          {teamMembers.map((member, index) => (
            <Animated.View 
              key={index} 
              entering={FadeInUp.delay(300 * index).duration(800)}
              style={styles.teamCardContainer}
            >
              <TouchableOpacity>
                <Surface style={styles.teamCard}>
                  <Image source={member.img} style={styles.teamMemberImage} />
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                  <Text style={styles.memberExpertise}>{member.expertise}</Text>
                </Surface>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  heroSection: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  missionSection: {
    padding: 20,
    marginTop: -30,
  },
  missionCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
    textAlign: 'center',
  },
  missionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    textAlign: 'center',
  },
  featuresSection: {
    padding: 20,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  featureContent: {
    marginLeft: 15,
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  teamSection: {
    padding: 20,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  teamCardContainer: {
    width: width / 2 - 30,
    marginBottom: 20,
  },
  teamCard: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    alignItems: 'center',
  },
  teamMemberImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  memberExpertise: {
    fontSize: 12,
    color: '#43A047',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default AboutUs;
