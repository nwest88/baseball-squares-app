import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, TextInput, Alert, Button, KeyboardAvoidingView, Platform, Modal, Switch } from 'react-native';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; 
import { THEME } from '../theme';
import BrandHeader from '../components/BrandHeader';
import { styles } from '../styles/PlayerManager.styles';
// 1. IMPORT THE NEW FUNCTION
import { deletePlayerFromGrid, updatePlayerAllocation } from '../utils/gameFunctions';

export default function PlayerManager({ route, navigation }) {
  const { gameId } = route.params;
  const [gridData, setGridData] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState("");
  const [count, setCount] = useState("");
  const [note, setNote] = useState("");

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [editNote, setEditNote] = useState("");
  
  // NEW: Edit Count State
  const [editCount, setEditCount] = useState(""); 
  const [isReshuffle, setIsReshuffle] = useState(false); 
  
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "squares_pool", gameId), (docSnap) => {
      if (docSnap.exists()) {
        setGridData(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, [gameId]);

  const handleBack = () => {
      if (navigation.canGoBack()) {
          navigation.goBack();
      } else {
          navigation.replace('Game', { gameId: gameId });
      }
  };

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
                 playerMap[playerName] = { count: 0, note: playerNote };
             }
             playerMap[playerName].count++;
          }
        }
      }
    }
    return Object.keys(playerMap)
        .map(name => ({ name, count: playerMap[name].count, note: playerMap[name].note }))
        .sort((a, b) => b.count - a.count);
  };

  const handleAutoAssign = async () => {
    if (stats.isFull) return; 
    if (!name.trim()) { Alert.alert("Error", "Name required"); return; }
    const numSquares = parseInt(count);
    if (isNaN(numSquares) || numSquares < 1) { Alert.alert("Error", "Invalid number"); return; }
    if (numSquares > stats.remaining) { Alert.alert("No Room", `Only ${stats.remaining} squares available.`); return; }

    const emptyKeys = [];
    const cols = gridData.gridCols || 10;
    const rows = gridData.gridRows || 10;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${r}-${c}`;
        if (!gridData[key]) emptyKeys.push(key);
      }
    }

    const shuffled = emptyKeys.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numSquares);
    const updateObj = {};
    const playerData = { name, email: "", note: note }; 
    selected.forEach(key => updateObj[key] = playerData);

    try {
        await updateDoc(doc(db, "squares_pool", gameId), updateObj);
        setName(""); setCount(""); setNote(""); 
    } catch (e) {
        Alert.alert("Error", e.message);
    }
  };

  const openEditModal = (player) => {
      setSelectedPlayer(player);
      setEditNote(player.note || "");
      setEditCount(player.count.toString()); // Pre-fill Count
      setIsReshuffle(false); // Reset toggle
      setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
      if (!selectedPlayer) return;

      try {
          // 1. Update Notes (Bulk) - We still do this to ensure notes sync
          const cols = gridData.gridCols || 10;
          const rows = gridData.gridRows || 10;
          const updates = {};
          
          // 2. Call the Allocator to handle Count/Reshuffle
          // We pass 'selectedPlayer' object which has the *original* count, 
          // and 'editCount' which is the *new* count.
          // Note: We need to pass the full player object with email/note for the allocator to re-create squares
          const playerObj = { 
              name: selectedPlayer.name, 
              count: selectedPlayer.count, 
              note: editNote, // Use NEW note
              email: "" // We don't have email in the list view yet, can add later
          };

          await updatePlayerAllocation(db, gameId, gridData, playerObj, editCount, isReshuffle);
          
          // If Reshuffle was off, but note changed, we need to ensure notes updated on existing squares
          // The updatePlayerAllocation handles new/reshuffled ones, but static ones might need note updates.
          // For simplicity in MVP: We loop and update notes separately if not reshuffling.
          if (!isReshuffle) {
             for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                  const key = `${r}-${c}`;
                  const cell = gridData[key];
                  if (cell) {
                     const cellName = (typeof cell === 'object') ? cell.name : cell;
                     if (cellName === selectedPlayer.name) {
                         const currentData = (typeof cell === 'object') ? cell : { name: cell, email: "" };
                         // Only update if note changed
                         if (currentData.note !== editNote) {
                             updates[key] = { ...currentData, note: editNote };
                         }
                     }
                  }
                }
             }
             if (Object.keys(updates).length > 0) {
                 await updateDoc(doc(db, "squares_pool", gameId), updates);
             }
          }

          setShowEditModal(false);
      } catch (e) {
          Alert.alert("Update Failed", e.message);
      }
  };

  const handleDeletePlayer = async () => {
      if (!selectedPlayer) return;

      if (Platform.OS === 'web') {
          const confirmed = window.confirm(`Delete ${selectedPlayer.name} and clear all ${selectedPlayer.count} squares?`);
          if (confirmed) performDelete();
      } else {
          Alert.alert(
              "Delete Player?", 
              `This will remove ${selectedPlayer.name} and clear all ${selectedPlayer.count} of their squares.`,
              [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: performDelete }
              ]
          );
      }
  };

  const performDelete = async () => {
      try {
          await deletePlayerFromGrid(db, gameId, gridData, selectedPlayer.name);
          setShowEditModal(false);
      } catch (e) {
          Alert.alert("Error", e.message);
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BrandHeader />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack}>
                <Text style={styles.backBtn}>‹ Back to Game</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
                {gridData.assignmentMode === 'auto' ? 'Auto Manager' : 'Player Stats'}
            </Text>
            <View style={{width: 50}} /> 
          </View>

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
                    <TextInput 
                        style={[styles.input, {flex: 2}]} 
                        placeholder="Name" 
                        placeholderTextColor="#666"
                        value={name} onChangeText={setName}
                        editable={!stats.isFull}
                    />
                    <TextInput 
                        style={[styles.input, {flex: 1, marginLeft: 10}]} 
                        placeholder="#" 
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        value={count} onChangeText={setCount}
                        editable={!stats.isFull}
                    />
                </View>
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

          {/* EDIT MODAL */}
          <Modal visible={showEditModal} transparent={true} animationType="slide">
             <View style={styles.modalOverlay}>
                 <View style={styles.modalCard}>
                     <Text style={styles.modalTitle}>Edit {selectedPlayer?.name}</Text>
                     
                     <Text style={{color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 5}}>SQUARE COUNT</Text>
                     <TextInput 
                        style={styles.modalInput}
                        placeholder="#"
                        placeholderTextColor="#666"
                        value={editCount}
                        onChangeText={setEditCount}
                        keyboardType="numeric"
                     />

                     <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between'}}>
                        <View style={{flex: 1}}>
                            <Text style={{color: '#fff', fontWeight: 'bold'}}>Re-roll Squares?</Text>
                            <Text style={{color: '#666', fontSize: 10}}>Clears current spots and picks random new ones.</Text>
                        </View>
                        <Switch 
                            value={isReshuffle}
                            onValueChange={setIsReshuffle}
                            trackColor={{ false: "#333", true: THEME.primary }}
                        />
                     </View>

                     <Text style={{color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 5}}>NOTE / STATUS</Text>
                     <TextInput 
                        style={styles.modalInput}
                        placeholder="Note (e.g. Paid)"
                        placeholderTextColor="#666"
                        value={editNote}
                        onChangeText={setEditNote}
                     />
                     
                     <Button title="Save Changes" color={THEME.primary} onPress={handleSaveChanges} />
                     <View style={{height: 10}}/>
                     <Button title="Cancel" color="#666" onPress={() => setShowEditModal(false)} />
                     
                     <View style={{marginTop: 20, borderTopWidth: 1, borderColor: '#333', paddingTop: 10}}>
                        <Button title="Delete Player" color={THEME.error} onPress={handleDeletePlayer} />
                     </View>

                 </View>
             </View>
          </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}