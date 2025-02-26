import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, ActivityIndicator, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
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

    return (
        <ScrollView style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Energy Forecasting</Text>
            {error ? <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text> : null}

            <Text>Days to Forecast:</Text>
            <TextInput
                keyboardType="numeric"
                value={days.toString()}
                onChangeText={(value) => setDays(value ? Math.max(1, parseInt(value, 10)) : 1)}
                style={{
                    borderWidth: 1,
                    padding: 8,
                    marginBottom: 10,
                    borderRadius: 5,
                }}
            />

            {Object.keys(inputs).map((key) => (
                <View key={key} style={{ marginBottom: 10 }}>
                    <Text>{key.replace(/([A-Z])/g, " $1").trim()}:</Text>
                    {["HVACUsage", "LightingUsage", "Holiday"].includes(key) ? (
                        <Picker selectedValue={inputs[key]} onValueChange={(value) => handleChange(key, value)}>
                            {key === "Holiday"
                                ? ["No", "Yes"].map((option) => <Picker.Item key={option} label={option} value={option} />)
                                : ["Off", "On"].map((option) => <Picker.Item key={option} label={option} value={option} />)}
                        </Picker>
                    ) : key === "DayOfWeek" ? (
                        <Picker selectedValue={inputs[key]} onValueChange={(value) => handleChange(key, value)}>
                            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                                (day, index) => (
                                    <Picker.Item key={index} label={day} value={index} />
                                )
                            )}
                        </Picker>
                    ) : (
                        <TextInput
                            keyboardType="numeric"
                            value={inputs[key]}
                            onChangeText={(value) => handleChange(key, value)}
                            style={{
                                borderWidth: 1,
                                padding: 8,
                                borderRadius: 5,
                            }}
                        />
                    )}
                </View>
            ))}

            <Button title="Get Forecast" onPress={handleSubmit} disabled={loading} />
            {loading && <ActivityIndicator size="large" style={{ marginTop: 10 }} />}

            {forecastData && (
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>Forecast Results:</Text>
                    <Text>Estimated Peak Load: {forecastData.peak_load} kW</Text>

                    <LineChart
                        data={{
                            labels: formatForecastData().labels,
                            datasets: [{ data: formatForecastData().data }],
                        }}
                        width={Dimensions.get("window").width - 40}
                        height={220}
                        chartConfig={{
                            backgroundColor: "#fff",
                            backgroundGradientFrom: "#f3f3f3",
                            backgroundGradientTo: "#e3e3e3",
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: { r: "6", strokeWidth: "2", stroke: "#ffa726" },
                        }}
                        style={{ marginVertical: 8, borderRadius: 16 }}
                    />

                    <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 10 }}>Energy Predictions</Text>
                    {forecastData.forecast_data.map((entry, index) => (
                        <View key={index} style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginVertical: 5 }}>
                            <Text>Day {index + 1} - Total Energy: {entry.forecast_energy} kW</Text>
                            {Object.entries(entry.feature_contributions).map(([feature, value]) => (
                                <Text key={feature}>{feature}: {value} kW</Text>
                            ))}
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

export default Forecast;
