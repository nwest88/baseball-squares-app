import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, TextInput, Alert, Button, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; 
import { THEME } from '../theme';

export default function PlayerManager({ route, navigation }) {
  const { gameId } = route.params;
  const [gridData, setGridData] = useState({});
  const [loading, setLoading] = useState(true);
  
  // AUTO ASSIGN FORM STATE
  const [name, setName] = useState("");
  const [count, setCount] = useState("");
  const [note, setNote] = useState(""); // <--- NEW: Note input

  // EDIT PLAYER STATE
  const [selectedPlayer, setSelectedPlayer] = useState(null); // The player being edited
  const [editNote, setEditNote] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  // LOAD DATA
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "squares_pool", gameId), (docSnap) => {
      if (docSnap.exists()) {
        setGridData(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, [gameId]);

  // --- 1. STATS ENGINE ---
  const getBoardStats = () => {
    const cols = gridData.gridCols || 10;
    const rows = gridData.gridRows || 10;
    const totalSquares = cols * rows;
    let takenCount = 0;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (gridData[`${r}-${c}`]) takenCount++;
      }
    }
    
    return {
      total: totalSquares,
      taken: takenCount,
      remaining: totalSquares - takenCount,
      isFull: takenCount >= totalSquares
    };
  };

  const stats = getBoardStats();

  // --- 2. PLAYER AGGREGATION ---
  const getPlayerStats = () => {
    const playerMap = {};
    const cols = gridData.gridCols || 10;
    const rows = gridData.gridRows || 10;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = gridData[`${r}-${c}`];
        if (cell) {
          const playerName = (typeof cell === 'object') ? cell.name : cell;
          const playerNote = (typeof cell === 'object') ? cell.note : "";
          
          if (playerName) {
             if (!playerMap[playerName]) {
                 playerMap[playerName] = { count: 0, note: playerNote }; // Grab first found note
             }
             playerMap[playerName].count++;
          }
        }
      }
    }
    // Convert to Array
    return Object.keys(playerMap)
        .map(name => ({ name, count: playerMap[name].count, note: playerMap[name].note }))
        .sort((a, b) => b.count - a.count);
  };

  // --- 3. AUTO ASSIGN LOGIC ---
  const handleAutoAssign = async () => {
    if (stats.isFull) return; 

    if (!name.trim()) { Alert.alert("Error", "Name required"); return; }
    const numSquares = parseInt(count);
    if (isNaN(numSquares) || numSquares < 1) { Alert.alert("Error", "Invalid number"); return; }
    
    if (numSquares > stats.remaining) {
        Alert.alert("No Room", `Only ${stats.remaining} squares available.`);
        return;
    }

    // Find Empty Keys
    const emptyKeys = [];
    const cols = gridData.gridCols || 10;
    const rows = gridData.gridRows || 10;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${r}-${c}`;
        if (!gridData[key]) emptyKeys.push(key);
      }
    }

    // Randomize & Slice
    const shuffled = emptyKeys.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numSquares);

    // Batch Update
    const updateObj = {};
    const playerData = { name, email: "", note: note }; // <--- Saving the Note
    selected.forEach(key => updateObj[key] = playerData);

    try {
        await updateDoc(doc(db, "squares_pool", gameId), updateObj);
        setName(""); setCount(""); setNote(""); // Reset form
    } catch (e) {
        Alert.alert("Error", e.message);
    }
  };

  // --- 4. BULK UPDATE NOTE LOGIC ---
  const openEditModal = (player) => {
      setSelectedPlayer(player);
      setEditNote(player.note || "");
      setShowEditModal(true);
  };

  const saveBulkNote = async () => {
      if (!selectedPlayer) return;

      const cols = gridData.gridCols || 10;
      const rows = gridData.gridRows || 10;
      const updates = {};
      let found = false;

      // Scan grid for every square owned by this player
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const key = `${r}-${c}`;
          const cell = gridData[key];
          
          if (cell) {
             const cellName = (typeof cell === 'object') ? cell.name : cell;
             if (cellName === selectedPlayer.name) {
                 // Found a square owned by them. Update the note.
                 const currentData = (typeof cell === 'object') ? cell : { name: cell, email: "" };
                 updates[key] = { ...currentData, note: editNote };
                 found = true;
             }
          }
        }
      }

      if (found) {
          try {
              await updateDoc(doc(db, "squares_pool", gameId), updates);
              setShowEditModal(false);
          } catch (e) {
              Alert.alert("Error", "Update failed: " + e.message);
          }
      } else {
          setShowEditModal(false);
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backBtn}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
                {gridData.assignmentMode === 'auto' ? 'Auto Manager' : 'Player Stats'}
            </Text>
            <View style={{width: 50}} /> 
          </View>

          {/* STATS DASHBOARD */}
          <View style={styles.statsContainer}>
             <View style={styles.statsRow}>
                 <Text style={styles.statsLabel}>TOTAL TAKEN</Text>
                 <Text style={[styles.statsValue, stats.isFull && {color: THEME.accent}]}>
                    {stats.taken} <Text style={{fontSize: 14, color: '#666'}}>/ {stats.total}</Text>
                 </Text>
             </View>
             <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(stats.taken / stats.total) * 100}%` }]} />
             </View>
             <Text style={styles.statsSubtext}>
                {stats.isFull ? "BOARD IS FULL" : `${stats.remaining} squares remaining`}
             </Text>
          </View>

          {/* AUTO ASSIGN FORM */}
          {gridData.assignmentMode === 'auto' && (
              <View style={[styles.formCard, stats.isFull && {opacity: 0.5}]}>
                <Text style={styles.sectionTitle}>🎲 Add Player</Text>
                <View style={styles.row}>
                    {/* Name Input */}
                    <TextInput 
                        style={[styles.input, {flex: 2}]} 
                        placeholder="Name" 
                        placeholderTextColor="#666"
                        value={name} onChangeText={setName}
                        editable={!stats.isFull}
                    />
                    {/* Count Input */}
                    <TextInput 
                        style={[styles.input, {flex: 1, marginLeft: 10}]} 
                        placeholder="#" 
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        value={count} onChangeText={setCount}
                        editable={!stats.isFull}
                    />
                </View>
                {/* Note Input (NEW) */}
                <TextInput 
                    style={[styles.input, {marginBottom: 10}]} 
                    placeholder="Note (e.g. Paid via Venmo)" 
                    placeholderTextColor="#666"
                    value={note} onChangeText={setNote}
                    editable={!stats.isFull}
                />
                
                <TouchableOpacity 
                    style={[styles.addBtn, stats.isFull && styles.disabledBtn]} 
                    onPress={handleAutoAssign}
                    disabled={stats.isFull}
                >
                    <Text style={styles.addBtnText}>
                        {stats.isFull ? "BOARD FULL" : "Assign Squares"}
                    </Text>
                </TouchableOpacity>
              </View>
          )}

          {/* ROSTER LIST */}
          <View style={styles.listContainer}>
             <Text style={styles.sectionTitle}>
                Player Roster ({getPlayerStats().length})
             </Text>
             
             <FlatList 
                data={getPlayerStats()}
                keyExtractor={item => item.name}
                contentContainerStyle={{paddingBottom: 20}}
                renderItem={({item}) => (
                    <TouchableOpacity 
                        style={styles.playerRow}
                        onPress={() => openEditModal(item)}
                    >
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{item.name.substring(0,2).toUpperCase()}</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.playerName}>{item.name}</Text>
                            {item.note ? <Text style={styles.playerNote}>{item.note}</Text> : null}
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.count}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={{color: '#666', textAlign: 'center', marginTop: 20}}>
                        No players have bought squares yet.
                    </Text>
                }
             />
          </View>

          {/* BULK EDIT MODAL */}
          <Modal visible={showEditModal} transparent={true} animationType="slide">
             <View style={styles.modalOverlay}>
                 <View style={styles.modalCard}>
                     <Text style={styles.modalTitle}>Edit {selectedPlayer?.name}</Text>
                     <Text style={{color: '#888', marginBottom: 15}}>
                         Update the note for all {selectedPlayer?.count} squares.
                     </Text>
                     
                     <TextInput 
                        style={styles.modalInput}
                        placeholder="Note (e.g. Paid)"
                        placeholderTextColor="#666"
                        value={editNote}
                        onChangeText={setEditNote}
                     />
                     
                     <Button title="Save Update" color={THEME.primary} onPress={saveBulkNote} />
                     <View style={{height: 10}}/>
                     <Button title="Cancel" color="#666" onPress={() => setShowEditModal(false)} />
                 </View>
             </View>
          </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: THEME.border },
  backBtn: { color: THEME.primary, fontSize: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  // STATS STYLES
  statsContainer: { padding: 20, borderBottomWidth: 1, borderColor: '#333' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  statsLabel: { color: '#888', fontWeight: 'bold', fontSize: 12 },
  statsValue: { color: '#fff', fontWeight: 'bold', fontSize: 24 },
  statsSubtext: { color: '#666', fontSize: 12, marginTop: 8, textAlign: 'right' },
  progressBarBg: { height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: THEME.accent },

  // FORM STYLES
  formCard: { margin: 15, padding: 15, backgroundColor: THEME.card, borderRadius: 12, borderWidth: 1, borderColor: THEME.border },
  sectionTitle: { color: '#888', textTransform: 'uppercase', fontSize: 12, marginBottom: 10, fontWeight: 'bold' },
  row: { flexDirection: 'row', marginBottom: 10 },
  input: { backgroundColor: '#222', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#444' },
  addBtn: { backgroundColor: THEME.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  disabledBtn: { backgroundColor: '#444' },

  // LIST STYLES
  listContainer: { flex: 1, padding: 15 },
  playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.card, padding: 12, marginBottom: 8, borderRadius: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: THEME.gold, fontWeight: 'bold' },
  playerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  playerNote: { color: '#888', fontSize: 12, marginTop: 2 },
  badge: { backgroundColor: THEME.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', backgroundColor: '#1E1E1E', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: THEME.primary },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  modalInput: { backgroundColor: '#333', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#555' }
});