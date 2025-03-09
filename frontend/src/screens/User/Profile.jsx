import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import axios from 'axios';
import config from "../../utils/config";
import { MaterialIcons } from '@expo/vector-icons';

const ProfileCard = ({ icon, label, value }) => (
  <View style={styles.card}>
    <MaterialIcons name={icon} size={24} color="#88B789" style={styles.cardIcon} />
    <View style={styles.cardContent}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value || 'Not provided'}</Text>
    </View>
  </View>
);

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

            const response = await axios.get(`${config.API_BASE_URL}/api/users/profile`, {
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

    useFocusEffect(
        useCallback(() => {
            fetchUserProfile();
        }, [])
    );

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userRole');

        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'UserLogin' }],
            })
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#88B789" />
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
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: 'https://ui-avatars.com/api/?name=' + 
                            `${userData?.first_name}+${userData?.last_name}&background=88B789&color=fff` }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>
                        {userData?.first_name} {userData?.last_name}
                    </Text>
                    <Text style={styles.email}>{userData?.email}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                <ProfileCard
                    icon="phone"
                    label="Phone"
                    value={userData?.phone}
                />
                
                <ProfileCard
                    icon="location-on"
                    label="Address"
                    value={userData?.address}
                />
                
                <ProfileCard
                    icon="location-city"
                    label="City"
                    value={userData?.city}
                />
                
                <ProfileCard
                    icon="flag"
                    label="Country"
                    value={userData?.country}
                />

                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => navigation.navigate('UpdateProfile', { userData })}
                >
                    <MaterialIcons name="edit" size={20} color="#fff" />
                    <Text style={styles.updateButtonText}>Update Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <MaterialIcons name="logout" size={20} color="#fff" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F9F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F9F5',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingTop: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    avatarContainer: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: '600',
        color: '#2C3E2D',
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        color: '#88B789',
        marginBottom: 10,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E2D',
        marginBottom: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardIcon: {
        marginRight: 15,
    },
    cardContent: {
        flex: 1,
    },
    cardLabel: {
        fontSize: 14,
        color: '#88B789',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 16,
        color: '#2C3E2D',
    },
    updateButton: {
        flexDirection: 'row',
        backgroundColor: '#88B789',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#FF8B8B',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    errorText: {
        color: '#FF8B8B',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default Profile;
