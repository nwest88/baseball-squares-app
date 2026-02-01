import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { getAuth, signInAnonymously } from 'firebase/auth'; // <--- NEW IMPORTS
import { app } from './firebaseConfig'; // Ensure this exports 'app' or just import './firebaseConfig' if it initializes globally

// Screens
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import CreateScreen from './src/screens/CreateScreen';
import PlayerManager from './src/screens/PlayerManager';

const Stack = createNativeStackNavigator();
const auth = getAuth(); // Initialize Auth

const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Home: '',
      Create: 'create',
      Game: 'game/:gameId',
      PlayerManager: 'manage/:gameId',
    },
  },
};

export default function App() {
  
  // --- SILENT LOGIN LOGIC ---
  useEffect(() => {
    const signIn = async () => {
      try {
        const userCredential = await signInAnonymously(auth);
        console.log("Silent Login Success! User ID:", userCredential.user.uid);
      } catch (error) {
        console.error("Silent Login Failed:", error);
      }
    };
    signIn();
  }, []);
  // --------------------------

  return (
    <NavigationContainer linking={linking}>
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