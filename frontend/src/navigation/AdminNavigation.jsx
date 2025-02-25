import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // For icons

import AdminDashboard from '../screens/Admin/AdminDashboard';
import ForecastData from '../screens/Admin/Forecast/ForecastData';
import TrainModel from '../screens/Admin/Training/TrainForecast'
import RecentForecasts from '../screens/Admin/Forecast/RecentForecast';
import UserList from '../screens/Admin/Users/UserList';

const Tab = createBottomTabNavigator();

const AdminNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Forecast') iconName = 'bar-chart';
          else if (route.name === 'Recent') iconName = 'time';
          else if (route.name === 'Train') iconName = 'cog';
          else if (route.name === 'Users') iconName = 'people';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF', // Active tab color
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Forecast" component={ForecastData} />
      <Tab.Screen name="Train" component={TrainModel}/>
      <Tab.Screen name="Recent" component={RecentForecasts} />
      <Tab.Screen name="Users" component={UserList} />
    </Tab.Navigator>
  );
};

export default AdminNavigation;
