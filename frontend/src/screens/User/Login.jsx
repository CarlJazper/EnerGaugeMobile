import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://192.168.228.235:5000/api/users/login', {
                email,
                password,
            });

            if (response.status === 200) {
                // Destructure the response to get the message and token
                const { message, token } = response.data;

                // Decode the token to get the user ID and role
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                const { user_id, role } = decodedToken;


                // Store the token, user ID, and role in AsyncStorage
                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('userId', user_id);
                await AsyncStorage.setItem('userRole', role);


                // Navigate the user based on their role
                if (role === 'admin') {
                    navigation.navigate('AdminNavigation');
                } else if (role === 'user') {
                    navigation.navigate('UserNavigation');
                } else {
                    console.warn('Unknown role:', role);
                }
            } else if (response.status === 403) {
                Alert.alert('Error', 'Please verify your email before logging in.');
            } else if (response.status === 404) {
                Alert.alert('Error', 'User not found.');
            } else if (response.status === 400) {
                Alert.alert('Error', 'Incorrect password.');
            }
        } catch (error) {
            console.error('Login failed:', error);
            Alert.alert(
                'Login Failed',
                error.response?.data?.message || 'Invalid credentials. Please try again.'
            );
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('UserRegister')}>
                <Text style={styles.registerText}>Don't have an account? Sign up</Text>
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#2E7D32',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    registerText: {
        color: '#2E7D32',
        fontSize: 16,
        marginTop: 10,
    },
});

export default Login;
