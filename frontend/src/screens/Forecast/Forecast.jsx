import React, { useState, useEffect } from "react";
import {View,Text,TextInput,TouchableOpacity,ActivityIndicator,ScrollView,StyleSheet,Dimensions,} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LineChart } from "react-native-chart-kit";
import config from "../../utils/config";

const Forecast = () => {
    const [inputs, setInputs] = useState({
        Temperature: "",
        Humidity: "",
        SquareFootage: "",
        Occupancy: "",
        HVACUsage: "Off",
        LightingUsage: "Off",
        RenewableEnergy: "",
        DayOfWeek: "",
        Holiday: "No",
    });
    const [days, setDays] = useState(1);
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (key, value) => {
        setInputs((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setError("");
        setForecastData(null);

        if (!days || days < 1) {
            setError("Please enter a valid number of days to forecast.");
            return;
        }

        const missingFields = Object.keys(inputs).filter((key) => inputs[key] === "");
        if (missingFields.length > 0) {
            setError(`Please fill in all fields: ${missingFields.join(", ")}`);
            return;
        }

        setLoading(true);

        const futureTimestamps = [];
        const featureInputs = [];

        for (let i = 0; i < parseInt(days, 10); i++) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + i);
            futureTimestamps.push(futureDate.toISOString().split("T")[0]);

            featureInputs.push({
                Temperature: parseFloat(inputs.Temperature),
                Humidity: parseFloat(inputs.Humidity),
                SquareFootage: parseFloat(inputs.SquareFootage),
                Occupancy: parseInt(inputs.Occupancy, 10),
                HVACUsage: inputs.HVACUsage === "On" ? 1 : 0,
                LightingUsage: inputs.LightingUsage === "On" ? 1 : 0,
                RenewableEnergy: parseFloat(inputs.RenewableEnergy),
                DayOfWeek: inputs.DayOfWeek !== "" ? parseInt(inputs.DayOfWeek, 10) : futureDate.getDay(),
                Holiday: inputs.Holiday === "Yes" ? 1 : 0,
            });
        }

        try {
            const userToken = await AsyncStorage.getItem("userToken");
            const response = await axios.post(
                `${config.API_BASE_URL}/predict_forecast`,
                { timestamps: futureTimestamps, features: featureInputs },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            setForecastData(response.data);
        } catch (err) {
            setError(err.response?.data?.error || "Error fetching predictions");
        } finally {
            setLoading(false);
        }
    };

    const formatForecastData = () => {
        if (!forecastData) return { labels: [], data: [] };
        const labels = forecastData.forecast_data.map((_, index) => `Day ${index + 1}`);
        const data = forecastData.forecast_data.map((entry) => Number(entry.forecast_energy));
        return { labels, data };
    };

    const styles = StyleSheet.create({
        container: {
          flex: 1,
          padding: 20,
          backgroundColor: '#f5f9f5', // Light mint background
        },
        header: {
          fontSize: 28,
          fontWeight: "bold",
          color: '#2d5a27', // Dark green
          marginBottom: 20,
          textAlign: 'center',
        },
        errorText: {
          color: '#e74c3c',
          backgroundColor: '#fde8e7',
          padding: 10,
          borderRadius: 8,
          marginBottom: 15,
        },
        inputContainer: {
          marginBottom: 15,
        },
        label: {
          fontSize: 16,
          color: '#2d5a27',
          marginBottom: 8,
          fontWeight: '500',
        },
        input: {
          borderWidth: 1,
          borderColor: '#a8d5a3', // Light green border
          backgroundColor: '#ffffff',
          padding: 12,
          borderRadius: 8,
          fontSize: 16,
          color: '#34495e',
        },
        pickerContainer: {
          borderWidth: 1,
          borderColor: '#a8d5a3',
          borderRadius: 8,
          backgroundColor: '#ffffff',
          marginBottom: 15,
        },
        picker: {
          height: 50,
          color: '#34495e',
        },
        button: {
          backgroundColor: '#4a8f44', // Green button
          padding: 15,
          marginBottom: 40,
          borderRadius: 8,
          alignItems: 'center',
          marginVertical: 1,
        },
        buttonText: {
          color: '#ffffff',
          fontSize: 18,
          fontWeight: '600',
        },
        resultContainer: {
          backgroundColor: '#ffffff',
          padding: 20,
          borderRadius: 12,
          marginTop: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
        resultHeader: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#2d5a27',
          marginBottom: 15,
        },
        resultText: {
          fontSize: 16,
          color: '#34495e',
          marginBottom: 8,
        },
        chartContainer: {
          marginVertical: 20,
          backgroundColor: '#ffffff',
          padding: 15,
          borderRadius: 12,
        },
        predictionCard: {
          backgroundColor: '#f0f7f0', // Light green background
          padding: 15,
          borderRadius: 8,
          marginVertical: 8,
          borderWidth: 1,
          borderColor: '#a8d5a3',
        },
        predictionTitle: {
          fontSize: 16,
          fontWeight: '600',
          color: '#2d5a27',
          marginBottom: 8,
        },
        predictionValue: {
          fontSize: 14,
          color: '#34495e',
          marginBottom: 4,
        },
      });
    
      // ... existing handleChange and handleSubmit functions ...
    
      return (
        <ScrollView style={styles.container}>
          <Text style={styles.header}>Energy Forecasting</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
    
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Days to Forecast</Text>
            <TextInput
              keyboardType="numeric"
              value={days.toString()}
              onChangeText={(value) => setDays(value ? Math.max(1, parseInt(value, 10)) : 1)}
              style={styles.input}
            />
          </View>
    
          {Object.keys(inputs).map((key) => (
            <View key={key} style={styles.inputContainer}>
              <Text style={styles.label}>
                {key.replace(/([A-Z])/g, " $1").trim()}
              </Text>
              
              {["HVACUsage", "LightingUsage", "Holiday"].includes(key) ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    style={styles.picker}
                    selectedValue={inputs[key]}
                    onValueChange={(value) => handleChange(key, value)}
                  >
                    {key === "Holiday"
                      ? ["No", "Yes"].map((option) => (
                          <Picker.Item key={option} label={option} value={option} />
                        ))
                      : ["Off", "On"].map((option) => (
                          <Picker.Item key={option} label={option} value={option} />
                        ))}
                  </Picker>
                </View>
              ) : key === "DayOfWeek" ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    style={styles.picker}
                    selectedValue={inputs[key]}
                    onValueChange={(value) => handleChange(key, value)}
                  >
                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                      (day, index) => (
                        <Picker.Item key={index} label={day} value={index} />
                      )
                    )}
                  </Picker>
                </View>
              ) : (
                <TextInput
                  keyboardType="numeric"
                  value={inputs[key]}
                  onChangeText={(value) => handleChange(key, value)}
                  style={styles.input}
                />
              )}
            </View>
          ))}
    
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Calculating..." : "Get Forecast"}
            </Text>
          </TouchableOpacity>
    
          {loading && <ActivityIndicator size="large" color="#4a8f44" />}
    
          {forecastData && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultHeader}>Forecast Results</Text>
              <Text style={styles.resultText}>
                Estimated Peak Load: {forecastData.peak_load} kW
              </Text>
    
              <View style={styles.chartContainer}>
                <LineChart
                  data={{
                    labels: formatForecastData().labels,
                    datasets: [{ data: formatForecastData().data }],
                  }}
                  width={Dimensions.get("window").width - 70}
                  height={220}
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 2,
                    color: (opacity = 1) => `rgba(74, 143, 68, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(45, 90, 39, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: "#4a8f44",
                    },
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
              </View>
    
              <Text style={styles.resultHeader}>Energy Predictions</Text>
              {forecastData.forecast_data.map((entry, index) => (
                <View key={index} style={styles.predictionCard}>
                  <Text style={styles.predictionTitle}>
                    Day {index + 1} - Total Energy: {entry.forecast_energy} kW
                  </Text>
                  {Object.entries(entry.feature_contributions).map(([feature, value]) => (
                    <Text key={feature} style={styles.predictionValue}>
                      {feature}: {value} kW
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      );
    };
    
    export default Forecast;