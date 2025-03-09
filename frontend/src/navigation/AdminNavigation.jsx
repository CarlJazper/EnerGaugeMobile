import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import AdminDashboard from '../screens/Admin/AdminDashboard';
import TrainModel from '../screens/Admin/Training/TrainForecast';
import RecentForecasts from '../screens/Admin/Forecast/RecentForecast';
import UserList from '../screens/Admin/Users/UserList';
import UserUpdate from '../screens/Admin/Users/UserUpdate';

import Profile from '../screens/User/Profile';
import UpdateProfile from '../screens/User/UpdateProfile';  // Added Update Profile screen

const ProfileStack = createStackNavigator();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for Profile and UpdateProfile
const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileScreen" component={Profile} />
    <ProfileStack.Screen name="UpdateProfile" component={UpdateProfile} />
  </ProfileStack.Navigator>
);

const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitle: route.name, // Sets the header title dynamically
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Recent forecast') iconName = 'time';
          else if (route.name === 'Train model') iconName = 'cog';
          else if (route.name === 'Users') iconName = 'people';
          else if (route.name === 'Profile') iconName = 'person';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Train model" component={TrainModel} />
      <Tab.Screen name="Recent forecast" component={RecentForecasts} />
      <Tab.Screen name="Users" component={UserList} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};


const AdminNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
      <Stack.Screen name="UserUpdate" component={UserUpdate} options={{ title: 'Update User' }} />
    </Stack.Navigator>
  );
};

export default AdminNavigation;
