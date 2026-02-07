import React, { useState, useEffect, useCallback } from 'react'; 
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, useWindowDimensions, Platform, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'; 
import { useFocusEffect } from '@react-navigation/native'; 
import { Ionicons } from '@expo/vector-icons'; // Added for icons

import { db } from '../../firebaseConfig'; 
import { THEME } from '../theme/index.js';
import BrandHeader from '../components/BrandHeader';
import GamePoolCard from '../components/GamePoolCard'; 
import { styles } from '../styles/HomeScreen.styles'; 
import { getFollowedGames } from '../utils/storage';

// 1. IMPORT THE AUTH CONTEXT
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  // 2. USE THE HOOK
  const { user, showLogin, loading: authLoading } = useAuth();
  
  const [allData, setAllData] = useState([]); 
  const [myPools, setMyPools] = useState([]);
  const [joinedPools, setJoinedPools] = useState([]); 
  const [publicPools, setPublicPools] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Phase 3: Search State
  const [searchText, setSearchText] = useState('');

  const { width } = useWindowDimensions();
  const isWide = width > 768; 

  // --- A. LISTEN TO FIREBASE DATA ---
  // (Auth listener removed because AuthContext handles it now)
  useEffect(() => {
    const q = query(collection(db, "squares_pool"), orderBy("createdAt", "desc")); 
    const unsubData = onSnapshot(q, (snapshot) => {
      const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllData(games);
      setDataLoading(false);
    });

    return () => { unsubData(); };
  }, []);

  // --- B. FILTER LOGIC ---
  useFocusEffect(
    useCallback(() => {
        if (dataLoading || allData.length === 0) return;

        const filterGames = async () => {
            // Use 'user' from Context instead of getAuth()
            const currentUserId = user?.uid;
            
            const followedIds = await getFollowedGames();

            let mine = [];
            let joined = [];
            let others = [];

            if (currentUserId) {
                mine = allData.filter(g => g.adminId === currentUserId);
                joined = allData.filter(g => followedIds.includes(g.id) && g.adminId !== currentUserId);
                others = allData.filter(g => 
                    g.adminId !== currentUserId && 
                    !followedIds.includes(g.id) && 
                    g.isPublic !== false
                );
            } else {
                joined = allData.filter(g => followedIds.includes(g.id));
                others = allData.filter(g => !followedIds.includes(g.id) && g.isPublic !== false);
            }

            // Simple Search Filter
            if (searchText) {
              const lowerSearch = searchText.toLowerCase();
              const searchFilter = g => g.id.toLowerCase().includes(lowerSearch) || g.name?.toLowerCase().includes(lowerSearch);
              mine = mine.filter(searchFilter);
              joined = joined.filter(searchFilter);
              others = others.filter(searchFilter);
            }

            setMyPools(mine);
            setJoinedPools(joined);
            setPublicPools(others);
        };

        filterGames();
    }, [allData, dataLoading, user, searchText]) // Re-run if user or search changes
  );

  const handleSearch = () => {
    if (searchText.length > 0) {
       // Could navigate to specific game if ID matches exactly, 
       // but for now the filter above handles it visually.
    }
  };

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
                    {/* Trigger Login if guest, otherwise Create */}
                    <TouchableOpacity onPress={() => user ? navigation.navigate('Create') : showLogin()}>
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
        
        {/* --- PHASE 3: STATUS BAR & SEARCH --- */}
        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          {/* Auth Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={{ color: THEME.subtext, fontWeight: '600' }}>
              {user ? `Hello, ${user.email?.split('@')[0] || 'User'}` : 'Guest Mode'}
            </Text>
            {user ? (
               <TouchableOpacity 
                 onPress={() => navigation.navigate('Profile')}
                 style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.background, padding: 6, borderRadius: 20, borderWidth: 1, borderColor: THEME.border }}
               >
                 <Ionicons name="person-circle" size={24} color={THEME.primary} />
                 <Text style={{ marginLeft: 6, color: THEME.primary, fontWeight: 'bold', fontSize: 12, marginRight: 4 }}>PROFILE</Text>
               </TouchableOpacity>
            ) : (
               <TouchableOpacity 
                 onPress={showLogin}
                 style={{ backgroundColor: THEME.primary, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 }}
               >
                 <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>LOG IN</Text>
               </TouchableOpacity>
            )}
          </View>

          {/* Search Bar */}
          <View style={{ flexDirection: 'row', backgroundColor: THEME.card, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: THEME.border, alignItems: 'center' }}>
            <Ionicons name="search" size={20} color={THEME.subtext} style={{ marginRight: 10 }} />
            <TextInput 
              placeholder="Search by Pool ID or Name..."
              placeholderTextColor={THEME.subtext}
              style={{ flex: 1, fontSize: 16, color: THEME.text }}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {dataLoading || authLoading ? (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={THEME.primary} />
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
              <PoolSection title="Pools I Manage" data={myPools} showIfEmpty={!!user} />
              <PoolSection title="Pools I'm In" data={joinedPools} />
              <PoolSection title="Public Pools" data={publicPools} />
          </ScrollView>
        )}

        <TouchableOpacity 
          style={styles.fab} 
          // Trigger Login if guest, otherwise Create
          onPress={() => user ? navigation.navigate('Create') : showLogin()}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}