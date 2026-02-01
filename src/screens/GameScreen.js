import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, TextInput, Button, Alert, ScrollView, ActivityIndicator, Share, Platform } from 'react-native';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from '../../firebaseConfig'; 
import GridBoard from '../components/GridBoard'; 
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
  
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  const [editingSquare, setEditingSquare] = useState(null); 
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNote, setEditNote] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
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
  }, [gameId]);

  // --- ACTIONS ---

  // 3. NEW SHARE FUNCTION
  const handleShare = async () => {
    const url = `https://baseball-squares-mvp.web.app`; // Your PWA URL
    const message = `Join my Squares Pool!\nGame ID: ${gameId}\n\nPlay here: ${url}`;
    
    try {
      const result = await Share.share({
        message: message,
        url: url, // iOS adds this as a link
        title: 'Squares Pool Invite'
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message);
    }
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
    } catch (e) {
        Alert.alert("Error", "Could not save square.");
    }
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
      } catch (e) {
          Alert.alert("Error", e.message);
      }
  };

  const handleSaveScores = async () => {
    try {
        await setDoc(doc(db, "squares_pool", gameId), { scores: scores }, { merge: true });
        Alert.alert("Success", "Scores Updated");
    } catch (e) {
        Alert.alert("Save Failed", e.message);
    }
  };

  const updateScoreInput = (q, team, val) => {
    setScores(prev => ({ 
        ...prev, 
        [q]: { ...(prev[q] || {}), [team]: val } 
    }));
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
      
      {/* SCOREBOARD */}
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

      {/* TABS */}
      <View style={styles.tabBar}>
        {['q1','q2','q3','final'].map(q => (
          <TouchableOpacity key={q} style={[styles.qTab, activeQuarter === q && styles.qTabActive]} onPress={() => setActiveQuarter(q)}>
            <Text style={[styles.qTabText, activeQuarter === q && styles.qTabTextActive]}>{q.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* GRID BOARD */}
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

      {/* 4. NEW SHARE BUTTON (Top Right, above Grid) */}
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
            <Text style={styles.detailTitle}>Ref Controls</Text>
            {!user ? (
               <View style={{width: '100%'}}>
                 <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.modalInput} placeholderTextColor="#666" autoCapitalize="none"/>
                 <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.modalInput} secureTextEntry placeholderTextColor="#666"/>
                 <Button title="Login" color={THEME.accent} onPress={handleLogin} />
                 <View style={{marginTop: 15}}><Button title="Close" color="#666" onPress={() => setShowAdminModal(false)} /></View>
               </View>
            ) : (
              <ScrollView style={{width: '100%'}}>
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
                 <Text style={styles.sectionHeader}>Game Setup</Text>
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
  fabRight: { position: 'absolute', bottom: 30, right: 30, width: 50, height: 50, borderRadius: 25, backgroundColor: THEME.card, borderWidth: 1, borderColor: '#666', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabLeft: { position: 'absolute', bottom: 30, left: 30, width: 50, height: 50, borderRadius: 25, backgroundColor: THEME.card, borderWidth: 1, borderColor: '#666', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  // 5. NEW SHARE BUTTON STYLE
  fabShare: { 
    position: 'absolute', 
    top: 130, // Adjust this based on header height
    right: 20, 
    width: 40, height: 40, 
    borderRadius: 20, 
    backgroundColor: THEME.primary, 
    justifyContent: 'center', alignItems: 'center', 
    elevation: 5, shadowColor: THEME.primary, shadowOpacity: 0.5 
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  detailCard: { width: 300, backgroundColor: '#1E1E1E', borderRadius: 12, padding: 30, borderWidth: 2, borderColor: THEME.primary, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.8, shadowRadius: 25, elevation: 20, maxHeight: '80%' },
  detailTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#333', width: '100%', textAlign: 'center', paddingBottom: 15 },
  modalInput: { width: '100%', backgroundColor: '#333', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#555' },
  sectionHeader: { color: '#888', marginTop: 10, marginBottom: 10, fontSize: 12, textTransform: 'uppercase', alignSelf: 'flex-start', fontWeight: 'bold' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between', width: '100%' },
  scoreLabel: { color: '#fff', width: 40, fontWeight: 'bold' },
  smallScoreInput: { backgroundColor: '#222', color: '#fff', width: '35%', textAlign: 'center', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#444' },
  actionBtn: { backgroundColor: THEME.card, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: THEME.gold, alignItems: 'center', width: '100%' },
  actionBtnText: { color: THEME.gold, fontWeight: 'bold' },
  ticketContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', backgroundColor: '#222', borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#444' },
  ticketColumn: { alignItems: 'center', flex: 1 },
  ticketDivider: { width: 1, backgroundColor: '#444', height: '100%' },
  ticketLabel: { color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  ticketNumber: { color: THEME.gold, fontSize: 32, fontWeight: 'bold' },
  ownerName: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  ownerNote: { color: '#aaa', fontSize: 14, fontStyle: 'italic', marginBottom: 15 }
});