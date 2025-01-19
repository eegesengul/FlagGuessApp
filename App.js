import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GlobalProvider } from './contexts'; // Ensure this is correct path
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import SettingsScreen from './screens/SettingsScreen';
import StatisticsScreen from './screens/StatisticsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GlobalProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Statistics" component={StatisticsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GlobalProvider>
  );
}
