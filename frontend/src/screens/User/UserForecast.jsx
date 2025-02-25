import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

const UserForecast = () => {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) throw new Error("No authentication token found.");

        const response = await axios.get("http://192.168.228.235:5000/userforecast", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setForecastData(response.data);
      } catch (err) {
        setError(err.response?.status === 404 ? "No forecast available yet." : "Failed to fetch forecast data.");
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  if (!forecastData || Object.keys(forecastData).length === 0) {
    return <Text style={styles.noData}>No forecast yet</Text>;
  }

  const { total_forecasts, total_energy, total_savings, avg_peak_load, min_peak_load, max_peak_load, avg_factors, energy_by_weekday } = forecastData;

  // Convert weekday data for Line Chart
  const energyTrendData = Object.keys(energy_by_weekday).map((day) => ({
    name: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day],
    energy: energy_by_weekday[day],
  }));

  // Convert factor contributions for Pie Chart
  const factorData = Object.keys(avg_factors).map((key) => ({
    name: key,
    population: avg_factors[key],
    color: ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#d0ed57", "#a4de6c", "#ffbb28"][Math.floor(Math.random() * 8)],
    legendFontColor: "#333",
    legendFontSize: 12,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>User Forecast Data</Text>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Total Forecasts: {total_forecasts}</Text>
        <Text style={styles.statText}>Total Energy Usage: {total_energy} kWh</Text>
        <Text style={styles.statText}>Total Savings: {total_savings} kWh</Text>
      </View>

      {/* Peak Load Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Avg Peak Load: {avg_peak_load} kW</Text>
        <Text style={styles.statText}>Min Peak Load: {min_peak_load} kW</Text>
        <Text style={styles.statText}>Max Peak Load: {max_peak_load} kW</Text>
      </View>

      {/* Line Chart: Energy Consumption by Weekday */}
      <Text style={styles.chartTitle}>Energy Consumption by Day</Text>
      <LineChart
        data={{
          labels: energyTrendData.map((item) => item.name),
          datasets: [{ data: energyTrendData.map((item) => item.energy) }],
        }}
        width={screenWidth - 30}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />

      {/* Bar Chart: Energy Savings */}
      <Text style={styles.chartTitle}>Energy Savings</Text>
      <BarChart
        data={{
          labels: ["Savings"],
          datasets: [{ data: [total_savings] }],
        }}
        width={screenWidth - 30}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
      />

      {/* Pie Chart: Factor Contributions */}
      <Text style={styles.chartTitle}>Factor Contributions</Text>
      <PieChart
        data={factorData}
        width={screenWidth - 30}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        style={styles.chart}
      />
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#f9f9f9",
  backgroundGradientTo: "#f9f9f9",
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: "red",
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
  },
  noData: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 20,
  },
  statsContainer: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  statText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  chart: {
    borderRadius: 10,
    marginBottom: 15,
  },
});

export default UserForecast;
