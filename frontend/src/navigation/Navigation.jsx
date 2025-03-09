import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AdminNavigation from './AdminNavigation';
import UserNavigation from './UserNavigation';  
import Login from '../screens/User/Login';
import Register from '../screens/User/Register';
import Home from '../screens/Home';  
import AboutUs from '../screens/AboutUs';  

const Stack = createStackNavigator();

const Navigation = () => {
  const [initialRoute, setInitialRoute] = useState('Home');

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');

        if (token && role) {
          setInitialRoute(role === 'admin' ? 'AdminNavigation' : 'UserNavigation');
        } else {
          setInitialRoute('Home');
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
      <Stack.Screen name="AdminNavigation" component={AdminNavigation} />
      <Stack.Screen name="UserNavigation" component={UserNavigation} />  
    </Stack.Navigator>
  );
};

export default Navigation;
