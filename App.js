import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Context & Components
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginModal from './src/components/LoginModal';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CreateScreen from './src/screens/CreateScreen';
import GameScreen from './src/screens/GameScreen';
import PlayerManager from './src/screens/PlayerManager';
// Note: We are no longer using LoginScreen.js as a route!
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

// We create a separate component for the content so it can use the useAuth hook
// (You can't use a hook inside the same component that creates the Provider)
const AppContent = () => {
  const { user, modalVisible, hideLogin } = useAuth();

  return (
    <>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          {/* We pass 'user' prop to screens to maintain compatibility 
            with your existing code, even though they *could* use useAuth() now.
          */}
          <Stack.Screen name="Home">
            {props => <HomeScreen {...props} user={user} />}
          </Stack.Screen>
          
          <Stack.Screen name="Create">
            {props => <CreateScreen {...props} user={user} />}
          </Stack.Screen>
          
          <Stack.Screen name="Game">
            {props => <GameScreen {...props} user={user} />}
          </Stack.Screen>
          
          <Stack.Screen name="PlayerManager" component={PlayerManager} />
          
          <Stack.Screen name="Profile">
            {props => <ProfileScreen {...props} user={user} />}
          </Stack.Screen>

        </Stack.Navigator>
      </NavigationContainer>

      {/* GLOBAL LOGIN MODAL - Lives outside navigation */}
      <LoginModal visible={modalVisible} onClose={hideLogin} />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}