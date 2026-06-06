import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, TextInput, Alert, Button, KeyboardAvoidingView, Platform, Modal, Switch } from 'react-native';
import { doc, onSnapshot, updateDoc, deleteField } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import { db } from '../../firebaseConfig'; 
import { THEME } from '../theme';
import BrandHeader from '../components/BrandHeader';
import { styles } from '../styles/PlayerManager.styles';
import { deletePlayerFromGrid, updatePlayerAllocation } from '../utils/gameFunctions';
import { shuffle } from '../utils/shuffle';

// --- AI IMPORTS ---
import { pickAndProcessImage } from '../services/ImageImportService';
import ImportReviewModal from '../components/ImportReviewModal';
import { Ionicons } from '@expo/vector-icons'; 

export default function PlayerManager({ route, navigation }) {
  const { gameId } = route.params;
  const [gridData, setGridData] = useState({});
  const [loading, setLoading] = useState(true);
  
  // USER STATE (For Admin Check)
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [count, setCount] = useState("");
  const [note, setNote] = useState("");

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [editNote, setEditNote] = useState("");
  
  // Edit Count State
  const [editCount, setEditCount] = useState(""); 
  const [isReshuffle, setIsReshuffle] = useState(false); 
  
  const [showEditModal, setShowEditModal] = useState(false);

  // --- AI STATE ---
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [scannedPlayers, setScannedPlayers] = useState([]);

  useEffect(() => {
    // 1. Listen for Game Data
    const unsubDocs = onSnapshot(doc(db, "squares_pool", gameId), (docSnap) => {
      if (docSnap.exists()) {
        setGridData(docSnap.data());
      }
      setLoading(false);
    });

    // 2. Listen for Auth State
    const auth = getAuth();
    const unsubAuth = onAuthStateChanged(auth, (u) => {
        setUser(u);
    });

    return () => { unsubDocs(); unsubAuth(); };
  }, [gameId]);

  // --- ADMIN PERMISSION CHECK ---
  // Must have a user, a grid with an adminId, and they must match.
  const isAdmin = user && gridData.adminId && user.uid === gridData.adminId;

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
    // Security Gate
    if (!isAdmin) return;

    if (stats.isFull) return; 
    if (!name.trim()) { Alert.alert("Error", "Name required"); return; }
    const numSquares = parseInt(count);
    if (isNaN(numSquares) || numSquares < 1) { Alert.alert("Error", "Invalid number"); return; }
    if (numSquares > stats.remaining) { Alert.alert("No Room", `Only ${stats.remaining} squares available.`); return; }

    // Manual Inline Logic to match your version
    const emptyKeys = [];
    const cols = gridData.gridCols || 10;
    const rows = gridData.gridRows || 10;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${r}-${c}`;
        if (!gridData[key]) emptyKeys.push(key);
      }
    }

    const shuffled = shuffle(emptyKeys);
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

  // --- AI HANDLERS ---
  const startImport = async () => {
    // Security Gate
    if (!isAdmin) return;

    setImportModalVisible(true);
    setIsImporting(true);
    setScannedPlayers([]);

    try {
      const data = await pickAndProcessImage();
      if (data) {
        setScannedPlayers(data);
      } else {
        setImportModalVisible(false);
      }
    } catch (error) {
      Alert.alert("Import Failed", "We couldn't read that image. Please try again.");
      setImportModalVisible(false);
    } finally {
      setIsImporting(false);
    }
  };

  const confirmImport = async () => {
    const cols = gridData.gridCols || 10;
    const rows = gridData.gridRows || 10;
    const emptyKeys = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${r}-${c}`;
        if (!gridData[key]) emptyKeys.push(key);
      }
    }

    const shuffledAvailable = shuffle(emptyKeys);
    
    let currentIndex = 0;
    const updateObj = {};
    let partialImport = false;

    for (const player of scannedPlayers) {
      const needed = parseInt(player.count) || 1;
      if (currentIndex + needed > shuffledAvailable.length) {
        partialImport = true;
        const remaining = shuffledAvailable.length - currentIndex;
        if (remaining <= 0) break; 
      }

      const keysToAssign = shuffledAvailable.slice(currentIndex, currentIndex + needed);
      const playerData = { name: player.name, email: "", note: "Imported via AI" };
      keysToAssign.forEach(key => {
        updateObj[key] = playerData;
      });

      currentIndex += needed;
    }

    if (Object.keys(updateObj).length === 0 && scannedPlayers.length > 0) {
      Alert.alert("Board Full", "No empty squares to assign players to.");
      setImportModalVisible(false);
      return;
    }

    try {
      await updateDoc(doc(db, "squares_pool", gameId), updateObj);
      setImportModalVisible(false);
      if (partialImport) {
        Alert.alert("Partial Import", "Ran out of squares! Some players were not fully assigned.");
      } else {
        Alert.alert("Success", `Imported ${scannedPlayers.length} players!`);
      }
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };
  // -------------------

  const openEditModal = (player) => {
      // Security Gate: Only allow if Admin
      if (!isAdmin) return;

      setSelectedPlayer(player);
      setEditNote(player.note || "");
      setEditCount(player.count.toString()); 
      setIsReshuffle(false); 
      setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
      if (!selectedPlayer) return;

      try {
          const playerObj = { 
              name: selectedPlayer.name, 
              count: selectedPlayer.count, 
              note: editNote, 
              email: "" 
          };

          await updatePlayerAllocation(db, gameId, gridData, playerObj, editCount, isReshuffle);
          
          if (!isReshuffle) {
             const cols = gridData.gridCols || 10;
             const rows = gridData.gridRows || 10;
             const updates = {};
             for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                  const key = `${r}-${c}`;
                  const cell = gridData[key];
                  if (cell) {
                     const cellName = (typeof cell === 'object') ? cell.name : cell;
                     if (cellName === selectedPlayer.name) {
                         const currentData = (typeof cell === 'object') ? cell : { name: cell, email: "" };
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
                {/* Dynamic Title based on Role */}
                {isAdmin ? 'Auto Manager' : 'Player Roster'}
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

          {/* AUTO ASSIGN FORM - ONLY SHOW IF ADMIN */}
          {gridData.assignmentMode === 'auto' && isAdmin && (
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

                {/* --- AI BUTTON --- */}
                {!stats.isFull && (
                  <TouchableOpacity 
                    style={[styles.addBtn, { backgroundColor: THEME.secondary, marginTop: 12, flexDirection: 'row', justifyContent: 'center' }]} 
                    onPress={startImport}
                  >
                    <Ionicons name="camera" size={20} color="white" style={{marginRight: 8}} />
                    <Text style={styles.addBtnText}>Import via Photo</Text>
                  </TouchableOpacity>
                )}
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
                showsVerticalScrollIndicator={false}
                renderItem={({item}) => (
                    <TouchableOpacity 
                        style={styles.playerRow}
                        onPress={() => openEditModal(item)}
                        // DISABLE CLICK IF NOT ADMIN
                        disabled={!isAdmin} 
                        activeOpacity={isAdmin ? 0.7 : 1}
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

          {/* --- AI REVIEW MODAL --- */}
          <ImportReviewModal 
            visible={importModalVisible}
            isLoading={isImporting}
            importedPlayers={scannedPlayers}
            onClose={() => setImportModalVisible(false)}
            onConfirm={confirmImport}
          />

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}