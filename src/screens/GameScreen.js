import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Modal, TextInput, Button, Alert, ScrollView, ActivityIndicator, Share, Platform } from 'react-native';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

import { db, auth } from '../../firebaseConfig'; 
import GridBoard from '../components/GridBoard'; 
import { styles } from '../styles/GameScreen.styles'; // Using your separate style file
import { THEME } from '../theme';
import BrandHeader from '../components/BrandHeader';

const DEFAULT_SCORES = {
  q1: { top: '', left: '' },
  q2: { top: '', left: '' },
  q3: { top: '', left: '' },
  final: { top: '', left: '' },
};

export default function GameScreen({ route, navigation }) {
  const { gameId } = route.params;
  
  const [gridData, setGridData] = useState({});
  const [user, setUser] = useState(null);
  const [activeQuarter, setActiveQuarter] = useState('q1');
  const [scores, setScores] = useState(DEFAULT_SCORES);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(""); 
  
  // ADMIN & MODAL STATES
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  // EDIT SQUARE STATE
  const [editingSquare, setEditingSquare] = useState(null); 
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNote, setEditNote] = useState("");

  // ADMIN LOGIN INPUTS
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- NEW: SETTINGS STATE (For renaming teams/pool) ---
  const [settingsName, setSettingsName] = useState("");
  const [settingsTop, setSettingsTop] = useState("");
  const [settingsLeft, setSettingsLeft] = useState("");

  useEffect(() => {
    const unsubDocs = onSnapshot(doc(db, "squares_pool", gameId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGridData(data);
        
        // Sync Scores
        if (data.scores) {
            setScores(prev => ({
                q1: { ...DEFAULT_SCORES.q1, ...data.scores.q1 },
                q2: { ...DEFAULT_SCORES.q2, ...data.scores.q2 },
                q3: { ...DEFAULT_SCORES.q3, ...data.scores.q3 },
                final: { ...DEFAULT_SCORES.final, ...data.scores.final },
            }));
        }

        // Sync Settings Inputs (Only if user hasn't typed yet to avoid overwriting)
        // Ideally we sync on load, but for realtime updates:
        if (!showAdminModal) {
            setSettingsName(data.name || "");
            setSettingsTop(data.topTeam || "");
            setSettingsLeft(data.leftTeam || "");
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
  }, [gameId, showAdminModal]); // Re-sync when modal closes/opens

  // --- ACTIONS ---

  const handleShare = async () => {
    const url = `https://baseball-squares-mvp.web.app/game/${gameId}`;
    const message = `Join my Squares Pool!\nGame ID: ${gameId}\n\nPlay here: ${url}`;
    try {
      await Share.share({ message, url, title: 'Squares Pool Invite' });
    } catch (error) { Alert.alert(error.message); }
  };

  const handleSquarePress = (data) => {
    if (data.owner) {
        // View Details
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

    // Edit Empty
    const mode = gridData.assignmentMode || 'manual'; 
    if (mode === 'manual') {
        openEditModal(data.row, data.col);
    } else {
        Alert.alert("Auto Mode", "Use the 'People' button to randomly assign squares.");
    }
  };

  const openEditModal = (row, col, existingData = null) => {
    setEditingSquare({ row, col });
    if (existingData) {
        setEditName(existingData.name || "");
        setEditEmail(existingData.email || "");
        setEditNote(existingData.note || "");
    } else {
        setEditName(""); setEditEmail(""); setEditNote("");
    }
    setShowDetailsModal(false); 
    setShowEditModal(true);     
  };

  const saveSquareInfo = async () => {
    if (!editingSquare) return;
    const key = `${editingSquare.row}-${editingSquare.col}`;
    const newOwnerData = { name: editName, email: editEmail, note: editNote };
    const valueToSave = editName.trim() === "" ? null : newOwnerData;

    try {
        await setDoc(doc(db, "squares_pool", gameId), { [key]: valueToSave }, { merge: true });
        setShowEditModal(false);
    } catch (e) { Alert.alert("Error", "Could not save square."); }
  };

  const handleRandomizeNumbers = async () => {
      const cols = gridData.gridCols || 10;
      const rows = gridData.gridRows || 10;
      const generateShuffled = (size) => {
          const arr = Array.from({ length: size }, (_, i) => i);
          return arr.sort(() => Math.random() - 0.5);
      };
      try {
          await updateDoc(doc(db, "squares_pool", gameId), {
              topAxis: generateShuffled(cols),
              leftAxis: generateShuffled(rows)
          });
          Alert.alert("Success", "Numbers Randomized!");
      } catch (e) { Alert.alert("Error", e.message); }
  };

  // --- NEW: UPDATE SETTINGS ---
  const handleUpdateSettings = async () => {
      try {
          await updateDoc(doc(db, "squares_pool", gameId), {
              name: settingsName,
              topTeam: settingsTop,
              leftTeam: settingsLeft
          });
          Alert.alert("Success", "Pool details updated!");
      } catch (e) {
          Alert.alert("Error", e.message);
      }
  };

  const handleSaveScores = async () => {
    try {
        await setDoc(doc(db, "squares_pool", gameId), { scores: scores }, { merge: true });
        Alert.alert("Success", "Scores Updated");
    } catch (e) { Alert.alert("Save Failed", e.message); }
  };

  const updateScoreInput = (q, team, val) => {
    setScores(prev => ({ ...prev, [q]: { ...(prev[q] || {}), [team]: val } }));
  };

  const getWinningCoords = () => {
    if (!gridData.topAxis || !gridData.leftAxis) return null;
    const currentScores = scores[activeQuarter];
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
  const winningLoc = getWinningCoords();

  const getTeamColor = (name) => {
    if (!name) return '#555';
    const n = name.toLowerCase();
    if (n.includes('chief') || n.includes('49') || n.includes('bucs')) return THEME.red;
    if (n.includes('eagle') || n.includes('pack') || n.includes('jet')) return THEME.green;
    return '#444';
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail(""); setPassword(""); 
    } catch (e) { Alert.alert("Error", e.message); }
  };

  if (loading || (!gridData.id && !loadError)) {
    return (
        <SafeAreaView style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={{color: '#666', marginTop: 10, fontSize: 16}}>Finding Pool...</Text>
        </SafeAreaView>
    );
  }

  if (loadError) {
      return (
        <SafeAreaView style={[styles.container, {justifyContent: 'center', alignItems: 'center', padding: 20}]}>
            <Text style={{color: 'red', fontSize: 18, fontWeight: 'bold'}}>ERROR</Text>
            <Text style={{color: '#fff', textAlign: 'center'}}>{loadError}</Text>
            <Button title="Go Home" color="#666" onPress={() => navigation.navigate('Home')} />
        </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BrandHeader />
      
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
        <View style={{width: 30}} />
      </View>

      <View style={styles.tabBar}>
        {['q1','q2','q3','final'].map(q => (
          <TouchableOpacity key={q} style={[styles.qTab, activeQuarter === q && styles.qTabActive]} onPress={() => setActiveQuarter(q)}>
            <Text style={[styles.qTabText, activeQuarter === q && styles.qTabTextActive]}>{q.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.centeredView}>
        <View style={styles.boardConstrainer}>
          <View style={{alignItems: 'center', paddingVertical: 10, paddingLeft: 80}}> 
               <Text style={[styles.axisLabel, {color: getTeamColor(gridData.topTeam)}]}>
                   {gridData.topTeam?.toUpperCase() || "AWAY"}
               </Text>
          </View>
          <View style={{flexDirection: 'row', flex: 1}}>
               <View style={styles.leftLabelContainer}>
                  <Text numberOfLines={1} style={[styles.teamLabelLeft, {color: getTeamColor(gridData.leftTeam)}]}>
                      {gridData.leftTeam?.toUpperCase() || "HOME"}
                  </Text>
               </View>
               <GridBoard 
                  gridData={gridData}
                  topAxis={gridData.topAxis}
                  leftAxis={gridData.leftAxis}
                  winningLoc={winningLoc}
                  onSquarePress={handleSquarePress} 
               />
          </View>
        </View>
      </View>

      {/* FABs */}
      <TouchableOpacity style={styles.fabRight} onPress={() => setShowAdminModal(true)}>
        <Text style={{fontSize: 20}}>⚙️</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.fabLeft} onPress={() => navigation.navigate('PlayerManager', { gameId: gameId })}>
        <Text style={{fontSize: 20}}>👥</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.fabShare} onPress={handleShare}>
        <Text style={{fontSize: 20}}>📤</Text>
      </TouchableOpacity>

      {/* MODALS */}
      <Modal visible={showDetailsModal} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDetailsModal(false)}>
            <View style={styles.detailCard}>
                 <Text style={styles.detailTitle}>Square Details</Text>
                 <View style={styles.ticketContainer}>
                    <View style={styles.ticketColumn}>
                        <Text style={styles.ticketLabel}>AWAY</Text>
                        <Text style={styles.ticketNumber}>{selectedDetails?.topNum}</Text>
                    </View>
                    <View style={styles.ticketDivider} />
                    <View style={styles.ticketColumn}>
                        <Text style={styles.ticketLabel}>HOME</Text>
                        <Text style={styles.ticketNumber}>{selectedDetails?.leftNum}</Text>
                    </View>
                 </View>
                 <Text style={styles.ownerName}>{selectedDetails?.name}</Text>
                 <Text style={styles.ownerNote}>{selectedDetails?.note || "No notes"}</Text>
                 <View style={{height: 20}} />
                 {gridData.assignmentMode === 'manual' && (
                     <Button title="Edit Square" color={THEME.accent} onPress={() => openEditModal(selectedDetails.row, selectedDetails.col, selectedDetails)} />
                 )}
                 <View style={{height: 10}} /><Button title="Close" color="#666" onPress={() => setShowDetailsModal(false)} />
            </View>
        </TouchableOpacity>
      </Modal>

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

      <Modal visible={showAdminModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Admin Controls</Text>
            
            {!user ? (
               <View style={{width: '100%'}}>
                 <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.modalInput} placeholderTextColor="#666" autoCapitalize="none"/>
                 <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.modalInput} secureTextEntry placeholderTextColor="#666"/>
                 <Button title="Login" color={THEME.accent} onPress={handleLogin} />
                 <View style={{marginTop: 15}}><Button title="Close" color="#666" onPress={() => setShowAdminModal(false)} /></View>
               </View>
            ) : (
              <ScrollView style={{width: '100%'}}>
                 
                 {/* --- 1. NEW: GAME SETTINGS --- */}
                 <Text style={styles.sectionHeader}>Game Settings</Text>
                 <Text style={styles.inputLabel}>Pool Name</Text>
                 <TextInput style={styles.modalInput} value={settingsName} onChangeText={setSettingsName} placeholder="Pool Name" placeholderTextColor="#666" />
                 
                 <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={{flex: 1, marginRight: 5}}>
                        <Text style={styles.inputLabel}>Away Team</Text>
                        <TextInput style={styles.modalInput} value={settingsTop} onChangeText={setSettingsTop} placeholder="Away" placeholderTextColor="#666" />
                    </View>
                    <View style={{flex: 1, marginLeft: 5}}>
                        <Text style={styles.inputLabel}>Home Team</Text>
                        <TextInput style={styles.modalInput} value={settingsLeft} onChangeText={setSettingsLeft} placeholder="Home" placeholderTextColor="#666" />
                    </View>
                 </View>
                 <Button title="Save Settings" color={THEME.primary} onPress={handleUpdateSettings} />

                 <View style={{height: 20, borderBottomWidth: 1, borderColor: '#333', marginBottom: 20}}/>

                 {/* 2. GAME SCORES */}
                 <Text style={styles.sectionHeader}>Game Scores</Text>
                 {['q1','q2','q3','final'].map(q => (
                   <View key={q} style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>{q.toUpperCase()}</Text>
                      <TextInput 
                        value={(scores[q]?.top || '').toString()} 
                        onChangeText={(v) => updateScoreInput(q, 'top', v)} 
                        style={styles.smallScoreInput} keyboardType="numeric" placeholder="Away"
                      />
                      <TextInput 
                        value={(scores[q]?.left || '').toString()} 
                        onChangeText={(v) => updateScoreInput(q, 'left', v)} 
                        style={styles.smallScoreInput} keyboardType="numeric" placeholder="Home"
                      />
                   </View>
                 ))}
                 <Button title="Update Scores" color={THEME.accent} onPress={handleSaveScores} />
                 
                 <View style={{height: 20, borderBottomWidth: 1, borderColor: '#333', marginBottom: 20}}/>
                 
                 {/* 3. GAME SETUP */}
                 <Text style={styles.sectionHeader}>Grid Setup</Text>
                 <TouchableOpacity style={styles.actionBtn} onPress={handleRandomizeNumbers}>
                    <Text style={styles.actionBtnText}>🎲 Randomize Numbers</Text>
                 </TouchableOpacity>
                 
                 <View style={{height: 20}}/>
                 <Button title="Log Out" color="#444" onPress={() => { signOut(auth); setShowAdminModal(false); }} />
                 <View style={{height: 10}}/><Button title="Close Menu" color="#666" onPress={() => setShowAdminModal(false)} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}