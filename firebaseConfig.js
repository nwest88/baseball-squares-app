import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your Official Keys
const firebaseConfig = {
  apiKey: "AIzaSyCTUvY_5AZuFjUF7INvrUIwcaTFCdyspuI",
  authDomain: "baseball-squares-mvp.firebaseapp.com",
  projectId: "baseball-squares-mvp",
  storageBucket: "baseball-squares-mvp.firebasestorage.app",
  messagingSenderId: "42230358314",
  appId: "1:42230358314:web:5e71229a37f1bd19c13e53",
  measurementId: "G-N6BCY9HHJK"
};

// Initialize Firebase once
const app = initializeApp(firebaseConfig);

// Export the tools for the App to use
export const db = getFirestore(app);

// Initialize Auth with Persistence (Platform Aware)
// FIX: Logic to separate Web (Chrome) from Mobile (iOS/Android) to prevent crashing
let auth;

if (Platform.OS === 'web') {
  // On the web, Firebase handles persistence automatically (localStorage/indexedDB)
  auth = getAuth(app);
} else {
  // On mobile, we specifically need AsyncStorage to remember the user
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
}

export { auth };