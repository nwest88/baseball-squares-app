import React, { useState, useEffect } from 'react'; 
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'; 
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import { db } from '../../firebaseConfig'; 
import { THEME } from '../theme';
import BrandHeader from '../components/BrandHeader';
import GamePoolCard from '../components/GamePoolCard'; 
import { styles } from '../styles/HomeScreen.styles'; 

export default function HomeScreen({ navigation }) {
  const [myPools, setMyPools] = useState([]);
  const [joinedPools, setJoinedPools] = useState([]); 
  const [publicPools, setPublicPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Responsive layout hook
  const { width } = useWindowDimensions();
  // Simple breakpoint: > 768px is "Web/Tablet" mode
  const isWideScreen = width > 768; 

  useEffect(() => {
    const auth = getAuth();
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    const q = query(collection(db, "squares_pool"), orderBy("createdAt", "desc")); 
    
    const unsubData = onSnapshot(q, (snapshot) => {
      const allGames = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const currentUserId = auth.currentUser?.uid;

      if (currentUserId) {
          const mine = allGames.filter(g => g.adminId === currentUserId);
          const joined = []; 
          const others = allGames.filter(g => g.adminId !== currentUserId); 
          
          setMyPools(mine);
          setJoinedPools(joined);
          setPublicPools(others);
      } else {
          setMyPools([]);
          setJoinedPools([]);
          setPublicPools(allGames);
      }
      
      setLoading(false);
    });

    return () => { unsubAuth(); unsubData(); };
  }, []);

  const mapGameToCardData = (game) => {
      const cols = game.gridCols || 10;
      const rows = game.gridRows || 10;
      const totalSquares = cols * rows;
      const price = game.pricePerSquare || 0;
      
      let soldCount = 0;
      Object.keys(game).forEach(key => {
          if (key.match(/^\d+-\d+$/) && game[key]) {
              soldCount++;
          }
      });

      // 1. Calculate Gross Pot (Total Potential)
      const grossPot = totalSquares * price;
      
      // 2. Handle Host Cut Logic
      let netPot = grossPot;
      let displayHost = game.hostName || "Host";

      if (game.hostCut) {
          const cutString = game.hostCut.toString().trim();
          let cutAmount = 0;

          if (cutString.includes('%')) {
              // Percentage Cut (e.g. "50%")
              const percentage = parseFloat(cutString.replace('%', ''));
              if (!isNaN(percentage)) {
                  cutAmount = grossPot * (percentage / 100);
                  displayHost += ` • ${cutString} Cut`; 
              }
          } else {
              // Flat Amount (e.g. "500" or "$500")
              const flat = parseFloat(cutString.replace(/[^0-9.]/g, ''));
              if (!isNaN(flat)) {
                  cutAmount = flat;
                  if (cutAmount > 0) {
                      displayHost += ` • $${flat} Cut`;
                  }
              }
          }
          // Ensure pot doesn't go below zero
          netPot = Math.max(0, grossPot - cutAmount);
      }

      // 3. Calculate Payouts based on NET Pot
      const qtrPayout = netPot > 0 ? netPot / 4 : 0; 

      return {
          title: game.name || "Unnamed Pool",
          host: displayHost,
          teamA: game.topTeam ? game.topTeam.substring(0, 3).toUpperCase() : "AWAY", 
          teamB: game.leftTeam ? game.leftTeam.substring(0, 3).toUpperCase() : "HOME",
          squaresSold: soldCount,
          totalSquares: totalSquares,
          costPerSquare: price,
          totalPot: netPot, // Displaying the WINNABLE amount
          payouts: {
              q1: qtrPayout,
              q2: qtrPayout,
              q3: qtrPayout,
              final: qtrPayout
          }
      };
  };

  // Helper Component to Render a Grid Section
  const PoolSection = ({ title, data, showIfEmpty = false }) => {
    if (data.length === 0 && !showIfEmpty) return null;

    return (
      <View style={{ marginBottom: 30 }}>
        <Text style={styles.sectionHeader}>{title}</Text>
        
        {/* GRID CONTAINER */}
        <View style={{ 
            flexDirection: isWideScreen ? 'row' : 'column', 
            flexWrap: 'wrap', 
            gap: 15 // Adds space between grid items
        }}>
            
            {/* EMPTY STATE */}
            {data.length === 0 && showIfEmpty ? (
                <View style={[styles.emptyContainer, { width: '100%' }]}>
                    <Text style={styles.emptyText}>You don't manage any pools yet.</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Create')}>
                        <Text style={styles.createLink}>Create one now →</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                // CARD MAPPING
                data.map(item => (
                    <TouchableOpacity 
                        key={item.id}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('Game', { gameId: item.id })}
                        style={
                            isWideScreen 
                            ? { width: '32%', minWidth: 350 } // 3-Column Grid on Laptop
                            : { width: '100%' }               // 1-Column Stack on Phone
                        }
                    >
                        <GamePoolCard data={mapGameToCardData(item)} />
                    </TouchableOpacity>
                ))
            )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* ScrollView Wrapper (Instead of SectionList) */}
      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false} // <--- HIDES THE UGLY SCROLLBAR
      >
        <BrandHeader title="Dashboard" />
        
        {loading ? (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={THEME.primary} />
          </View>
        ) : (
          <View>
             {/* Render Sections Manually */}
             <PoolSection title="Pools I Manage" data={myPools} showIfEmpty={true} />
             <PoolSection title="Pools I'm In" data={joinedPools} />
             <PoolSection title="Public Pools" data={publicPools} />
          </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('Create')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}