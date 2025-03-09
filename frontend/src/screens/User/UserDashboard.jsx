import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions, SafeAreaView } from "react-native";
import { Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import UserForecast from "../User/UserForecast";
import config from "../../utils/config";

const Dashboard = () => {
  const navigation = useNavigation();

  const downloadFile = async (type) => {
    try {
      const userToken = await AsyncStorage.getItem("userToken"); // Retrieve token asynchronously
  
      if (!userToken) {
        Alert.alert("Authentication Error", "User token is missing. Please log in again.");
        return;
      }
  
      const response = await fetch(`${config.API_BASE_URL}/download/${type}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`, // Use retrieved token
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type.toUpperCase()}: ${response.status}`);
      }
  
      Alert.alert("Download Successful", `Your ${type.toUpperCase()} file has been downloaded.`);
    } catch (error) {
      console.error(`Error downloading ${type.toUpperCase()}:`, error);
      Alert.alert("Download Failed", `Could not download ${type.toUpperCase()}.`);
    }
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >

        {/* Main Content */}
        <Animated.View 
          entering={FadeInDown.duration(800)} 
          style={styles.mainContent}
        >
          {/* Download Options */}
          <View style={styles.downloadSection}>
            <Text style={styles.downloadTitle}>Download Reports</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                onPress={() => downloadFile("csv")} 
                style={styles.downloadButton}
              >
                <MaterialIcons name="table-chart" size={24} color="white" />
                <Text style={styles.buttonText}>CSV</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => downloadFile("pdf")} 
                style={styles.downloadButton}
              >
                <MaterialCommunityIcons name="file-pdf-box" size={24} color="white" />
                <Text style={styles.buttonText}>PDF</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forecast Section */}
          <View style={styles.forecastSection}>
            <UserForecast />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: '#1E293B',
    textAlign: "left",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  downloadSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: '#1E293B',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  forecastSection: {
    flex: 1,
    marginBottom: 16,
  },
});

export default Dashboard;
