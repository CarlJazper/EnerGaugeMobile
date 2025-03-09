import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, Dimensions } from "react-native";
import { ActivityIndicator, Card, Surface } from "react-native-paper";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView as GestureScrollView } from 'react-native-gesture-handler';
import config from "../../../utils/config";

const screenWidth = Dimensions.get("window").width;

const Forecast = () => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPredictions, setTotalPredictions] = useState(0);
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [totalEnergySavings, setTotalEnergySavings] = useState(0);
  const [averagePeakLoad, setAveragePeakLoad] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalUsersForecasting, setTotalUsersForecasting] = useState(0);
  const [averageFeatures, setAverageFeatures] = useState({});

  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        if (!userToken) {
          console.error("No user token found");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${config.API_BASE_URL}/trends`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        setForecasts(response.data.forecasts);
        setTotalPredictions(response.data.total_forecasts);
        setTotalEnergy(response.data.total_energy);
        setTotalEnergySavings(response.data.total_energy_savings);
        setAveragePeakLoad(response.data.average_peak_load);
        setTotalUsers(response.data.total_users);
        setTotalUsersForecasting(response.data.total_users_forecasting);
        setAverageFeatures(response.data.average_features || {});
      } catch (error) {
        console.error("Error fetching forecast data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForecastData();
  }, []);

  if (loading) {
    return <ActivityIndicator animating={true} size="large" style={{ marginTop: 20 }} />;
  }

  const chartData = {
    labels: forecasts.map((f) => new Date(f.timestamp).toLocaleDateString()),
    datasets: [
      {
        data: forecasts.map((f) => f.total_forecast_energy || 0),
        color: (opacity = 1) => `rgba(34, 128, 176, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const userParticipationData = [
    {
      name: "Users Forecasting",
      population: totalUsersForecasting,
      color: "#4CAF50",
      legendFontColor: "#666",
      legendFontSize: 12
    },
    {
      name: "Other Users",
      population: totalUsers - totalUsersForecasting,
      color: "#FF9800",
      legendFontColor: "#666",
      legendFontSize: 12
    }
  ];
  const StatCard = ({ title, value, icon, unit = "", color = "#4CAF50" }) => (
    <Surface style={styles.statCardSurface}>
      <Card style={styles.statCard}>
        <Card.Content style={styles.statCardContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statTitle}>{title}</Text>
            <Text style={[styles.statValue, { color }]}>
              {typeof value === 'number' ? value.toLocaleString('en-US', { maximumFractionDigits: 2 }) : value}
              <Text style={styles.statUnit}>{unit}</Text>
            </Text>
          </View>
        </Card.Content>
      </Card>
    </Surface>
  );

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#4CAF50"
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="chart-box" size={24} color="#4CAF50" />
        <Text style={styles.headerTitle}>Forecast Analytics</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Predictions"
          value={totalPredictions}
          icon="chart-line"
          color="#4CAF50"
        />
        <StatCard
          title="Total Energy"
          value={totalEnergy}
          icon="lightning-bolt"
          unit=" kWh"
          color="#2196F3"
        />
        <StatCard
          title="Energy Savings"
          value={totalEnergySavings}
          icon="leaf"
          unit=" kWh"
          color="#FF9800"
        />
        <StatCard
          title="Peak Load"
          value={averagePeakLoad}
          icon="flash"
          unit=" kW"
          color="#9C27B0"
        />
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <MaterialCommunityIcons name="chart-timeline-variant" size={24} color="#4CAF50" />
          <Text style={styles.chartTitle}>Forecast Trends</Text>
        </View>
        <GestureScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <LineChart
            data={chartData}
            width={Math.max(screenWidth * 1.5, chartData.labels.length * 60)}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            yAxisSuffix=" kWh"
          />
        </GestureScrollView>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <MaterialCommunityIcons name="account-group" size={24} color="#4CAF50" />
          <Text style={styles.chartTitle}>User Participation</Text>
        </View>
        <View style={styles.pieChartContainer}>
          <PieChart
            data={userParticipationData}
            width={screenWidth - 64} // Adjusted width
            height={220}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            center={[0, 0]} // Adjusted center
            absolute // Show absolute numbers
            style={styles.chart}
            hasLegend={true}
            legendStyle={{
              color: '#666',
              fontSize: 12,
            }}
          />
        </View>
      </View>

      <View style={[styles.chartContainer, { marginBottom: 20 }]}>
        <View style={styles.chartHeader}>
          <MaterialCommunityIcons name="chart-bar" size={24} color="#4CAF50" />
          <Text style={styles.chartTitle}>Feature Contribution</Text>
        </View>
        <GestureScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <BarChart
            data={{
              labels: Object.keys(averageFeatures),
              datasets: [{ data: Object.values(averageFeatures) }],
            }}
            width={Math.max(screenWidth * 1.5, Object.keys(averageFeatures).length * 100)}
            height={220}
            yAxisLabel=""
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </GestureScrollView>
      </View>
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCardSurface: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  statCard: {
    borderRadius: 12,
  },
  statCardContent: {
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statUnit: {
    fontSize: 12,
    color: "#666",
  },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    overflow: 'hidden', 
  },
  pieChartContainer: {
    alignItems: 'center',
    marginHorizontal: -16, 
    marginBottom: -16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
};

export default Forecast;
