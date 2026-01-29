import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { THEME } from '../theme'; // Importing your new theme file

export default function HomeScreen({ navigation }) {
  // MVP: Hardcoded list for now. Later this comes from Firebase.
  const games = [
    { id: 'super_bowl_2026', name: 'LBC Silver 12U', date: 'Feb 9, 2026', type: 'Super Bowl' }
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={{padding: 20}}>
        <Text style={styles.headerTitle}>My Pools</Text>
      </View>
      
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
              <Text style={styles.gameTitle}>{item.name}</Text>
              <Text style={styles.gameDate}>{item.type} • {item.date}</Text>
            </View>
            <Text style={{color: '#666', fontSize: 20}}>›</Text>
          </TouchableOpacity>
        )}
      />
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
});