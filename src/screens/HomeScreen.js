import React, { useState, useEffect } from 'react'; // Added useEffect/useState
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { THEME } from '../theme';
import BrandHeader from '../components/BrandHeader';

export default function HomeScreen({ navigation }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to the "squares_pool" collection in real-time
    // Note: If you don't have a 'createdAt' field on old data, remove the orderBy
    const q = query(collection(db, "squares_pool")); 

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedGames = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('HomeScreen loadedGames:', loadedGames);
      setGames(loadedGames);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <BrandHeader />
      <View style={{padding: 20}}>
        <Text style={styles.headerTitle}>My Pools</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={THEME.primary} style={{marginTop: 50}} />
      ) : (
        <FlatList 
            data={games} 
            keyExtractor={item => item.id} 
            renderItem={({ item }) => (
            <TouchableOpacity 
                style={styles.gameCard} 
                onPress={() => navigation.navigate('Game', { gameId: item.id })}
            >
                <View style={styles.gameIcon}>
                    <Text style={{fontSize: 24}}>🏈</Text>
                </View>
                <View style={{flex: 1}}>
                <Text style={styles.gameTitle}>{item.name ?? item.id ?? "Unnamed Pool"}</Text>
                <Text style={styles.gameDate}>
                    {item.topTeam} vs {item.leftTeam}
                </Text>
                </View>
                <Text style={{color: '#666', fontSize: 20}}>›</Text>
            </TouchableOpacity>
            )}
            // Add a placeholder if list is empty
            ListEmptyComponent={
                <Text style={{color: '#666', textAlign: 'center', marginTop: 20}}>
                    No pools yet. Tap + to start one!
                </Text>
            }
        />
      )}

      {/* Floating Action Button */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: THEME.text, marginBottom: 10 },
  gameCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.card, 
    padding: 20, borderRadius: 12, marginBottom: 15, marginHorizontal: 20,
    borderWidth: 1, borderColor: THEME.border 
  },
  gameIcon: { 
    width: 50, height: 50, backgroundColor: '#333', borderRadius: 25, 
    justifyContent: 'center', alignItems: 'center', marginRight: 15 
  },
  gameTitle: { color: THEME.text, fontSize: 18, fontWeight: 'bold' },
  gameDate: { color: '#888', fontSize: 14, marginTop: 4 },
  fab: {
    position: 'absolute', bottom: 30, right: 20, width: 60, height: 60,
    borderRadius: 30, backgroundColor: THEME.primary, justifyContent: 'center',
    alignItems: 'center', elevation: 5, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, zIndex: 100,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: -3 }
});