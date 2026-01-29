import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, TextInput, Button, Alert, ScrollView } from 'react-native';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

// --- IMPORTS ---
import { db, auth } from '../../firebaseConfig'; // <--- CHECK THIS PATH
import GridBoard from '../components/GridBoard'; // <--- THE NEW COMPONENT
import { THEME } from '../theme';

// --- SAFE DEFAULTS ---
const DEFAULT_SCORES = {
  q1: { top: '', left: '' },
  q2: { top: '', left: '' },
  q3: { top: '', left: '' },
  final: { top: '', left: '' },
};

export default function GameScreen({ route, navigation }) {
  const { gameId } = route.params;
  
  // Data State
  const [gridData, setGridData] = useState({});
  const [user, setUser] = useState(null);
  const [activeQuarter, setActiveQuarter] = useState('q1');
  const [scores, setScores] = useState(DEFAULT_SCORES);
  // ... existing state ...
  // NEW: State for the "Square Details" popup
  const [selectedSquare, setSelectedSquare] = useState(null);

  const handleSquarePress = (data) => {
    // data = { row, col, owner }
    setSelectedSquare(data);
  };

  // Admin State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [topTeamInput, setTopTeamInput] = useState("");
  const [leftTeamInput, setLeftTeamInput] = useState("");

  // --- EFFECT: Load Data ---
  useEffect(() => {
    const unsubDocs = onSnapshot(doc(db, "squares_pool", gameId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGridData(data);
        if (data.topTeam) setTopTeamInput(data.topTeam);
        if (data.leftTeam) setLeftTeamInput(data.leftTeam);
        if (data.scores) setScores(prev => ({ ...prev, ...data.scores }));
      }
    });
    const unsubAuth = onAuthStateChanged(auth, u => setUser(u));
    return () => { unsubDocs(); unsubAuth(); };
  }, [gameId]);

  // --- HELPERS: Winning Logic ---
  const getWinningCoords = () => {
    if (!gridData.topAxis || !gridData.leftAxis) return null;
    const currentScores = scores[activeQuarter];
    if (!currentScores) return null;
    if (currentScores.top === '' && currentScores.left === '') return null;

    const tVal = currentScores.top === '' ? '0' : currentScores.top;
    const lVal = currentScores.left === '' ? '0' : currentScores.left;
    const tDigit = parseInt(tVal.toString().slice(-1));
    const lDigit = parseInt(lVal.toString().slice(-1));

    if (isNaN(tDigit) || isNaN(lDigit)) return null;

    const colIndex = gridData.topAxis.indexOf(tDigit);
    const rowIndex = gridData.leftAxis.indexOf(lDigit);

    if (colIndex === -1 || rowIndex === -1) return null;
    return { row: rowIndex, col: colIndex };
  };

  const winningLoc = getWinningCoords();

  const getTeamColor = (name) => {
    if (!name) return '#555';
    const n = name.toLowerCase();
    if (n.includes('chief') || n.includes('49') || n.includes('bucs')) return THEME.red;
    if (n.includes('eagle') || n.includes('pack') || n.includes('jet')) return THEME.green;
    return '#444';
  };

  // --- ACTIONS ---
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail(""); setPassword(""); setShowAdminModal(false);
    } catch (e) { Alert.alert("Error", e.message); }
  };

  const handleSaveAll = async () => {
    await setDoc(doc(db, "squares_pool", gameId), {
      topTeam: topTeamInput, leftTeam: leftTeamInput, scores: scores
    }, { merge: true });
    Alert.alert("Success", "Board Updated");
  };

  const updateScoreInput = (q, team, val) => {
    setScores(prev => ({ ...prev, [q]: { ...prev[q], [team]: val } }));
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. SCOREBOARD HEADER */}
      <View style={styles.scoreboard}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingRight: 15}}>
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

      {/* 2. QUARTER TABS */}
      <View style={styles.tabBar}>
        {['q1','q2','q3','final'].map(q => (
          <TouchableOpacity key={q} style={[styles.qTab, activeQuarter === q && styles.qTabActive]} onPress={() => setActiveQuarter(q)}>
            <Text style={[styles.qTabText, activeQuarter === q && styles.qTabTextActive]}>{q.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 3. THE GRID BOARD */}
      {/* ADDED: centeredView to keep the board in the middle of the screen */}
      <View style={styles.centeredView}>
        <View style={styles.boardConstrainer}>
          
          {/* Top Label - Now aligned to the grid, not the screen */}
          <View style={{alignItems: 'center', paddingVertical: 10, paddingLeft: 80}}> 
               <Text style={[styles.axisLabel, {color: getTeamColor(gridData.topTeam)}]}>
                   {gridData.topTeam?.toUpperCase() || "AWAY"}
               </Text>
          </View>
          
          <View style={{flexDirection: 'row', flex: 1}}>
               {/* Left Label Container - Fixed Width */}
               <View style={styles.leftLabelContainer}>
                  <Text numberOfLines={1} style={[styles.teamLabelLeft, {color: getTeamColor(gridData.leftTeam)}]}>
                      {gridData.leftTeam?.toUpperCase() || "HOME"}
                  </Text>
               </View>
               
               {/* THE COMPONENT */}
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

      {/* 4. ADMIN MODAL & FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAdminModal(true)}>
        <Text style={{fontSize: 20}}>⚙️</Text>
      </TouchableOpacity>
      
      <Modal visible={showAdminModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ref Controls</Text>
            
            {!user ? (
               <View>
                 <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} placeholderTextColor="#666" autoCapitalize="none"/>
                 <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry placeholderTextColor="#666"/>
                 <Button title="Login" color={THEME.accent} onPress={handleLogin} />
               </View>
            ) : (
              <ScrollView>
                 <Text style={styles.sectionHeader}>Scores (Home - Away)</Text>
                 {['q1','q2','q3','final'].map(q => (
                   <View key={q} style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>{q.toUpperCase()}</Text>
                      <TextInput value={scores[q]?.top} onChangeText={(v) => updateScoreInput(q, 'top', v)} style={styles.smallScoreInput} keyboardType="numeric" placeholder="Away"/>
                      <TextInput value={scores[q]?.left} onChangeText={(v) => updateScoreInput(q, 'left', v)} style={styles.smallScoreInput} keyboardType="numeric" placeholder="Home"/>
                   </View>
                 ))}
                 <Button title="💾 Update All" color={THEME.accent} onPress={handleSaveAll} />
                 
                 <View style={{height: 20}}/>
                 <Text style={styles.sectionHeader}>Teams</Text>
                 <TextInput value={topTeamInput} onChangeText={setTopTeamInput} style={styles.input} placeholder="Top Team"/>
                 <TextInput value={leftTeamInput} onChangeText={setLeftTeamInput} style={styles.input} placeholder="Left Team"/>
                 
                 <View style={{height: 20}}/>
                 <Button title="Log Out" color="#666" onPress={() => { signOut(auth); setShowAdminModal(false); }} />
              </ScrollView>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowAdminModal(false)}>
                <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 5. SQUARE DETAILS MODAL */}
      <Modal 
        visible={!!selectedSquare} 
        transparent={true} 
        animationType="fade"
        onRequestClose={() => setSelectedSquare(null)}
      >
        <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setSelectedSquare(null)} // Click outside to close
        >
          <View style={styles.detailCard}>
             <Text style={styles.detailTitle}>Square Info</Text>
             
             <View style={styles.detailRow}>
                 <Text style={styles.detailLabel}>Owner:</Text>
                 <Text style={styles.detailValue}>
                    {selectedSquare?.owner ? selectedSquare.owner : "Available"}
                 </Text>
             </View>

             <View style={styles.detailRow}>
                 <Text style={styles.detailLabel}>Numbers:</Text>
                 <Text style={styles.detailValue}>
                    {/* Safe check for axis numbers */}
                    Top: {gridData.topAxis ? gridData.topAxis[selectedSquare?.col] : "?"}  •  
                    Left: {gridData.leftAxis ? gridData.leftAxis[selectedSquare?.row] : "?"}
                 </Text>
             </View>

             <Button title="Close" color={THEME.primary} onPress={() => setSelectedSquare(null)} />
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  
  // Scoreboard
  scoreboard: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: THEME.card, borderBottomWidth: 1, borderColor: THEME.border },
  teamBadgeText: { fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  bigScore: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  vsText: { color: '#666', fontWeight: 'bold', fontSize: 14, marginHorizontal: 15 },
  
  // Tabs
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333' },
  qTab: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: THEME.card },
  qTabActive: { borderBottomWidth: 3, borderColor: THEME.accent, backgroundColor: '#252525' },
  qTabText: { color: '#666', fontWeight: 'bold' },
  qTabTextActive: { color: THEME.accent },
  
  // Board Area
  centeredView: { flex: 1, alignItems: 'center', },
  boardConstrainer: { width: '100%', maxWidth: 500, flex: 1, paddingBottom: 40 },
  axisLabel: { fontWeight: 'bold', fontSize: 16 },
  leftLabelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80, // Keep the column narrow visually
    zIndex: 1, // Ensures it sits on top if there's overlap
  },
  teamLabelLeft: {
    fontWeight: 'bold',
    fontSize: 16,
    // Rotation Logic:
    transform: [{ rotate: '-90deg' }], 
    width: 300, // Make this WIDE so long names don't wrap onto two lines
    textAlign: 'center',  
    // We removed absolute/right/top. 
    // Flexbox will automatically center the rotated text in the container.
  },

  // Admin Modal (Simplified from previous)
  fab: { position: 'absolute', bottom: 30, right: 30, width: 50, height: 50, borderRadius: 25, backgroundColor: THEME.card, borderWidth: 1, borderColor: '#666', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)', // Even darker background dim
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999, 
  },
  detailCard: {
      width: 300,
      backgroundColor: '#1E1E1E', // Force Dark Grey background
      borderRadius: 12,
      padding: 30, // More breathing room
      borderWidth: 2, // Thicker border
      borderColor: THEME.primary, // Electric Blue border
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.8, // Heavy shadow
      shadowRadius: 25,
      elevation: 20,
  },
  detailTitle: {
      fontSize: 24, // Bigger
      fontWeight: 'bold',
      color: '#FFFFFF', // FORCE WHITE TEXT
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#333',
      width: '100%',
      textAlign: 'center',
      paddingBottom: 15
  },
  detailRow: {
      marginBottom: 20,
      alignItems: 'center',
      width: '100%',
  },
  detailLabel: {
      color: '#AAAAAA', // Light Grey for labels
      fontSize: 14,
      textTransform: 'uppercase',
      marginBottom: 8,
      fontWeight: 'bold',
      letterSpacing: 1,
  },
  detailValue: {
      color: '#FFFFFF', // FORCE WHITE for values
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
  },
  modalContent: { width: '90%', maxHeight: '80%', backgroundColor: THEME.bg, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  sectionHeader: { color: '#888', marginTop: 15, marginBottom: 5, fontSize: 12, textTransform: 'uppercase' },
  input: { backgroundColor: '#222', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#444' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between' },
  scoreLabel: { color: '#fff', width: 40, fontWeight: 'bold' },
  smallScoreInput: { backgroundColor: '#222', color: '#fff', width: '35%', textAlign: 'center', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#444' },
  closeBtn: { marginTop: 20, alignSelf: 'center' },
  closeText: { color: '#888' }
});