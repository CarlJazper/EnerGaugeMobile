import React, { useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,Alert,ScrollView,KeyboardAvoidingView,Platform,SafeAreaView,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import config from "../../utils/config";

const Register = () => {
    const navigation = useNavigation();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async () => {
        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            const response = await axios.post(`${config.API_BASE_URL}/api/users/register`, {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
            });

            if (response.status === 201) {
                Alert.alert(
                    'Registration Successful',
                    'Please check your email for verification.',
                    [{ text: 'OK', onPress: () => navigation.navigate('UserLogin') }]
                );
            }
        } catch (error) {
            console.error('Registration failed:', error);
            Alert.alert(
                'Registration Failed',
                error.response?.data?.message || 'An error occurred. Please try again.'
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Create an Account</Text>
                        <Text style={styles.subtitle}>Sign up to get started</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.nameContainer}>
                            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                                <MaterialIcons name="person" size={20} color="#88B39D" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="First Name"
                                    placeholderTextColor="#88B39D"
                                    value={formData.firstName}
                                    onChangeText={(text) => handleChange('firstName', text)}
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                                <MaterialIcons name="person" size={20} color="#88B39D" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Last Name"
                                    placeholderTextColor="#88B39D"
                                    value={formData.lastName}
                                    onChangeText={(text) => handleChange('lastName', text)}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialIcons name="email" size={20} color="#88B39D" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#88B39D"
                                keyboardType="email-address"
                                value={formData.email}
                                onChangeText={(text) => handleChange('email', text)}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialIcons name="phone" size={20} color="#88B39D" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone Number"
                                placeholderTextColor="#88B39D"
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(text) => handleChange('phone', text)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialIcons name="lock" size={20} color="#88B39D" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#88B39D"
                                secureTextEntry={!showPassword}
                                value={formData.password}
                                onChangeText={(text) => handleChange('password', text)}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <MaterialIcons
                                    name={showPassword ? "visibility" : "visibility-off"}
                                    size={20}
                                    color="#88B39D"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialIcons name="lock" size={20} color="#88B39D" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                placeholderTextColor="#88B39D"
                                secureTextEntry={!showConfirmPassword}
                                value={formData.confirmPassword}
                                onChangeText={(text) => handleChange('confirmPassword', text)}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <MaterialIcons
                                    name={showConfirmPassword ? "visibility" : "visibility-off"}
                                    size={20}
                                    color="#88B39D"
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                            <Text style={styles.registerButtonText}>Create Account</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.signInTextContainer} 
                            onPress={() => navigation.navigate('UserLogin')}
                        >
                            <Text style={styles.signInText}>Have an account? <Text style={styles.signInLink}>Sign in</Text></Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F9F7',
    },
    keyboardView: {
        flex: 1,
    },
    headerContainer: {
        marginTop: 140,
        marginBottom: 30,
        paddingHorizontal: 30,
    },
    title: {
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
    },
    nameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
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
    registerButton: {
        backgroundColor: '#86EFAC',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#2E7D32',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    registerButtonText: {
        color: '#065F46',
        fontSize: 18,
        fontWeight: '600',
    },
    signInTextContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    signInText: {
        fontSize: 16,
        color: '#88B39D',
    },
    signInLink: {
        color: '#718096',
        fontWeight: '600',
    },
});

export default Register;