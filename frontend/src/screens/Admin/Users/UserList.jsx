import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Alert, StyleSheet } from "react-native";
import { Button, Card, ActivityIndicator, Snackbar, Dialog, Portal, IconButton } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import config from "../../../utils/config";

const UserList = () => {
  const navigation = useNavigation(); // Get navigation instance
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [token, setToken] = useState("");

  useFocusEffect(
    useCallback(() => {
      getTokenAndRole();
    }, [])
  );

  const getTokenAndRole = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("userToken");
      if (storedToken) {
        setToken(storedToken);
        fetchUsers(storedToken);
      }
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  const fetchUsers = async (authToken) => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/users/userslist`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUsers(response.data);
    } catch (error) {
      setSnackbarMessage("Failed to fetch users. Please try again.");
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setDialogVisible(false);
    try {
      await axios.delete(`${config.API_BASE_URL}/api/users/delete/${selectedUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(token); // Refresh after deleting a user
      setSnackbarMessage("User deleted successfully!");
    } catch (error) {
      setSnackbarMessage("Failed to delete user. Please try again.");
    } finally {
      setSnackbarVisible(true);
    }
  };

  const confirmDelete = (userId) => {
    setSelectedUserId(userId);
    setDialogVisible(true);
  };

  const handleUpdateUser = (userId) => {
    navigation.navigate("UserUpdate", { id: userId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User List</Text>

      {loading ? (
        <ActivityIndicator animating={true} size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.userName}>{item.first_name} {item.last_name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userPhone}>{item.phone || "N/A"}</Text>
                <Text style={styles.userLocation}>
                  {item.address}, {item.city}, {item.country}
                </Text>
              </Card.Content>
              <Card.Actions style={styles.actions}>
                <IconButton icon="pencil" onPress={() => handleUpdateUser(item._id)} />
                <IconButton icon="delete" iconColor="red" onPress={() => confirmDelete(item._id)} />
              </Card.Actions>
            </Card>
          )}
        />
      )}

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
        {snackbarMessage}
      </Snackbar>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Confirm Deletion</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this user?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteUser} textColor="red">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "white" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 10, borderRadius: 8, elevation: 3, backgroundColor: "#fff", padding: 10 },
  userName: { fontSize: 18, fontWeight: "bold" },
  userEmail: { fontSize: 14, color: "gray" },
  userPhone: { fontSize: 14, color: "black", marginTop: 5 },
  userLocation: { fontSize: 14, color: "black", marginTop: 5 },
  actions: { justifyContent: "flex-end" },
});

export default UserList;
