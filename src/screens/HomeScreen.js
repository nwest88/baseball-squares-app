import React, { useState, useEffect, useCallback } from 'react'; 
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'; 
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import { useFocusEffect } from '@react-navigation/native'; 
import { db } from '../../firebaseConfig'; 
import { THEME } from '../theme/index.js';
import BrandHeader from '../components/BrandHeader';
import GamePoolCard from '../components/GamePoolCard'; 
import { styles } from '../styles/HomeScreen.styles'; 
import { getFollowedGames } from '../utils/storage';

export default function HomeScreen({ navigation }) {
  const [allData, setAllData] = useState([]); // Raw Firebase Data
  const [myPools, setMyPools] = useState([]);
  const [joinedPools, setJoinedPools] = useState([]); 
  const [publicPools, setPublicPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const { width } = useWindowDimensions();
  const isWide = width > 768; 

  // --- A. LISTEN TO FIREBASE (Once) ---
  useEffect(() => {
    const auth = getAuth();
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    const q = query(collection(db, "squares_pool"), orderBy("createdAt", "desc")); 
    const unsubData = onSnapshot(q, (snapshot) => {
      const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllData(games);
      setLoading(false);
    });

    return () => { unsubAuth(); unsubData(); };
  }, []);

  // --- B. FILTER LOGIC (Runs on Load AND Focus) ---
  // We wrap this in useFocusEffect so it re-runs when you come back from a game
  // (because you might have just followed a new pool)
  useFocusEffect(
    useCallback(() => {
        if (loading || allData.length === 0) return;

        const filterGames = async () => {
            const currentUserId = getAuth().currentUser?.uid;
            
            // 1. Get Followed IDs from Local Storage
            const followedIds = await getFollowedGames();

            // 2. Filter Buckets
            let mine = [];
            let joined = [];
            let others = [];

            if (currentUserId) {
                mine = allData.filter(g => g.adminId === currentUserId);
                
                // Joined = IDs in storage AND NOT my own pools
                joined = allData.filter(g => followedIds.includes(g.id) && g.adminId !== currentUserId);
                
                // Public = Not Mine, Not Joined, And Public
                others = allData.filter(g => 
                    g.adminId !== currentUserId && 
                    !followedIds.includes(g.id) && 
                    g.isPublic !== false
                );
            } else {
                // Guest Logic
                joined = allData.filter(g => followedIds.includes(g.id));
                others = allData.filter(g => !followedIds.includes(g.id) && g.isPublic !== false);
            }

            setMyPools(mine);
            setJoinedPools(joined);
            setPublicPools(others);
        };

        filterGames();
    }, [allData, loading, user]) // Re-run if data or user changes
  );

  const mapGameToCardData = (game) => {
      const cols = game.gridCols || 10;
      const rows = game.gridRows || 10;
      const totalSquares = cols * rows;
      const price = game.pricePerSquare || 0;
      
      let soldCount = 0;
      Object.keys(game).forEach(key => {
          if (key.match(/^\d+-\d+$/) && game[key]) soldCount++;
      });

      const grossPot = totalSquares * price;
      let netPot = grossPot;
      let displayHost = game.hostName || "Host";

      if (game.hostCut) {
          const cutString = game.hostCut.toString().trim();
          let cutAmount = 0;
          if (cutString.includes('%')) {
              const percentage = parseFloat(cutString.replace('%', ''));
              if (!isNaN(percentage)) {
                  cutAmount = grossPot * (percentage / 100);
                  displayHost += ` • ${cutString} Cut`; 
              }
          } else {
              const flat = parseFloat(cutString.replace(/[^0-9.]/g, ''));
              if (!isNaN(flat)) {
                  cutAmount = flat;
                  if (cutAmount > 0) displayHost += ` • $${flat} Cut`;
              }
          }
          netPot = Math.max(0, grossPot - cutAmount);
      }

      const qtrPayout = netPot > 0 ? netPot / 4 : 0; 

      return {
          title: game.name || "Unnamed Pool",
          host: displayHost,
          teamA: game.topTeam ? game.topTeam.substring(0, 3).toUpperCase() : "AWAY", 
          teamB: game.leftTeam ? game.leftTeam.substring(0, 3).toUpperCase() : "HOME",
          squaresSold: soldCount,
          totalSquares: totalSquares,
          costPerSquare: price,
          totalPot: netPot,
          payouts: { q1: qtrPayout, q2: qtrPayout, q3: qtrPayout, final: qtrPayout }
      };
  };

  const PoolSection = ({ title, data, showIfEmpty = false }) => {
    if (data.length === 0 && !showIfEmpty) return null;

    return (
      <View style={{ marginBottom: 30 }}>
        <Text style={styles.sectionHeader}>{title}</Text>
        <View style={{ 
            flexDirection: isWide ? 'row' : 'column', 
            flexWrap: 'wrap', 
            gap: 15,
            alignItems: 'stretch'
        }}>
            {data.length === 0 && showIfEmpty ? (
                <View style={[styles.emptyContainer, { width: '100%' }]}>
                    <Text style={styles.emptyText}>You don't manage any pools yet.</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Create')}>
                        <Text style={styles.createLink}>Create one now →</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                data.map(item => (
                    <TouchableOpacity 
                        key={item.id}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('Game', { gameId: item.id })}
                        style={isWide ? { width: '32%', minWidth: 350 } : { width: '100%' }}
                    >
                        <View style={{ height: '100%' }}>
                            <GamePoolCard data={mapGameToCardData(item)} />
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={Platform.OS === 'web' ? { maxWidth: 800, width: '100%', alignSelf: 'center', flex: 1 } : { flex: 1 }}>
        <BrandHeader title="Dashboard" />
        
        {loading ? (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={THEME.primary} />
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
             <PoolSection title="Pools I Manage" data={myPools} showIfEmpty={true} />
             {/* 3. THIS SECTION NOW WORKS */}
             <PoolSection title="Pools I'm In" data={joinedPools} />
             <PoolSection title="Public Pools" data={publicPools} />
          </ScrollView>
        )}

        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => navigation.navigate('Create')}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}