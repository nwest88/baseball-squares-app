import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, TextInput, Button, Alert, ScrollView } from 'react-native';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

import { db, auth } from '../../firebaseConfig'; 
import GridBoard from '../components/GridBoard'; 
import { THEME } from '../theme';

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
  
  // ADMIN STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  
  // MANUAL ASSIGNMENT STATE
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSquare, setEditingSquare] = useState(null); // { row, col }
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNote, setEditNote] = useState("");

  useEffect(() => {
    const unsubDocs = onSnapshot(doc(db, "squares_pool", gameId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGridData(data);
        if (data.scores) setScores(prev => ({ ...prev, ...data.scores }));
      }
    });
    const unsubAuth = onAuthStateChanged(auth, u => setUser(u));
    return () => { unsubDocs(); unsubAuth(); };
  }, [gameId]);

  // --- ACTIONS ---

  const handleSquarePress = (data) => {
    // data = { row, col, owner (string or object) }
    
    // Check Assignment Mode
    const mode = gridData.assignmentMode || 'manual'; // Default to manual for old games

    if (mode === 'manual') {
        // OPEN EDIT MODAL
        setEditingSquare({ row: data.row, col: data.col });
        
        // Pre-fill if owner exists
        if (data.owner) {
            if (typeof data.owner === 'object') {
                setEditName(data.owner.name || "");
                setEditEmail(data.owner.email || "");
                setEditNote(data.owner.note || "");
            } else {
                setEditName(data.owner); // Old string format
                setEditEmail("");
                setEditNote("");
            }
        } else {
            // Empty Square
            setEditName("");
            setEditEmail("");
            setEditNote("");
        }
        setShowEditModal(true);
    } else {
        // Auto Mode (Coming in Sprint 2)
        Alert.alert("Auto Mode", "Use the 'Add Player' button to randomly assign squares.");
    }
  };

  const saveSquareInfo = async () => {
    if (!editingSquare) return;
    
    const key = `${editingSquare.row}-${editingSquare.col}`;
    
    // Save as Object
    const newOwnerData = {
        name: editName,
        email: editEmail,
        note: editNote
    };

    // If name is empty, clear the square (delete field logic, or just null)
    // For simplicity, we just set it to null if name is empty
    const valueToSave = editName.trim() === "" ? null : newOwnerData;

    try {
        await setDoc(doc(db, "squares_pool", gameId), {
            [key]: valueToSave
        }, { merge: true });
        
        setShowEditModal(false);
    } catch (e) {
        Alert.alert("Error", "Could not save square.");
    }
  };

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

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail(""); setPassword(""); setShowAdminModal(false);
    } catch (e) { Alert.alert("Error", e.message); }
  };

  const handleSaveScores = async () => {
    await setDoc(doc(db, "squares_pool", gameId), { scores: scores }, { merge: true });
    Alert.alert("Success", "Scores Updated");
  };

  const updateScoreInput = (q, team, val) => {
    setScores(prev => ({ ...prev, [q]: { ...prev[q], [team]: val } }));
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. SCOREBOARD */}
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

      {/* 2. TABS */}
      <View style={styles.tabBar}>
        {['q1','q2','q3','final'].map(q => (
          <TouchableOpacity key={q} style={[styles.qTab, activeQuarter === q && styles.qTabActive]} onPress={() => setActiveQuarter(q)}>
            <Text style={[styles.qTabText, activeQuarter === q && styles.qTabTextActive]}>{q.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 3. GRID BOARD */}
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
                  onSquarePress={handleSquarePress} // <--- Pass Handler
               />
          </View>
        </View>
      </View>

      {/* 4. ADMIN BUTTON */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAdminModal(true)}>
        <Text style={{fontSize: 20}}>⚙️</Text>
      </TouchableOpacity>
      
      {/* 5. MANUAL EDIT MODAL */}
      <Modal visible={showEditModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>Edit Square</Text>
                
                <TextInput 
                    style={styles.modalInput} placeholder="Player Name" placeholderTextColor="#666"
                    value={editName} onChangeText={setEditName}
                />
                <TextInput 
                    style={styles.modalInput} placeholder="Email (Optional)" placeholderTextColor="#666"
                    value={editEmail} onChangeText={setEditEmail} autoCapitalize="none" keyboardType="email-address"
                />
                <TextInput 
                    style={styles.modalInput} placeholder="Note (e.g. Paid)" placeholderTextColor="#666"
                    value={editNote} onChangeText={setEditNote}
                />

                <View style={{height: 10}} />
                <Button title="Save Square" color={THEME.primary} onPress={saveSquareInfo} />
                <View style={{height: 10}} />
                <Button title="Cancel" color="#666" onPress={() => setShowEditModal(false)} />
            </View>
        </View>
      </Modal>

      {/* 6. ADMIN MODAL */}
      <Modal visible={showAdminModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Ref Controls</Text>
            {!user ? (
               <View style={{width: '100%'}}>
                 <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.modalInput} placeholderTextColor="#666" autoCapitalize="none"/>
                 <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.modalInput} secureTextEntry placeholderTextColor="#666"/>
                 <Button title="Login" color={THEME.accent} onPress={handleLogin} />
                 <View style={{marginTop: 10}}>
                     <Button title="Cancel" color="#666" onPress={() => setShowAdminModal(false)} />
                 </View>
               </View>
            ) : (
              <ScrollView style={{width: '100%'}}>
                 <Text style={styles.sectionHeader}>Scores</Text>
                 {['q1','q2','q3','final'].map(q => (
                   <View key={q} style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>{q.toUpperCase()}</Text>
                      <TextInput value={scores[q]?.top} onChangeText={(v) => updateScoreInput(q, 'top', v)} style={styles.smallScoreInput} keyboardType="numeric" placeholder="Away"/>
                      <TextInput value={scores[q]?.left} onChangeText={(v) => updateScoreInput(q, 'left', v)} style={styles.smallScoreInput} keyboardType="numeric" placeholder="Home"/>
                   </View>
                 ))}
                 <Button title="Update Scores" color={THEME.accent} onPress={handleSaveScores} />
                 
                 <View style={{height: 20}}/>
                 <Button title="Log Out" color="#666" onPress={() => { signOut(auth); setShowAdminModal(false); }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  scoreboard: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: THEME.card, borderBottomWidth: 1, borderColor: THEME.border },
  teamBadgeText: { fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  bigScore: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  vsText: { color: '#666', fontWeight: 'bold', fontSize: 14, marginHorizontal: 15 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333' },
  qTab: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: THEME.card },
  qTabActive: { borderBottomWidth: 3, borderColor: THEME.accent, backgroundColor: '#252525' },
  qTabText: { color: '#666', fontWeight: 'bold' },
  qTabTextActive: { color: THEME.accent },
  centeredView: { flex: 1, alignItems: 'center' },
  boardConstrainer: { width: '100%', maxWidth: 500, flex: 1, paddingBottom: 40 },
  axisLabel: { fontWeight: 'bold', fontSize: 16 },
  leftLabelContainer: { justifyContent: 'center', alignItems: 'center', width: 80, backgroundColor: 'transparent', zIndex: 1 },
  teamLabelLeft: { fontWeight: 'bold', fontSize: 16, width: 260, textAlign: 'center', transform: [{ rotate: '-90deg' }] },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 50, height: 50, borderRadius: 25, backgroundColor: THEME.card, borderWidth: 1, borderColor: '#666', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  detailCard: { width: 300, backgroundColor: '#1E1E1E', borderRadius: 12, padding: 30, borderWidth: 2, borderColor: THEME.primary, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.8, shadowRadius: 25, elevation: 20 },
  detailTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#333', width: '100%', textAlign: 'center', paddingBottom: 15 },
  modalInput: { width: '100%', backgroundColor: '#333', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#555' },
  sectionHeader: { color: '#888', marginTop: 15, marginBottom: 5, fontSize: 12, textTransform: 'uppercase' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between', width: '100%' },
  scoreLabel: { color: '#fff', width: 40, fontWeight: 'bold' },
  smallScoreInput: { backgroundColor: '#222', color: '#fff', width: '35%', textAlign: 'center', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#444' }
});