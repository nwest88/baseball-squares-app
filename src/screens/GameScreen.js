import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Modal, TextInput, Button, Alert, ScrollView, ActivityIndicator, Share, Platform, useWindowDimensions, FlatList, Switch, KeyboardAvoidingView, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';
import { doc, onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

import { Ionicons } from '@expo/vector-icons'; 
import { db, auth } from '../../firebaseConfig'; 
import GridBoard from '../components/GridBoard'; 
import GamePoolCard from '../components/GamePoolCard';
// BrandHeader removed
import ImportReviewModal from '../components/ImportReviewModal';

// Styles & Theme
import { styles } from '../styles/GameScreen.styles'; 
import { styles as playerStyles } from '../styles/PlayerManager.styles'; 
import { THEME } from '../theme';

// Utils
import { toggleFollowGame, isGameFollowed } from '../utils/storage';
import { deletePlayerFromGrid, updatePlayerAllocation } from '../utils/gameFunctions';
import { pickAndProcessImage } from '../services/ImageImportService';

const DEFAULT_SCORES = {
  q1: { top: '', left: '' },
  q2: { top: '', left: '' },
  q3: { top: '', left: '' },
  final: { top: '', left: '' },
};

export default function GameScreen({ route, navigation }) {
  const { gameId } = route.params;
  const { width } = useWindowDimensions(); 
  const isWide = width > 768; 
  
  // --- CORE STATE ---
  const [gridData, setGridData] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(""); 
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false); 

  // --- TAB STATE ---
  const [activeTab, setActiveTab] = useState('squares'); 
  const [activeQuarter, setActiveQuarter] = useState('q1'); 

  // --- HIGHLIGHT STATE (Array) ---
  const [highlightedPlayers, setHighlightedPlayers] = useState([]);

  // --- SCORES STATE ---
  const [scores, setScores] = useState(DEFAULT_SCORES);

  // --- MODAL STATES ---
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // --- SQUARE EDITING STATE ---
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [editingSquare, setEditingSquare] = useState(null); 
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNote, setEditNote] = useState("");

  // --- ADMIN SETTINGS STATE ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [settingsName, setSettingsName] = useState("");
  const [settingsHost, setSettingsHost] = useState(""); 
  const [settingsTop, setSettingsTop] = useState("");
  const [settingsLeft, setSettingsLeft] = useState("");
  const [settingsPrice, setSettingsPrice] = useState(""); 
  const [settingsCut, setSettingsCut] = useState("");     
  const [settingsPublic, setSettingsPublic] = useState(true);
  
  // --- PLAYER MANAGER STATE ---
  const [pmName, setPmName] = useState("");
  const [pmCount, setPmCount] = useState("");
  const [pmNote, setPmNote] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null); 
  const [showPlayerEditModal, setShowPlayerEditModal] = useState(false);
  const [playerEditNote, setPlayerEditNote] = useState("");
  const [playerEditCount, setPlayerEditCount] = useState(""); 
  const [isReshuffle, setIsReshuffle] = useState(false); 
  
  // --- AI IMPORT STATE ---
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [scannedPlayers, setScannedPlayers] = useState([]);


  // ===============================================================
  // 1. INITIALIZATION & DATA FETCHING
  // ===============================================================
  useEffect(() => {
    const checkFollow = async () => {
        const following = await isGameFollowed(gameId);
        setIsFollowing(following);
    };
    checkFollow();

    const unsubDocs = onSnapshot(doc(db, "squares_pool", gameId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGridData(data);
        
        if (data.scores) {
            setScores(prev => ({
                q1: { ...DEFAULT_SCORES.q1, ...data.scores.q1 },
                q2: { ...DEFAULT_SCORES.q2, ...data.scores.q2 },
                q3: { ...DEFAULT_SCORES.q3, ...data.scores.q3 },
                final: { ...DEFAULT_SCORES.final, ...data.scores.final },
            }));
        }

        if (!showAdminModal) {
            setSettingsName(data.name || "");
            setSettingsHost(data.hostName || ""); 
            setSettingsTop(data.topTeam || "");
            setSettingsLeft(data.leftTeam || "");
            setSettingsPrice(data.pricePerSquare ? data.pricePerSquare.toString() : ""); 
            setSettingsCut(data.hostCut || ""); 
            setSettingsPublic(data.isPublic !== false); 
        }

        setLoading(false); 
      } else {
        setLoadError(`Game ID '${gameId}' not found.`);
        setLoading(false);
      }
    }, (error) => {
        setLoadError(error.message);
        setLoading(false);
    });

    const unsubAuth = onAuthStateChanged(auth, u => setUser(u));
    return () => { unsubDocs(); unsubAuth(); };
  }, [gameId, showAdminModal]); 

  const isAdmin = user && gridData.adminId && user.uid === gridData.adminId;


  // ===============================================================
  // 2. HELPER FUNCTIONS
  // ===============================================================

  const getTeamColor = (name) => {
    if (!name) return '#555';
    const n = name.toLowerCase();
    if (n.includes('chief') || n.includes('49') || n.includes('bucs')) return THEME.red;
    if (n.includes('eagle') || n.includes('pack') || n.includes('jet')) return THEME.green;
    return '#444';
  };

  const getWinningCoords = (quarterKey) => {
    if (!gridData.topAxis || !gridData.leftAxis) return null;
    const currentScores = scores[quarterKey];
    if (!currentScores || (currentScores.top === '' && currentScores.left === '')) return null;
    
    const tVal = currentScores.top === '' ? '0' : currentScores.top;
    const lVal = currentScores.left === '' ? '0' : currentScores.left;
    const tDigit = parseInt(tVal.toString().slice(-1));
    const lDigit = parseInt(lVal.toString().slice(-1));
    
    if (isNaN(tDigit) || isNaN(lDigit)) return null;
    const colIndex = gridData.topAxis.indexOf(tDigit);
    const rowIndex = gridData.leftAxis.indexOf(lDigit);
    return (colIndex === -1 || rowIndex === -1) ? null : { row: rowIndex, col: colIndex };
  };

  const winningLoc = getWinningCoords(activeQuarter); 

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
             if (!playerMap[playerName]) playerMap[playerName] = { count: 0, note: playerNote };
             playerMap[playerName].count++;
          }
        }
      }
    }
    return Object.keys(playerMap)
        .map(name => ({ name, count: playerMap[name].count, note: playerMap[name].note }))
        .sort((a, b) => b.count - a.count);
  };


  // ===============================================================
  // 3. ACTION HANDLERS
  // ===============================================================

  const togglePlayerHighlight = (playerName) => {
    setHighlightedPlayers(prev => {
        if (prev.includes(playerName)) {
            return prev.filter(p => p !== playerName);
        } else {
            return [...prev, playerName];
        }
    });
  };


  const handleToggleFollow = async () => {
      const newState = await toggleFollowGame(gameId);
      setIsFollowing(newState);
      if (newState) Alert.alert("Followed!", "Saved to dashboard.");
      else Alert.alert("Unfollowed", "Removed from dashboard.");
  };

  const handleShare = async () => {
    const url = `https://baseball-squares-mvp.web.app/game/${gameId}`;
    try { await Share.share({ message: `Join my Squares Pool!\nGame ID: ${gameId}\n\nPlay here: ${url}`, url, title: 'Squares Pool Invite' }); } catch (error) {}
  };

  const handleSquarePress = (data) => {
    if (data.owner) {
        const topNum = gridData.topAxis ? gridData.topAxis[data.col] : '?';
        const leftNum = gridData.leftAxis ? gridData.leftAxis[data.row] : '?';
        const ownerName = (typeof data.owner === 'object') ? data.owner.name : data.owner;
        const ownerNote = (typeof data.owner === 'object') ? data.owner.note : "";
        const ownerEmail = (typeof data.owner === 'object') ? data.owner.email : "";

        setSelectedDetails({
            name: ownerName, note: ownerNote, email: ownerEmail,
            topNum: topNum, leftNum: leftNum,
            row: data.row, col: data.col
        });
        setShowDetailsModal(true);
        return;
    }
    if (!isAdmin && !isFollowing) {
        Alert.alert("👀 Watcher Mode", "Please 'Follow' (⭐) to pick squares.");
        return;
    }
    const mode = gridData.assignmentMode || 'manual'; 
    if (mode === 'manual') openEditModal(data.row, data.col);
    else Alert.alert("Auto Mode", "Use the 'Players' tab to assign squares.");
  };

  const handleAutoAssign = async () => {
    const stats = getBoardStats();
    if (!isAdmin || stats.isFull) return;
    if (!pmName.trim()) { Alert.alert("Error", "Name required"); return; }
    const numSquares = parseInt(pmCount);
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
    const playerData = { name: pmName, email: "", note: pmNote }; 
    selected.forEach(key => updateObj[key] = playerData);
    try { await updateDoc(doc(db, "squares_pool", gameId), updateObj); setPmName(""); setPmCount(""); setPmNote(""); } catch (e) { Alert.alert("Error", e.message); }
  };

  const openPlayerEditModal = (player) => {
      if (!isAdmin) return;
      setSelectedPlayer(player);
      setPlayerEditNote(player.note || "");
      setPlayerEditCount(player.count.toString()); 
      setIsReshuffle(false); 
      setShowPlayerEditModal(true);
  };

  const handleSavePlayerChanges = async () => {
    if (!selectedPlayer) return;
    try {
        const playerObj = { name: selectedPlayer.name, count: selectedPlayer.count, note: playerEditNote, email: "" };
        await updatePlayerAllocation(db, gameId, gridData, playerObj, playerEditCount, isReshuffle);
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
                       if (currentData.note !== playerEditNote) updates[key] = { ...currentData, note: playerEditNote };
                   }
                }
              }
           }
           if (Object.keys(updates).length > 0) await updateDoc(doc(db, "squares_pool", gameId), updates);
        }
        setShowPlayerEditModal(false);
    } catch (e) { Alert.alert("Update Failed", e.message); }
  };

  const handleDeletePlayer = async () => {
      try {
          await deletePlayerFromGrid(db, gameId, gridData, selectedPlayer.name);
          setShowPlayerEditModal(false);
      } catch (e) { Alert.alert("Error", e.message); }
  };

  const startImport = async () => {
    if (!isAdmin) return;
    setImportModalVisible(true);
    setIsImporting(true);
    setScannedPlayers([]);
    try {
      const data = await pickAndProcessImage();
      if (data) setScannedPlayers(data); else setImportModalVisible(false);
    } catch (error) { Alert.alert("Import Failed", "Try again."); setImportModalVisible(false); } finally { setIsImporting(false); }
  };

  const confirmImport = async () => {
      const cols = gridData.gridCols || 10;
      const rows = gridData.gridRows || 10;
      const emptyKeys = [];
      for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { if (!gridData[`${r}-${c}`]) emptyKeys.push(`${r}-${c}`); } }
      const shuffledAvailable = emptyKeys.sort(() => 0.5 - Math.random());
      let currentIndex = 0;
      const updateObj = {};
      for (const player of scannedPlayers) {
        const needed = parseInt(player.count) || 1;
        if (currentIndex + needed > shuffledAvailable.length) break;
        const keysToAssign = shuffledAvailable.slice(currentIndex, currentIndex + needed);
        keysToAssign.forEach(key => updateObj[key] = { name: player.name, email: "", note: "Imported via AI" });
        currentIndex += needed;
      }
      if (Object.keys(updateObj).length > 0) await updateDoc(doc(db, "squares_pool", gameId), updateObj);
      setImportModalVisible(false);
  };


  // --- GENERIC SETTINGS HANDLERS ---
  const handleLogin = async () => { 
      // 1. Validation check
      if (!email.trim() || !password.trim()) {
          const msg = "Please enter both email and password.";
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert("Validation Error", msg);
          return;
      }

      setIsLoggingIn(true);
      try { 
          await signInWithEmailAndPassword(auth, email, password); 
          setEmail(""); 
          setPassword(""); 
      } catch (e) { 
          console.error("Login failed", e); 
          let friendlyMsg = e.message;
          if (e.code === 'auth/invalid-email') friendlyMsg = "Invalid email address format.";
          if (e.code === 'auth/user-not-found') friendlyMsg = "No user found with this email.";
          if (e.code === 'auth/wrong-password') friendlyMsg = "Incorrect password.";
          if (e.code === 'auth/invalid-credential') friendlyMsg = "Invalid credentials.";

          if (Platform.OS === 'web') {
              window.alert("Login Error: " + friendlyMsg);
          } else {
              Alert.alert("Error", friendlyMsg); 
          }
      } finally {
          setIsLoggingIn(false);
      }
  };
  
  const handleUpdateSettings = async () => { try { await updateDoc(doc(db, "squares_pool", gameId), { name: settingsName, hostName: settingsHost, topTeam: settingsTop, leftTeam: settingsLeft, pricePerSquare: Number(settingsPrice) || 0, hostCut: settingsCut, isPublic: settingsPublic }); Alert.alert("Success", "Settings updated!"); } catch (e) { Alert.alert("Error", e.message); } };
  const handleSaveScores = async () => { try { await setDoc(doc(db, "squares_pool", gameId), { scores: scores }, { merge: true }); Alert.alert("Success", "Scores Updated"); } catch (e) { Alert.alert("Save Failed", e.message); } };
  const updateScoreInput = (q, team, val) => { setScores(prev => ({ ...prev, [q]: { ...(prev[q] || {}), [team]: val } })); };
  
  const handleClearNumbers = async () => {
      const doClear = async () => {
          try { 
              await updateDoc(doc(db, "squares_pool", gameId), { topAxis: Array(10).fill("?"), leftAxis: Array(10).fill("?") }); 
              if (Platform.OS === 'web') window.alert("Success: Numbers Cleared!");
              else Alert.alert("Success", "Numbers Cleared!"); 
          } catch (e) { 
              if (Platform.OS === 'web') window.alert("Error: " + e.message);
              else Alert.alert("Error", e.message); 
          }
      };

      if (Platform.OS === 'web') {
          if (window.confirm("Clear Axis Numbers?\n\nThis will reset all row and column headers to '?'")) doClear();
      } else {
          Alert.alert("Clear Axis Numbers?", "This will reset all row and column headers to '?'", [{ text: "Cancel", style: "cancel" }, { text: "Clear", style: "destructive", onPress: doClear }]);
      }
  };
  
  const handleRandomizeNumbers = async () => { 
      const doRandomize = async () => {
          const gen = (s) => Array.from({length:s},(_,i)=>i).sort(()=>Math.random()-0.5); 
          try { 
              await updateDoc(doc(db, "squares_pool", gameId), { topAxis: gen(10), leftAxis: gen(10) }); 
              if (Platform.OS === 'web') window.alert("Success: Numbers Randomized!");
              else Alert.alert("Success", "Numbers Randomized!"); 
          } catch (e) { 
              if (Platform.OS === 'web') window.alert("Error: " + e.message);
              else Alert.alert("Error", e.message); 
          } 
      };

      if (Platform.OS === 'web') {
          if (window.confirm("Randomize Axis Numbers?\n\nAre you sure?")) doRandomize();
      } else {
          Alert.alert("Randomize Axis Numbers?", "Are you sure?", [{ text: "Cancel", style: "cancel" }, { text: "Randomize", style: "destructive", onPress: doRandomize }]);
      }
  };
  
  const openEditModal = (row, col, existingData = null) => {
    setEditingSquare({ row, col });
    if (existingData) { setEditName(existingData.name || ""); setEditEmail(existingData.email || ""); setEditNote(existingData.note || ""); } 
    else { setEditName(""); setEditEmail(""); setEditNote(""); }
    setShowDetailsModal(false); setShowEditModal(true);     
  };
  const saveSquareInfo = async () => {
    if (!editingSquare) return;
    const key = `${editingSquare.row}-${editingSquare.col}`;
    const valueToSave = editName.trim() === "" ? null : { name: editName, email: editEmail, note: editNote };
    try { await setDoc(doc(db, "squares_pool", gameId), { [key]: valueToSave }, { merge: true }); setShowEditModal(false); } catch (e) { Alert.alert("Error", "Could not save."); }
  };


  // ===============================================================
  // 4. RENDERS
  // ===============================================================

  if (loading || (!gridData.id && !loadError)) return <SafeAreaView style={[styles.container, {justifyContent:'center',alignItems:'center'}]}><ActivityIndicator size="large" color={THEME.primary} /></SafeAreaView>;
  if (loadError) return <SafeAreaView style={styles.container}><Text style={{color:'red'}}>{loadError}</Text><Button title="Home" onPress={() => navigation.navigate('Home')} /></SafeAreaView>;

  const stats = getBoardStats();
  const playerStats = getPlayerStats();
  
  const price = gridData.pricePerSquare || 0;
  const pot = stats.taken * price;
  const payouts = { q1: pot * 0.125, q2: pot * 0.25, q3: pot * 0.125, final: pot * 0.5 }; 

  const renderInfoTab = () => {
    if (isAdmin) {
        return (
            <ScrollView style={{flex: 1, padding: 15}}>
                 <Text style={styles.sectionHeader}>📋 Game Details (Admin)</Text>
                 <View style={{marginBottom: 10}}><Text style={styles.inputLabel}>Pool Name</Text><TextInput style={styles.modalInput} value={settingsName} onChangeText={setSettingsName} placeholder="Name" placeholderTextColor="#666"/></View>
                 <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 10}}>
                     <View style={{flex:1, marginRight:5}}><Text style={styles.inputLabel}>Away Team</Text><TextInput style={styles.modalInput} value={settingsTop} onChangeText={setSettingsTop} placeholder="Away" placeholderTextColor="#666"/></View>
                     <View style={{flex:1, marginLeft:5}}><Text style={styles.inputLabel}>Home Team</Text><TextInput style={styles.modalInput} value={settingsLeft} onChangeText={setSettingsLeft} placeholder="Home" placeholderTextColor="#666"/></View>
                 </View>
                 <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 10}}>
                     <View style={{flex:1, marginRight:5}}><Text style={styles.inputLabel}>Price ($)</Text><TextInput style={styles.modalInput} value={settingsPrice} onChangeText={setSettingsPrice} placeholder="0" keyboardType="numeric" placeholderTextColor="#666"/></View>
                     <View style={{flex:1, marginLeft:5}}><Text style={styles.inputLabel}>Host Cut %</Text><TextInput style={styles.modalInput} value={settingsCut} onChangeText={setSettingsCut} placeholder="0" placeholderTextColor="#666"/></View>
                 </View>
                 <Button title="Save Game Details" color={THEME.primary} onPress={handleUpdateSettings} />

                 <View style={{height: 20, borderBottomWidth: 1, borderColor: '#333', marginBottom: 20}}/>
                 
                 <Text style={styles.sectionHeader}>🏈 Game Scores</Text>
                 {['q1','q2','q3','final'].map(q => ( 
                     <View key={q} style={styles.scoreRow}>
                         <Text style={styles.scoreLabel}>{q.toUpperCase()}</Text>
                         <TextInput value={(scores[q]?.top || '').toString()} onChangeText={(v) => updateScoreInput(q, 'top', v)} style={styles.smallScoreInput} keyboardType="numeric" placeholder="Away"/>
                         <Text style={{color: '#666'}}>-</Text>
                         <TextInput value={(scores[q]?.left || '').toString()} onChangeText={(v) => updateScoreInput(q, 'left', v)} style={styles.smallScoreInput} keyboardType="numeric" placeholder="Home"/>
                     </View> 
                 ))}
                 <Button title="Update Scores" color={THEME.accent} onPress={handleSaveScores} />

                 <View style={{height: 20, borderBottomWidth: 1, borderColor: '#333', marginBottom: 20}}/>
                 
                 <Text style={styles.sectionHeader}>⚙️ Grid Management</Text>
                 
                 <TouchableOpacity style={styles.actionBtn} onPress={handleRandomizeNumbers}>
                    <Text style={styles.actionBtnText}>🎲 Randomize Axis Numbers</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.actionBtn, { marginTop: 10, borderColor: THEME.red }]} onPress={handleClearNumbers}>
                    <Text style={[styles.actionBtnText, { color: THEME.red }]}>🚫 Clear Numbers</Text>
                 </TouchableOpacity>
                 
                 <View style={{height: 20}}/>
                 {/* SHARE BUTTON FOR ADMIN */}
                 <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#444', marginTop: 10, flexDirection: 'row', justifyContent: 'center' }]} 
                    onPress={handleShare}
                 >
                    <Ionicons name="share-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Share Game</Text>
                 </TouchableOpacity>

                 <View style={{height: 50}}/>
                 <Button title="Log Out" color="#666" onPress={() => signOut(auth)} />
                 <View style={{height: 50}}/>
            </ScrollView>
        );
    }

    // --- READ ONLY VIEW (For Players) ---
    const quarters = ['q1', 'q2', 'q3', 'final'];
    const winners = quarters.map(q => {
        const loc = getWinningCoords(q);
        if (!loc) return { q, name: 'TBD' };
        const cell = gridData[`${loc.row}-${loc.col}`];
        const name = cell ? (typeof cell === 'object' ? cell.name : cell) : "OPEN";
        return { q, name };
    });

    return (
        <ScrollView style={{flex: 1, padding: 10}}>
             <GamePoolCard data={{
                 title: gridData.name || "Game Pool",
                 host: gridData.hostName || "Host",
                 teamA: gridData.topTeam || "AWAY",
                 teamB: gridData.leftTeam || "HOME",
                 squaresSold: stats.taken,
                 totalSquares: stats.total,
                 costPerSquare: price,
                 totalPot: pot,
                 payouts: payouts
             }}/>
             
             {/* Follow Button Integrated Here */}
             <View style={{ marginTop: 15, alignItems: 'center' }}>
                <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: isFollowing ? THEME.primary : '#333', width: '100%', flexDirection: 'row', justifyContent: 'center' }]} 
                    onPress={handleToggleFollow}
                >
                    <Ionicons name={isFollowing ? "star" : "star-outline"} size={20} color={isFollowing ? "#FFF" : THEME.primary} style={{ marginRight: 8 }} />
                    <Text style={{ color: isFollowing ? '#FFF' : THEME.primary, fontWeight: 'bold' }}>
                        {isFollowing ? "Following Game" : "Follow Game"}
                    </Text>
                </TouchableOpacity>
             </View>

             {/* SHARE BUTTON FOR PLAYERS */}
             <View style={{ marginTop: 10, alignItems: 'center' }}>
                <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#444', width: '100%', flexDirection: 'row', justifyContent: 'center' }]} 
                    onPress={handleShare}
                >
                    <Ionicons name="share-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Share Game</Text>
                </TouchableOpacity>
             </View>

             <View style={[styles.detailCard, {marginTop: 20}]}>
                 <Text style={styles.detailTitle}>🏆 Current Winners</Text>
                 {winners.map(w => (
                     <View key={w.q} style={{flexDirection:'row', justifyContent:'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#333'}}>
                         <Text style={{color: THEME.subtext, fontWeight:'bold'}}>{w.q.toUpperCase()}</Text>
                         <Text style={{color: THEME.gold, fontWeight:'bold', fontSize: 16}}>{w.name}</Text>
                     </View>
                 ))}
             </View>
             
             {/* LOGIN FOR ADMIN */}
             {!user && (
                 <View style={{marginTop: 30, padding: 15, borderTopWidth: 1, borderColor: '#333'}}>
                     <Text style={{color: '#666', marginBottom: 10, textAlign: 'center'}}>Admin Login</Text>
                     <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={[styles.modalInput, {marginBottom: 10}]} placeholderTextColor="#666" autoCapitalize="none"/>
                     <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={[styles.modalInput, {marginBottom: 10}]} secureTextEntry placeholderTextColor="#666"/>
                     <View style={{ marginTop: 10 }}>
                        {isLoggingIn ? (
                            <ActivityIndicator size="small" color={THEME.primary} />
                        ) : (
                            <Button title="Login" color={THEME.accent} onPress={handleLogin} />
                        )}
                     </View>
                 </View>
             )}
             
             <View style={{height: 50}}/>
        </ScrollView>
    );
  };

  const renderSquaresTab = () => (
    <>
      <View style={styles.tabBar}>
        {['q1','q2','q3','final'].map(q => {
          // --- UPDATED LOGIC TO SHOW SCORE IF EXISTS ---
          const scoreData = scores[q];
          const hasScore = scoreData && scoreData.top !== '' && scoreData.left !== '';
          const scoreText = hasScore ? `${scoreData.top} - ${scoreData.left}` : null;
          
          return (
            <TouchableOpacity key={q} style={[styles.qTab, activeQuarter === q && styles.qTabActive]} onPress={() => setActiveQuarter(q)}>
              <Text style={[styles.qTabText, activeQuarter === q && styles.qTabTextActive]}>{q.toUpperCase()}</Text>
              {hasScore && (
                  <Text style={[styles.qTabScoreText, activeQuarter === q && styles.qTabScoreTextActive]}>
                      {scoreText}
                  </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.centeredView}>
        <View style={[styles.boardConstrainer, isWide && { maxWidth: '100%', paddingHorizontal: 20 }]}>
          <View style={{alignItems: 'center', paddingVertical: 10, paddingLeft: 80}}> 
               <Text style={[styles.topTeamLabel, {color: getTeamColor(gridData.topTeam)}]}>{gridData.topTeam?.toUpperCase() || "AWAY"}</Text>
          </View>
          <View style={{flexDirection: 'row', flex: 1}}>
               <View style={styles.leftLabelContainer}>
                  <Text numberOfLines={1} style={[styles.teamLabelLeft, {color: getTeamColor(gridData.leftTeam)}]}>{gridData.leftTeam?.toUpperCase() || "HOME"}</Text>
               </View>
               <GridBoard 
                  gridData={gridData}
                  topAxis={gridData.topAxis}
                  leftAxis={gridData.leftAxis}
                  winningLoc={winningLoc}
                  highlightedPlayers={highlightedPlayers} 
                  onSquarePress={handleSquarePress} 
                  isWide={isWide}
               />
          </View>
        </View>
      </View>
    </>
  );

  const renderPlayersTab = () => (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        <View style={playerStyles.statsContainer}>
             <View style={playerStyles.statsRow}>
                 <Text style={playerStyles.statsLabel}>TOTAL TAKEN</Text>
                 <Text style={[playerStyles.statsValue, stats.isFull && {color: THEME.accent}]}>{stats.taken} / {stats.total}</Text>
             </View>
             <View style={playerStyles.progressBarBg}>
                {/* Dynamically calculate width based on percentage */}
                <View style={[playerStyles.progressBarFill, { width: `${(stats.taken / stats.total) * 100}%` }]} />
             </View>
        </View>

        {/* ADMIN FORM */}
        {gridData.assignmentMode === 'auto' && isAdmin && (
            <View style={[playerStyles.formCard, stats.isFull && {opacity: 0.5}]}>
            <View style={playerStyles.row}>
                <TextInput style={[playerStyles.input, {flex: 2}]} placeholder="Name" placeholderTextColor="#666" value={pmName} onChangeText={setPmName} editable={!stats.isFull}/>
                <TextInput style={[playerStyles.input, {flex: 1, marginLeft: 10}]} placeholder="#" placeholderTextColor="#666" keyboardType="numeric" value={pmCount} onChangeText={setPmCount} editable={!stats.isFull}/>
            </View>
            {/* Added Note Input */}
            <View style={[playerStyles.row, { marginTop: 10 }]}>
                <TextInput style={[playerStyles.input, { flex: 1 }]} placeholder="Note (e.g. Paid)" placeholderTextColor="#666" value={pmNote} onChangeText={setPmNote} editable={!stats.isFull}/>
            </View>
            <TouchableOpacity style={[playerStyles.addBtn, stats.isFull && playerStyles.disabledBtn]} onPress={handleAutoAssign} disabled={stats.isFull}>
                <Text style={playerStyles.addBtnText}>{stats.isFull ? "FULL" : "Assign"}</Text>
            </TouchableOpacity>
            {!stats.isFull && (
                <TouchableOpacity style={[playerStyles.addBtn, { backgroundColor: THEME.secondary, marginTop: 8 }]} onPress={startImport}>
                <Text style={playerStyles.addBtnText}>📷 Scan List</Text>
                </TouchableOpacity>
            )}
            </View>
        )}

        {/* PLAYER LIST WITH TOGGLE */}
        <FlatList 
            data={playerStats}
            keyExtractor={item => item.name}
            contentContainerStyle={{paddingBottom: 100, paddingHorizontal: 15}}
            renderItem={({item}) => (
                <View style={[playerStyles.playerRow, {alignItems: 'center', flexDirection: 'row'}]}>
                    {/* LEFT SIDE - CLICK TO EDIT */}
                    <TouchableOpacity 
                        style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}
                        onPress={() => openPlayerEditModal(item)}
                        disabled={!isAdmin}
                    >
                        <View style={playerStyles.avatar}>
                            <Text style={playerStyles.avatarText}>{item.name.substring(0,2).toUpperCase()}</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={playerStyles.playerName}>{item.name}</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <View style={playerStyles.badge}><Text style={playerStyles.badgeText}>{item.count}</Text></View>
                                {item.note ? <Text style={[playerStyles.playerNote, {marginLeft: 5}]}>{item.note}</Text> : null}
                            </View>
                        </View>
                    </TouchableOpacity>
                    
                    {/* RIGHT SIDE - TOGGLE ONLY - NO EDIT TRIGGER */}
                    <View style={{alignItems: 'center', marginLeft: 10, width: 50}}>
                        <Text style={{color: '#666', fontSize: 8, marginBottom: 2}}>SHOW</Text>
                        <Switch 
                            value={highlightedPlayers.includes(item.name)} 
                            onValueChange={() => togglePlayerHighlight(item.name)}
                            trackColor={{ false: "#333", true: THEME.primary }}
                            thumbColor={highlightedPlayers.includes(item.name) ? "#FFF" : "#f4f3f4"}
                        />
                    </View>
                </View>
            )}
        />
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* BrandHeader REMOVED */}
      
      {/* SCOREBOARD HEADER */}
      <View style={styles.scoreboard}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')} style={{paddingRight: 15}}>
          <Text style={{color: '#666', fontSize: 18}}>‹</Text>
        </TouchableOpacity>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center'}}>
           <View style={{alignItems: 'center'}}>
              <Text style={[styles.teamBadgeText, {color: getTeamColor(gridData.leftTeam)}]}>{gridData.leftTeam || "HOME"}</Text>
              <Text style={styles.bigScore}>{scores[activeQuarter]?.left || "-"}</Text>
           </View>
           <Text style={styles.vsText}> - </Text>
           <View style={{alignItems: 'center'}}>
              <Text style={[styles.teamBadgeText, {color: getTeamColor(gridData.topTeam)}]}>{gridData.topTeam || "AWAY"}</Text>
              <Text style={styles.bigScore}>{scores[activeQuarter]?.top || "-"}</Text>
           </View>
        </View>
        
        {/* LOGO on Right */}
        <View style={{marginLeft: 15}}>
            <Image source={require('../../assets/logo.png')} style={{width: 40, height: 40, resizeMode: 'contain'}} />
        </View>
      </View>

      {/* MAIN TABS */}
      <View style={{flexDirection: 'row', backgroundColor: '#111', borderBottomWidth: 1, borderColor: '#333'}}>
         {['Info', 'Squares', 'Players'].map(t => {
             const key = t.toLowerCase();
             const isActive = activeTab === key;
             return (
                 <TouchableOpacity 
                    key={key} 
                    style={{flex: 1, paddingVertical: 12, borderBottomWidth: 3, borderColor: isActive ? THEME.primary : 'transparent'}}
                    onPress={() => setActiveTab(key)}
                 >
                     <Text style={{color: isActive ? '#FFF' : '#666', textAlign: 'center', fontWeight: 'bold'}}>{t}</Text>
                 </TouchableOpacity>
             );
         })}
      </View>

      {/* MAIN CONTENT AREA */}
      <View style={{flex: 1}}>
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'squares' && renderSquaresTab()}
        {activeTab === 'players' && renderPlayersTab()}
      </View>

      {/* FLOATING ACTION BUTTONS */}
      {/* Share FAB removed - Moved to Info Tab */}
      
      {/* Follow FAB removed - Moved to Info Tab */}


      {/* --- MODALS (Admin Modal removed - functionality moved to Info Tab) --- */}
      {/* 1. SQUARE DETAILS */}
      <Modal visible={showDetailsModal} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDetailsModal(false)}>
            <View style={styles.detailCard}>
                 <Text style={styles.detailTitle}>Square Details</Text>
                 <View style={styles.ticketContainer}>
                    <View style={styles.ticketColumn}><Text style={styles.ticketLabel}>AWAY</Text><Text style={styles.ticketNumber}>{selectedDetails?.topNum}</Text></View>
                    <View style={styles.ticketDivider} />
                    <View style={styles.ticketColumn}><Text style={styles.ticketLabel}>HOME</Text><Text style={styles.ticketNumber}>{selectedDetails?.leftNum}</Text></View>
                 </View>
                 <Text style={styles.ownerName}>{selectedDetails?.name}</Text>
                 <Text style={styles.ownerNote}>{selectedDetails?.note || "No notes"}</Text>
                 <View style={{height: 20}} />
                 {gridData.assignmentMode === 'manual' && isAdmin && (
                     <Button title="Edit Square" color={THEME.accent} onPress={() => openEditModal(selectedDetails.row, selectedDetails.col, selectedDetails)} />
                 )}
                 <View style={{height: 10}} /><Button title="Close" color="#666" onPress={() => setShowDetailsModal(false)} />
            </View>
        </TouchableOpacity>
      </Modal>

      {/* 2. EDIT SQUARE MANUAL */}
      <Modal visible={showEditModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>Edit Square</Text>
                <TextInput style={styles.modalInput} placeholder="Name" placeholderTextColor="#666" value={editName} onChangeText={setEditName} />
                <TextInput style={styles.modalInput} placeholder="Email" placeholderTextColor="#666" value={editEmail} onChangeText={setEditEmail} />
                <TextInput style={styles.modalInput} placeholder="Note" placeholderTextColor="#666" value={editNote} onChangeText={setEditNote} />
                <View style={{height: 10}} /><Button title="Save" color={THEME.primary} onPress={saveSquareInfo} />
                <View style={{height: 10}} /><Button title="Cancel" color="#666" onPress={() => setShowEditModal(false)} />
            </View>
        </View>
      </Modal>

      {/* 3. EDIT PLAYER (ADMIN) */}
      <Modal visible={showPlayerEditModal} transparent={true} animationType="slide">
         <View style={styles.modalOverlay}>
             <View style={styles.detailCard}>
                 <Text style={playerStyles.modalTitle}>Edit {selectedPlayer?.name}</Text>
                 <Text style={{color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 5}}>SQUARE COUNT</Text>
                 <TextInput style={playerStyles.modalInput} placeholder="#" placeholderTextColor="#666" value={playerEditCount} onChangeText={setPlayerEditCount} keyboardType="numeric"/>
                 <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between'}}>
                    <View style={{flex: 1}}><Text style={{color: '#fff', fontWeight: 'bold'}}>Re-roll Squares?</Text><Text style={{color: '#666', fontSize: 10}}>Clears current spots and picks random new ones.</Text></View>
                    <Switch value={isReshuffle} onValueChange={setIsReshuffle} trackColor={{ false: "#333", true: THEME.primary }}/>
                 </View>
                 <Text style={{color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 5}}>NOTE</Text>
                 <TextInput style={playerStyles.modalInput} placeholder="Note" placeholderTextColor="#666" value={playerEditNote} onChangeText={setPlayerEditNote}/>
                 <Button title="Save Changes" color={THEME.primary} onPress={handleSavePlayerChanges} />
                 <View style={{height: 10}}/><Button title="Cancel" color="#666" onPress={() => setShowPlayerEditModal(false)} />
                 <View style={{marginTop: 20, borderTopWidth: 1, borderColor: '#333', paddingTop: 10}}>
                    <Button title="Delete Player" color={THEME.error} onPress={handleDeletePlayer} />
                 </View>
             </View>
         </View>
      </Modal>

      {/* 4. ADMIN MODAL IS REMOVED - Logic moved to Info Tab */}
      
      {/* 5. IMPORT REVIEW MODAL */}
      <ImportReviewModal visible={importModalVisible} isLoading={isImporting} importedPlayers={scannedPlayers} onClose={() => setImportModalVisible(false)} onConfirm={confirmImport} />

    </SafeAreaView>
  );
}