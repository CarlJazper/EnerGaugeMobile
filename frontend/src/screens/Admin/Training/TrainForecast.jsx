import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Button, Card, Paragraph } from "react-native-paper";
import config from "../../../utils/config";

const TrainForecast = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        setFile(result);
        setMessage(`Selected file: ${result.name}`);
      }
    } catch (error) {
      Alert.alert("File Selection Error", "Failed to pick a file.");
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      Alert.alert("Error", "Please upload a CSV file.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: "text/csv",
    });

    try {
      const token = await AsyncStorage.getItem("userToken");

      const response = await axios.post(`${config.API_BASE_URL}/train_arima`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.error || "Error training the model");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <Card style={{ marginBottom: 20, padding: 15 }}>
        <Card.Title title="Train Energy Forecast Model" />
        <Card.Content>
          <Button mode="contained" onPress={handleFilePick}>
            Select CSV File
          </Button>
          {message ? <Paragraph style={{ marginTop: 10 }}>{message}</Paragraph> : null}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              marginTop: 20,
              backgroundColor: loading ? "#ccc" : "#2E7D32",
              padding: 15,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 16 }}>Train Model</Text>}
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <Card>
        <Card.Title title="How the Model Works" />
        <Card.Content>
          <Paragraph>
            The SARIMAX model is used for time series forecasting. It extends ARIMA by incorporating seasonal patterns and external factors like temperature, humidity, and occupancy.
          </Paragraph>
          <Card.Title title="Required CSV Columns" />
          <Paragraph>
            The CSV file should include:
          </Paragraph>
          <Paragraph>• Temperature, Humidity, SquareFootage</Paragraph>
          <Paragraph>• Occupancy, HVACUsage, LightingUsage</Paragraph>
          <Paragraph>• RenewableEnergy, DayOfWeek, Holiday</Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
};

export default TrainForecast;