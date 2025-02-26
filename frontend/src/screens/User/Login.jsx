import React, { useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,Alert,KeyboardAvoidingView,Platform,SafeAreaView,Dimensions,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import config from "../../utils/config";

const { width, height } = Dimensions.get('window');

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
                const { message, token } = response.data;
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                const { user_id, role } = decodedToken;

                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('userId', user_id);
                await AsyncStorage.setItem('userRole', role);

                if (role === 'admin') {
                    navigation.navigate('AdminNavigation');
                } else if (role === 'user') {
                    navigation.navigate('UserNavigation');
                }
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
            {/* Top Design */}
            <View style={styles.topDesign}>
                <View style={styles.topWave} />
                <View style={styles.topWave2} />
                <View style={styles.topDecorativeCircle}>
                    <Feather name="sun" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.topSmallCircle1} />
                <View style={styles.topSmallCircle2} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.headerContainer}>
                    <Text style={styles.welcomeText}>Welcome Back!</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="email" size={20} color="#88B39D" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#88B39D"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="lock" size={20} color="#88B39D" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#88B39D"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity 
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <MaterialIcons 
                                name={showPassword ? "visibility" : "visibility-off"} 
                                size={20} 
                                color="#88B39D" 
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Sign In</Text>
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.divider} />
                    </View>

                    <TouchableOpacity 
                        style={styles.registerButton} 
                        onPress={() => navigation.navigate('UserRegister')}
                    >
                        <Text style={styles.registerButtonText}>Create New Account</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom Design */}
                <View style={styles.bottomDesign}>
                    <View style={styles.wave} />
                    <View style={styles.wave2} />
                    <View style={styles.decorativeCircle}>
                        <Feather name="leaf" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.smallCircle1} />
                    <View style={styles.smallCircle2} />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F9F7',
        position: 'relative',
    },
    keyboardView: {
        flex: 1,
        position: 'relative',
        zIndex: 1,
    },
    headerContainer: {
        marginTop: 120,
        marginBottom: 40,
        paddingHorizontal: 30,
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#88B39D',
    },
    formContainer: {
        paddingHorizontal: 30,
        zIndex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        marginBottom: 20,
        paddingHorizontal: 15,
        height: 55,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#2E7D32',
    },
    eyeIcon: {
        padding: 5,
    },
    loginButton: {
        backgroundColor: '#2E7D32',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#2E7D32',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#88B39D',
        opacity: 0.4,
    },
    dividerText: {
        color: '#88B39D',
        paddingHorizontal: 15,
        fontSize: 14,
    },
    registerButton: {
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2E7D32',
        backgroundColor: 'transparent',
        marginBottom: 40,
    },
    registerButtonText: {
        color: '#2E7D32',
        fontSize: 16,
        fontWeight: '600',
    },
    // Top Design Styles
    topDesign: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
        overflow: 'hidden',
        zIndex: 0,
    },
    topWave: {
        position: 'absolute',
        top: -100,
        left: 0,
        right: 0,
        height: 200,
        backgroundColor: '#2E7D32',
        borderBottomLeftRadius: 1000,
        borderBottomRightRadius: 1000,
        transform: [{ scaleX: 1.5 }],
        opacity: 0.2,
    },
    topWave2: {
        position: 'absolute',
        top: -120,
        left: -50,
        right: -50,
        height: 200,
        backgroundColor: '#2E7D32',
        borderBottomLeftRadius: 1000,
        borderBottomRightRadius: 1000,
        transform: [{ scaleX: 1.2 }],
        opacity: 0.15,
    },
    topDecorativeCircle: {
        position: 'absolute',
        top: 40,
        left: 40,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#2E7D32',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    topSmallCircle1: {
        position: 'absolute',
        top: 100,
        right: 40,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#88B39D',
        opacity: 0.5,
    },
    topSmallCircle2: {
        position: 'absolute',
        top: 70,
        right: 80,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2E7D32',
        opacity: 0.3,
    },
    // Bottom Design Styles
    bottomDesign: {
        position: 'fix',
        top: 70,
        left: 0,
        right: 0,
        height: 200,
        overflow: 'hidden',
    },
    wave: {
        position: 'absolute',
        bottom: -100,
        left: 0,
        right: 0,
        height: 200,
        backgroundColor: '#2E7D32',
        borderTopLeftRadius: 1000,
        borderTopRightRadius: 1000,
        transform: [{ scaleX: 1.5 }],
        opacity: 0.2,
    },
    wave2: {
        position: 'absolute',
        bottom: -120,
        left: -50,
        right: -50,
        height: 200,
        backgroundColor: '#2E7D32',
        borderTopLeftRadius: 1000,
        borderTopRightRadius: 1000,
        transform: [{ scaleX: 1.2 }],
        opacity: 0.15,
    },
    decorativeCircle: {
        position: 'absolute',
        bottom: 40,
        right: 40,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#2E7D32',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    smallCircle1: {
        position: 'absolute',
        bottom: 100,
        left: 40,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#88B39D',
        opacity: 0.5,
    },
    smallCircle2: {
        position: 'absolute',
        bottom: 70,
        left: 80,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2E7D32',
        opacity: 0.3,
    },
});

export default Login;
