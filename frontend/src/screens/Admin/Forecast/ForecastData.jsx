import React, { useEffect, useState } from "react";
import { View, ScrollView, Text } from "react-native";
import { ActivityIndicator, Card, Title, Paragraph, Divider } from "react-native-paper";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Dimensions } from "react-native";
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
    { name: "Users Who Forecasted", population: totalUsersForecasting, color: "#0088FE", legendFontColor: "#7F7F7F", legendFontSize: 12 },
    { name: "Users Who Did Not", population: totalUsers - totalUsersForecasting, color: "#FF8042", legendFontColor: "#7F7F7F", legendFontSize: 12 },
  ];

  return (
    <ScrollView style={{ padding: 16 }}>
      {/* Summary Cards */}
      <Card style={{ marginBottom: 10 }}>
        <Card.Content>
          <Title>Total Forecast Prediction</Title>
          <Paragraph>{totalPredictions}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={{ marginBottom: 10 }}>
        <Card.Content>
          <Title>Total Energy Forecasted</Title>
          <Paragraph>{totalEnergy.toFixed(2)} kWh</Paragraph>
        </Card.Content>
      </Card>

      <Card style={{ marginBottom: 10 }}>
        <Card.Content>
          <Title>Total Energy Savings</Title>
          <Paragraph>{totalEnergySavings.toFixed(2)} kWh</Paragraph>
        </Card.Content>
      </Card>

      <Divider style={{ marginVertical: 10 }} />

      {/* Forecast Trends */}
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Forecast Trends</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: "#e3e3e3",
          backgroundGradientFrom: "#f3f3f3",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 10 },
          propsForDots: { r: "4", strokeWidth: "2", stroke: "#8884d8" },
        }}
      />

      <Divider style={{ marginVertical: 10 }} />

      {/* User Participation Chart */}
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>User Participation</Text>
      <PieChart
        data={userParticipationData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: "#e3e3e3",
          backgroundGradientFrom: "#f3f3f3",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
      />

      <Divider style={{ marginVertical: 10 }} />

      {/* Feature Contribution Bar Chart */}
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Feature Contribution</Text>
      <BarChart
        data={{
          labels: Object.keys(averageFeatures),
          datasets: [{ data: Object.values(averageFeatures) }],
        }}
        width={screenWidth - 32}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: "#e3e3e3",
          backgroundGradientFrom: "#f3f3f3",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          propsForDots: { r: "4", strokeWidth: "2", stroke: "#8884d8" },
        }}
      />
    </ScrollView>
  );
};

export default Forecast;
