import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import UserForecast from '../User/UserForecast'; // Import the UserForecast component

const UserDashboard = () => {
    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>User Dashboard</Text>
                <UserForecast />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default UserDashboard;
