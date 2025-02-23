import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AdminDashboard from '../screens/Admin/AdminDashboard';
import Login from '../screens/User/Login';
import Register from '../screens/User/Register';
import UserNavigation from './UserNavigation';  // Import the new User Navigation
import Home from '../screens/Home';  // Import Home screen
import AboutUs from '../screens/AboutUs';  // Import About Us screen

const Stack = createStackNavigator();

const Navigation = () => {
  const [initialRoute, setInitialRoute] = useState('Home');  // Set Home as the initial screen

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');

        if (token && role) {
          setInitialRoute(role === 'admin' ? 'AdminDashboard' : 'UserNavigation');
        } else {
          setInitialRoute('Home');  // Default to Home if not logged in
        }
      } catch (error) {
        console.log('Error checking auth status:', error);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="AboutUs" component={AboutUs} />
      <Stack.Screen name="UserLogin" component={Login} />
      <Stack.Screen name="UserRegister" component={Register} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="UserNavigation" component={UserNavigation} />  
    </Stack.Navigator>
  );
};

export default Navigation;
