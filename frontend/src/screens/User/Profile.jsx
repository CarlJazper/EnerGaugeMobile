import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const Profile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        setError('No authentication token found.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://172.34.15.8:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserData(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch profile.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch user data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      <Text style={styles.label}>Name: <Text style={styles.value}>{userData?.first_name} {userData?.last_name}</Text></Text>
      <Text style={styles.label}>Email: <Text style={styles.value}>{userData?.email}</Text></Text>
      <Text style={styles.label}>Address: <Text style={styles.value}>{userData?.address || 'N/A'}</Text></Text>
      <Text style={styles.label}>City: <Text style={styles.value}>{userData?.city || 'N/A'}</Text></Text>
      <Text style={styles.label}>Country: <Text style={styles.value}>{userData?.country || 'N/A'}</Text></Text>

      <TouchableOpacity
        style={styles.updateButton}
        onPress={() => navigation.navigate('UpdateProfile', { userData })}
      >
        <Text style={styles.updateButtonText}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    color: '#555',
  },
  updateButton: {
    marginTop: 20,
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default Profile;
