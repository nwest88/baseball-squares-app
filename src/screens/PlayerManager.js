import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, TextInput, Alert, Button, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; 
import { THEME } from '../theme';
import BrandHeader from '../components/BrandHeader';
import { styles } from '../styles/PlayerManager.styles';
import { deletePlayerFromGrid } from '../utils/gameFunctions';

export default function PlayerManager({ route, navigation }) {
  const { gameId } = route.params;
  const [gridData, setGridData] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState("");
  const [count, setCount] = useState("");
  const [note, setNote] = useState("");

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [editNote, setEditNote] = useState("");
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
      setShowEditModal(true);
  };

  const saveBulkNote = async () => {
      if (!selectedPlayer) return;
      const cols = gridData.gridCols || 10;
      const rows = gridData.gridRows || 10;
      const updates = {};
      let found = false;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const key = `${r}-${c}`;
          const cell = gridData[key];
          if (cell) {
             const cellName = (typeof cell === 'object') ? cell.name : cell;
             if (cellName === selectedPlayer.name) {
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
          } catch (e) { Alert.alert("Error", "Update failed: " + e.message); }
      } else { setShowEditModal(false); }
  };

  const handleDeletePlayer = async () => {
      if (!selectedPlayer) return;

      Alert.alert(
          "Delete Player?", 
          `This will remove ${selectedPlayer.name} and clear all ${selectedPlayer.count} of their squares.`,
          [
              { text: "Cancel", style: "cancel" },
              { 
                  text: "Delete", 
                  style: "destructive", 
                  onPress: async () => {
                      try {
                          // CLEAN: Just call the function!
                          await deletePlayerFromGrid(db, gameId, gridData, selectedPlayer.name);
                          setShowEditModal(false);
                      } catch (e) {
                          Alert.alert("Error", e.message);
                      }
                  }
              }
          ]
      );
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

          <Modal visible={showEditModal} transparent={true} animationType="slide">
             <View style={styles.modalOverlay}>
                 <View style={styles.modalCard}>
                     <Text style={styles.modalTitle}>Edit {selectedPlayer?.name}</Text>
                     
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