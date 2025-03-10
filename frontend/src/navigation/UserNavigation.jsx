import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import UserDashboard from '../screens/User/UserDashboard';
import Profile from '../screens/User/Profile';
import UpdateProfile from '../screens/User/UpdateProfile';  // Added Update Profile screen
import Forecast from '../screens/Forecast/Forecast';

const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();

// Stack navigator for Profile and UpdateProfile
const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileScreen" component={Profile} />
    <ProfileStack.Screen name="UpdateProfile" component={UpdateProfile} />
  </ProfileStack.Navigator>
);

const UserNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#86EFAC', paddingBottom: 5 },
        tabBarActiveTintColor: 'yellow',
        tabBarInactiveTintColor: 'white',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={UserDashboard}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
       <Tab.Screen
        name="Forecast"
        component={Forecast}
        options={{
          tabBarLabel: 'Forecast',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}  // Use stack navigation for profile
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default UserNavigation;
