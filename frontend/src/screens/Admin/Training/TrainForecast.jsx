import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Animated } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Button, Card, Paragraph, Surface, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import config from "../../../utils/config";
import { LinearGradient } from 'expo-linear-gradient';

const TrainForecast = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadProgress] = useState(new Animated.Value(0));

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        setFile(result);
        setMessage(`Selected file: ${result.name}`);
        // Animate progress bar
        Animated.timing(uploadProgress, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }).start();
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
    <View style={styles.container}>
      <Surface style={styles.headerCard}>
        <LinearGradient
          colors={['#2E7D32', '#1B5E20']}
          style={styles.gradient}
        >
          <Text style={styles.headerTitle}>Train Energy Forecast Model</Text>
          <Text style={styles.headerSubtitle}>Upload CSV data to train the SARIMAX model</Text>
        </LinearGradient>
      </Surface>

      <Card style={styles.uploadCard}>
        <View style={styles.uploadSection}>
          <IconButton
            icon="file-upload"
            size={40}
            color="#2E7D32"
            onPress={handleFilePick}
          />
          <Text style={styles.uploadText}>Select CSV File</Text>
          {message && (
            <View style={styles.messageContainer}>
              <MaterialCommunityIcons name="file-check" size={20} color="#2E7D32" />
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}
          {file && (
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: uploadProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          )}
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="brain" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>Train Model</Text>
            </>
          )}
        </TouchableOpacity>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Title
          title="How the Model Works"
          left={(props) => <MaterialCommunityIcons name="chart-line" size={24} color="#2E7D32" />}
        />
        <Card.Content>
          <Paragraph style={styles.infoParagraph}>
            The SARIMAX model is used for time series forecasting. It extends ARIMA by incorporating seasonal patterns and external factors like temperature, humidity, and occupancy.
          </Paragraph>
          
          <Text style={styles.requirementsTitle}>Required CSV Columns:</Text>
          <View style={styles.requirementsList}>
            {[
              'Temperature, Humidity, SquareFootage',
              'Occupancy, HVACUsage, LightingUsage',
              'RenewableEnergy, DayOfWeek, Holiday'
            ].map((item, index) => (
              <View key={index} style={styles.requirementItem}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#2E7D32" />
                <Text style={styles.requirementText}>{item}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  headerCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  gradient: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  uploadCard: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
  },
  uploadSection: {
    alignItems: 'center',
    padding: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 12,
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 16,
    color: '#2E7D32',
    marginTop: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  messageText: {
    marginLeft: 8,
    color: '#2E7D32',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2E7D32',
    borderRadius: 2,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 12,
    elevation: 2,
  },
  infoParagraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#555',
  },
});

export default TrainForecast;
