import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
//screens
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import CreateScreen from './src/screens/CreateScreen';
import PlayerManager from './src/screens/PlayerManager';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Game" component={GameScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Create" component={CreateScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PlayerManager" component={PlayerManager} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}