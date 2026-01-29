import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
export const auth = getAuth(app);