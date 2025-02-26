import React, { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, ActivityIndicator, Animated, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Avatar, Card, Chip } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import config from "../../../utils/config";

const RecentForecast = () => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        if (!userToken) {
          console.error("User token not found");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${config.API_BASE_URL}/trends`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        setForecasts(response.data.forecasts);
      } catch (error) {
        console.error("Error fetching forecast data", error);
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    };

    fetchForecasts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.header, { opacity: fadeAnim }]}>Recent Forecasts</Animated.Text>

      {forecasts.length > 0 ? (
        <FlatList
          data={forecasts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.row}>
                    <Avatar.Text label={item.first_name ? item.first_name[0] : "U"} size={40} />
                    <Chip icon={() => <Ionicons name="calendar-outline" size={14} />} style={styles.chip}>
                      {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "Unknown Date"}
                    </Chip>
                  </View>

                  <View style={styles.row}>
                    <Ionicons name="person-outline" size={18} color="#4CAF50" />
                    <Text style={styles.infoText}>
                      <Text style={styles.bold}>Name:</Text> {item.first_name ? `${item.first_name} ${item.last_name}` : "Unknown User"}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Ionicons name="flash-outline" size={18} color="#4CAF50" />
                    <Text style={styles.infoText}>
                      <Text style={styles.bold}>Energy Consumption:</Text> {item.total_forecast_energy.toFixed(2)} kWh
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Ionicons name="trending-up-outline" size={18} color="#4CAF50" />
                    <Text style={styles.infoText}>
                      <Text style={styles.bold}>Energy Savings:</Text> {item.total_energy_savings.toFixed(2)} kWh
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Ionicons name="trophy-outline" size={18} color="#4CAF50" />
                    <Text style={styles.infoText}>
                      <Text style={styles.bold}>Peak Load:</Text> {item.peak_load ? `${item.peak_load} kW` : "No Data"}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </Animated.View>
          )}
        />
      ) : (
        <Animated.Text style={[styles.noDataText, { opacity: fadeAnim }]}>No forecast data available.</Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 16,
  },
  cardContainer: {
    marginBottom: 10,
  },
  card: {
    borderRadius: 10,
    elevation: 4,
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  chip: {
    backgroundColor: "#A5D6A7",
    marginLeft: 10,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  bold: {
    fontWeight: "bold",
    color: "#2E7D32",
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

export default RecentForecast;
