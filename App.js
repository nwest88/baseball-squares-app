import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTUvY_5AZuFjUF7INvrUIwcaTFCdyspuI",
  authDomain: "baseball-squares-mvp.firebaseapp.com",
  projectId: "baseball-squares-mvp",
  storageBucket: "baseball-squares-mvp.firebasestorage.app",
  messagingSenderId: "42230358314",
  appId: "1:42230358314:web:5e71229a37f1bd19c13e53",
  measurementId: "G-N6BCY9HHJK"
};

// --- 2. INITIALIZATION ---
// This turns on the connection
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export default function App() {
  const [gridData, setGridData] = useState({});

  // --- 2. REAL-TIME LISTENER (The "Live Wire") ---
  useEffect(() => {
    // This listens to the document. Any change in the DB triggers this code instantly.
    const unsub = onSnapshot(doc(db, "squares_pool", "super_bowl_2026"), (doc) => {
      if (doc.exists()) {
        setGridData(doc.data());
      }
    });
    return () => unsub(); // Cleanup when app closes
  }, []);

  // --- 3. BUY LOGIC ---
  const handlePressSquare = async (row, col) => {
    const key = `${row}-${col}`;
    
    // Logic: If someone already owns it, don't let me buy it.
    if (gridData[key]) {
      Alert.alert("Taken!", `Owned by: ${gridData[key]}`);
      return;
    }

    // Logic: Claim the square
    const name = prompt("Enter your name:") || "Anonymous"; // Simple prompt for Web
    // Note: 'prompt' works on Web. On mobile native, we'd need a different input, 
    // but for this MVP, we will hardcode a name if prompt fails or use "Nic".
    
    const finalName = name === "Anonymous" ? "Nic West" : name;

    try {
      await setDoc(doc(db, "squares_pool", "super_bowl_2026"), {
        [key]: finalName
      }, { merge: true });
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  // --- 4. RENDER THE 10x10 GRID ---
  const renderGrid = () => {
    let squares = [];
    // Loop 0 to 99 to create 100 boxes
    for (let i = 0; i < 100; i++) {
      const row = Math.floor(i / 10);
      const col = i % 10;
      const key = `${row}-${col}`;
      const owner = gridData[key];

      squares.push(
        <TouchableOpacity 
          key={key} 
          style={[styles.square, owner ? styles.takenSquare : styles.freeSquare]}
          onPress={() => handlePressSquare(row, col)}
        >
          {/* If owner exists, show first 3 letters. If not, show coords */}
          <Text style={styles.squareText}>
            {owner ? owner.substring(0, 3).toUpperCase() : ""}
          </Text>
        </TouchableOpacity>
      );
    }
    return squares;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏈 Super Bowl Squares</Text>
      
      <View style={styles.gridContainer}>
        {renderGrid()}
      </View>

      <Text style={styles.instructions}>Tap a green square to buy.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

// --- STYLES (The Paint Job) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row', // Lay items out side-by-side
    flexWrap: 'wrap',     // Wrap to next line when full
    width: 320,           // Fixed width to keep it square-ish
    height: 320,
    backgroundColor: '#000',
    borderWidth: 1,
  },
  square: {
    width: '10%', // 10% of 320px = 32px
    height: '10%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  freeSquare: {
    backgroundColor: '#4CAF50', // Green for open
  },
  takenSquare: {
    backgroundColor: '#B71C1C', // Red for taken
  },
  squareText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  instructions: {
    marginTop: 20,
    color: 'gray',
  }
});