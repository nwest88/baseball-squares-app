const { initializeApp } = require("firebase/app");
const { getFirestore, doc, writeBatch } = require("firebase/firestore");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");

// 1. CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyCTUvY_5AZuFjUF7INvrUIwcaTFCdyspuI",
  authDomain: "baseball-squares-mvp.firebaseapp.com",
  projectId: "baseball-squares-mvp",
  storageBucket: "baseball-squares-mvp.firebasestorage.app",
  messagingSenderId: "42230358314",
  appId: "1:42230358314:web:5e71229a37f1bd19c13e53",
  measurementId: "G-N6BCY9HHJK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 2. ADMIN CREDENTIALS
// Ensure these match the user you created in Firebase Console
const ADMIN_EMAIL = "admin@squares.com"; 
const ADMIN_PASS = "SuperBowl2026!";    

// 3. THE REAL DATA (From your 'Supporters.csv')
const buyers = [
  { name: "Jessie Griggs", qty: 2 },
  { name: "Gary Hoxie", qty: 4 },
  { name: "Betsy LeDoux", qty: 1 },
  { name: "Jared Hurlbut", qty: 2 },
  { name: "Stephanie Schild", qty: 2 },
  { name: "Tony Jones", qty: 2 },
  { name: "Tammy Flack", qty: 4 },
  { name: "Deb Thornburg", qty: 1 },
  { name: "Callie Wier", qty: 1 },
  { name: "John McKinney", qty: 4 },
  { name: "Doug Preston", qty: 2 },
  { name: "Lauren West", qty: 1 },
  { name: "Nick Baker", qty: 1 },
  { name: "Rachael Ranew", qty: 1 },
  { name: "Trisha Seil", qty: 1 },
  { name: "Rhonda Minick", qty: 1 },
  { name: "Barb Rathburn", qty: 2 },
  { name: "Matt Anderson", qty: 2 },
  { name: "Kathy Anderson", qty: 4 },
  { name: "Colin Brandt", qty: 1 },
  { name: "Stephanie Mcmeekan", qty: 1 },
  { name: "Becky Porter", qty: 1 },
  { name: "Seth Porter", qty: 1 },
  { name: "Gwen Tombergs", qty: 1 },
  { name: "Dave Wayne", qty: 1 },
  { name: "Cherie Prowant", qty: 1 },
  { name: "Steve Felderman", qty: 2 },
  { name: "Dawn Nelson", qty: 1 },
  { name: "Parker Ruth", qty: 1 },
  { name: "Clint Ruth", qty: 1 },
  { name: "Jared Penning", qty: 2 },
  { name: "Rick Hoxie", qty: 1 },
  { name: "Amanda Hoxie", qty: 1 },
  { name: "Katie Hager", qty: 1 },
  { name: "Josh Paul", qty: 1 },
  { name: "Kahne Bohn", qty: 2 },
  { name: "Robin Anderson", qty: 1 },
  { name: "Marissa Berryman", qty: 1 },
  { name: "Doug Anderson", qty: 4 },
  { name: "Cara Ayers", qty: 2 },
  { name: "Chris Ayers", qty: 2 },
  { name: "Natalie Wayne", qty: 1 },
  { name: "Drew Wayne", qty: 1 },
  { name: "Jessica Mahieu", qty: 1 },
  { name: "Jennifer McGivern", qty: 2 },
  { name: "Leppert family", qty: 4 },
  { name: "Mike Shaw", qty: 1 },
  { name: "Gene Leppert", qty: 1 },
  { name: "Nancy Leppert", qty: 1 },
  { name: "Hager Family", qty: 1 },
  { name: "Orian Hinrichs", qty: 1 },
  { name: "Christia Nache", qty: 2 },
  { name: "Lisa Requet", qty: 1 },
  { name: "Krystal Miranda", qty: 4 },
  { name: "Ryan Preston", qty: 1 },
  { name: "Sue Kargas", qty: 1 },
  { name: "Kiara Bolster", qty: 2 },
  { name: "Bill Wilford", qty: 1 },
  { name: "Geno Galvan", qty: 2 },
  { name: "Amy Hoxie", qty: 1 },
  { name: "Arensdorff", qty: 3 }
];

async function seed() {
  console.log("🔐 Logging in as Admin...");
  
  try {
    // A. LOGIN FIRST
    await signInWithEmailAndPassword(auth, "Nicalaus.west@gmail.com", "SuperBowl2026!");
    console.log("✅ Logged in!");

    // B. UPLOAD DATA
    const batch = writeBatch(db);
    console.log(`Preparing ${buyers.length} buyers...`);
    
    // Total Validation
    let totalSquares = 0;
    buyers.forEach((person) => {
      totalSquares += person.qty;
      const ref = doc(db, "buyers", person.name);
      batch.set(ref, person);
    });

    if (totalSquares !== 100) {
      console.warn(`⚠️ WARNING: Total squares is ${totalSquares}, not 100! Check your data.`);
    } else {
      console.log(`✅ Validation Passed: Exactly ${totalSquares} squares.`);
    }

    await batch.commit();
    console.log("✅ Ledger Uploaded to Firestore!");
    console.log("👉 Now go to your App, Log in, and click 'Generate Grid'!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

seed();