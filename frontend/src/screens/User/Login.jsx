import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import config from "../../utils/config";

const { width } = Dimensions.get('window');

const Login = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${config.API_BASE_URL}/api/users/login`, {
                email,
                password,
            });

            if (response.status === 200) {
                const { token } = response.data;
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                const { user_id, role } = decodedToken;

                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('userId', user_id);
                await AsyncStorage.setItem('userRole', role);

                navigation.navigate(role === 'admin' ? 'AdminNavigation' : 'UserNavigation');
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
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('../../../assets/images/logo.png')} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.header}>
                    <Text style={styles.title}>Welcome to EnerGauge!!</Text>
                    <Text style={styles.subtitle}>Sign in to your account</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="email" size={20} color="#88B39D" />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#88B39D"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="lock" size={20} color="#88B39D" />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#88B39D"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <MaterialIcons 
                                    name={showPassword ? "visibility" : "visibility-off"} 
                                    size={20} 
                                    color="#88B39D" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Sign In</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('UserRegister')}>
                            <Text style={styles.linkText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FDF9',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: width *0.06,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: width * 0.2, // 40% of screen width
        height: width * 0.2, // Maintain aspect ratio
        marginBottom: 15,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2E7D32',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#718096',
    },
    form: {
        width: '100%',
    },
    inputWrapper: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#2D3748',
    },
    button: {
        backgroundColor: '#86EFAC',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#86EFAC',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonText: {
        color: '#065F46',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 110,
    },
    footerText: {
        color: '#718096',
        fontSize: 14,
    },
    linkText: {
        color: '#059669',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default Login;
