import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Alert, StyleSheet } from "react-native";
import { Button, Card, ActivityIndicator, Snackbar, Dialog, Portal, IconButton, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
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

  const renderUserCard = ({ item }) => (
    <Surface style={styles.cardSurface}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {`${item.first_name[0]}${item.last_name[0]}`}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.first_name} {item.last_name}</Text>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="email-outline" size={16} color="#666" />
                <Text style={styles.userEmail}>{item.email}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{item.phone || "N/A"}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {`${item.address}, ${item.city}, ${item.country}`}
              </Text>
            </View>
          </View>
        </Card.Content>

        <Card.Actions style={styles.actions}>
          <Button 
            mode="contained-tonal"
            onPress={() => handleUpdateUser(item._id)}
            style={styles.editButton}
            icon="pencil"
          >
            Edit
          </Button>
          <Button 
            mode="contained-tonal"
            onPress={() => confirmDelete(item._id)}
            style={styles.deleteButton}
            icon="delete"
          >
            Delete
          </Button>
        </Card.Actions>
      </Card>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="account-group" size={24} color="#4CAF50" />
        <Text style={styles.title}>User Management</Text>
      </View>

      {loading ? (
        <ActivityIndicator animating={true} size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderUserCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Snackbar 
        visible={snackbarVisible} 
        onDismiss={() => setSnackbarVisible(false)} 
        duration={3000}
        style={styles.snackbar}
      >
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
            <Button 
              onPress={handleDeleteUser} 
              textColor="red"
              icon="delete"
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  listContainer: {
    padding: 4,
  },
  cardSurface: {
    elevation: 4,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  card: {
    borderRadius: 12,
    backgroundColor: 'white',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  detailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  editButton: {
    marginRight: 8,
    backgroundColor: '#E8F5E9',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  loader: {
    flex: 1,
  },
  snackbar: {
    bottom: 16,
  },
});

export default UserList;