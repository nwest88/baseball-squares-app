import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/context/AuthContext'; // Import AuthProvider

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CreateScreen from './src/screens/CreateScreen';
import GameScreen from './src/screens/GameScreen';
import ProfileScreen from './src/screens/ProfileScreen'; // Assuming you have a ProfileScreen

const Stack = createNativeStackNavigator();

// Define Linking Configuration
const linking = {
  prefixes: ['https://quiksquares.app', 'quiksquares://'],
  config: {
    screens: {
      Home: '',
      Create: 'create',
      Game: 'game/:gameId', // Map /game/ID to GameScreen params
      Profile: 'profile',
    },
  },
};

function AppContent() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Create" component={CreateScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      {/* Add Profile Screen if it exists */}
      {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */} 
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer linking={linking}>
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}