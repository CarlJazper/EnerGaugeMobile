import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import config from "../../../utils/config";

const UserUpdate = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params; // Get user ID from navigation params

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        const response = await axios.get(`${config.API_BASE_URL}/api/users/usersdata/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleInputChange = (name, value) => {
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      await axios.put(`${config.API_BASE_URL}/api/users/update/${id}`, user, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Success", "User updated successfully");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to update user");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#2E7D32" style={styles.loader} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Update User</Text>

      <TextInput style={styles.input} placeholder="First Name" value={user.first_name || ""} onChangeText={(value) => handleInputChange("first_name", value)} />
      <TextInput style={styles.input} placeholder="Last Name" value={user.last_name || ""} onChangeText={(value) => handleInputChange("last_name", value)} />
      <TextInput style={styles.input} placeholder="Email" value={user.email || ""} onChangeText={(value) => handleInputChange("email", value)} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Phone" value={user.phone || ""} onChangeText={(value) => handleInputChange("phone", value)} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Address" value={user.address || ""} onChangeText={(value) => handleInputChange("address", value)} />
      <TextInput style={styles.input} placeholder="City" value={user.city || ""} onChangeText={(value) => handleInputChange("city", value)} />
      <TextInput style={styles.input} placeholder="Country" value={user.country || ""} onChangeText={(value) => handleInputChange("country", value)} />

      <Button title="Update" onPress={handleSubmit} color="#2E7D32" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UserUpdate;
