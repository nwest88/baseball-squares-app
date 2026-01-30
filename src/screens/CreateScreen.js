import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { doc, setDoc } from 'firebase/firestore'; 
import { db } from '../../firebaseConfig'; 
import { THEME } from '../theme';

const generateGameId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export default function CreateScreen({ navigation }) {
  const [name, setName] = useState('');
  const [topTeam, setTopTeam] = useState('');
  const [leftTeam, setLeftTeam] = useState('');
  
  // NEW: State for Grid Size (Default to 10 for 100 squares)
  // Options: 10 (100 sq), 5 (25 sq)
  const [gridSize, setGridSize] = useState(10); 
  
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !topTeam || !leftTeam) {
      Alert.alert("Missing Info", "Please fill out all fields.");
      return;
    }

    setLoading(true);
    const newGameId = generateGameId();

    try {
      await setDoc(doc(db, "squares_pool", newGameId), {
        id: newGameId,
        name: name,
        topTeam: topTeam,
        leftTeam: leftTeam,
        createdAt: new Date(),
        
        // NEW: Save the Grid Size
        gridSize: gridSize, 
        
        // DYNAMIC: Initialize Axis based on size (10 slots or 5 slots)
        topAxis: Array(gridSize).fill("?"), 
        leftAxis: Array(gridSize).fill("?"),
        
        scores: {
            q1: { top: '', left: '' },
            q2: { top: '', left: '' },
            q3: { top: '', left: '' },
            final: { top: '', left: '' },
        }
      });

      setLoading(false);
      navigation.replace('Game', { gameId: newGameId });

    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Could not create pool: " + error.message);
    }
  };

  // Helper Component for Size Buttons
  const SizeOption = ({ size, label, squares }) => (
    <TouchableOpacity 
        style={[styles.sizeBtn, gridSize === size && styles.sizeBtnActive]} 
        onPress={() => setGridSize(size)}
    >
        <Text style={[styles.sizeBtnText, gridSize === size && styles.sizeBtnTextActive]}>{squares}</Text>
        <Text style={[styles.sizeLabel, gridSize === size && styles.sizeLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>New Pool</Text>

        {/* 1. Name Input */}
        <View style={styles.formGroup}>
            <Text style={styles.label}>Pool Name</Text>
            <TextInput 
                style={styles.input} 
                placeholder="e.g. Super Bowl Party" 
                placeholderTextColor="#666"
                value={name} onChangeText={setName}
            />
        </View>

        {/* 2. Team Inputs */}
        <View style={styles.row}>
            <View style={[styles.formGroup, {flex: 1, marginRight: 10}]}>
                <Text style={styles.label}>Top Team</Text>
                <TextInput 
                    style={styles.input} placeholder="e.g. Chiefs" placeholderTextColor="#666"
                    value={topTeam} onChangeText={setTopTeam}
                />
            </View>
            <View style={[styles.formGroup, {flex: 1}]}>
                <Text style={styles.label}>Left Team</Text>
                <TextInput 
                    style={styles.input} placeholder="e.g. Eagles" placeholderTextColor="#666"
                    value={leftTeam} onChangeText={setLeftTeam}
                />
            </View>
        </View>

        {/* 3. NEW: Grid Size Selector */}
        <View style={styles.formGroup}>
            <Text style={styles.label}>Grid Size</Text>
            <View style={styles.sizeRow}>
                <SizeOption size={10} squares="100" label="Standard (10x10)" />
                <SizeOption size={5} squares="25" label="Quick (5x5)" />
            </View>
        </View>

        <View style={styles.spacer} />

        {loading ? (
            <ActivityIndicator size="large" color={THEME.primary} />
        ) : (
            <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                <Text style={styles.createBtnText}>Create & Launch 🚀</Text>
            </TouchableOpacity>
        )}
        
        <Button title="Cancel" color="#666" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  content: { padding: 20 },
  header: { fontSize: 32, fontWeight: 'bold', color: THEME.text, marginBottom: 20 },
  formGroup: { marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: THEME.gold, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', fontSize: 12 },
  input: { backgroundColor: THEME.card, color: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: THEME.border, fontSize: 16 },
  spacer: { height: 10 },
  createBtn: { backgroundColor: THEME.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  
  // NEW STYLES FOR SIZE SELECTOR
  sizeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sizeBtn: { 
    flex: 1, backgroundColor: THEME.card, padding: 15, borderRadius: 8, 
    borderWidth: 1, borderColor: THEME.border, alignItems: 'center', marginHorizontal: 5 
  },
  sizeBtnActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  sizeBtnText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  sizeBtnTextActive: { color: '#fff' },
  sizeLabel: { color: '#888', fontSize: 12, marginTop: 4 },
  sizeLabelActive: { color: 'rgba(255,255,255,0.8)' }
});