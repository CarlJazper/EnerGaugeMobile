import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AdminDashboard from '../screens/Admin/AdminDashboard';
import Login from '../screens/User/Login';
import Register from '../screens/User/Register';
import UserNavigation from './UserNavigation';  // Import the new User Navigation

const Stack = createStackNavigator();

const Navigation = () => {
  const [initialRoute, setInitialRoute] = useState('UserLogin');

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');

        if (token && role) {
          setInitialRoute(role === 'admin' ? 'AdminDashboard' : 'UserNavigation');
        } else {
          setInitialRoute('UserLogin');
        }
      } catch (error) {
        console.log('Error checking auth status:', error);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserLogin" component={Login} />
      <Stack.Screen name="UserRegister" component={Register} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="UserNavigation" component={UserNavigation} />  
    </Stack.Navigator>
  );
};

export default Navigation;
