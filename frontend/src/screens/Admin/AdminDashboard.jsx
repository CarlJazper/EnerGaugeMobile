import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import ForecastData from "../../screens/Admin/Forecast/ForecastData"; // Import ForecastData

const AdminDashboard = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      {/* Render Forecast Data */}
      <ForecastData />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 30,
  },
});

export default AdminDashboard;
