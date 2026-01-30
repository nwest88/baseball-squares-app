import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { doc, setDoc } from 'firebase/firestore'; 
import { db } from '../../firebaseConfig'; 
import { THEME } from '../theme';

const generateGameId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const GRID_OPTIONS = [
    { id: 'std', label: 'Standard (100 Squares)', cols: 10, rows: 10, detail: '10x10 Grid • 0-9 Both Axes' },
    { id: 'half', label: 'Half Board (50 Squares)', cols: 10, rows: 5, detail: '10x5 Grid • 0-9 Top • 0-4 Side' },
    { id: 'qtr', label: 'Quick (25 Squares)', cols: 5, rows: 5, detail: '5x5 Grid • 0-4 Both Axes' },
];

export default function CreateScreen({ navigation }) {
  const [name, setName] = useState('');
  const [topTeam, setTopTeam] = useState('');
  const [leftTeam, setLeftTeam] = useState('');
  
  const [selectedOption, setSelectedOption] = useState(GRID_OPTIONS[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // NEW: Assignment Mode State ('manual' or 'auto')
  const [assignmentMode, setAssignmentMode] = useState('manual');

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
        
        // Settings
        gridCols: selectedOption.cols,
        gridRows: selectedOption.rows,
        assignmentMode: assignmentMode, // <--- SAVING THE MODE
        
        topAxis: Array(selectedOption.cols).fill("?"), 
        leftAxis: Array(selectedOption.rows).fill("?"),
        
        scores: { q1: { top: '', left: '' }, q2: { top: '', left: '' }, q3: { top: '', left: '' }, final: { top: '', left: '' } }
      });

      setLoading(false);
      navigation.replace('Game', { gameId: newGameId });

    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Could not create pool: " + error.message);
    }
  };

  // Helper for Mode Buttons
  const ModeBtn = ({ mode, label, desc }) => (
    <TouchableOpacity 
        style={[styles.modeBtn, assignmentMode === mode && styles.modeBtnActive]} 
        onPress={() => setAssignmentMode(mode)}
    >
        <Text style={[styles.modeTitle, assignmentMode === mode && styles.modeTitleActive]}>{label}</Text>
        <Text style={[styles.modeDesc, assignmentMode === mode && styles.modeDescActive]}>{desc}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>New Pool</Text>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Pool Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Super Bowl Party" placeholderTextColor="#666" value={name} onChangeText={setName}/>
        </View>

        <View style={styles.row}>
            <View style={[styles.formGroup, {flex: 1, marginRight: 10}]}>
                <Text style={styles.label}>Top Team</Text>
                <TextInput style={styles.input} placeholder="e.g. Chiefs" placeholderTextColor="#666" value={topTeam} onChangeText={setTopTeam}/>
            </View>
            <View style={[styles.formGroup, {flex: 1}]}>
                <Text style={styles.label}>Left Team</Text>
                <TextInput style={styles.input} placeholder="e.g. Eagles" placeholderTextColor="#666" value={leftTeam} onChangeText={setLeftTeam}/>
            </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Grid Format</Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowDropdown(true)}>
                <View>
                    <Text style={styles.dropdownText}>{selectedOption.label}</Text>
                    <Text style={styles.dropdownDetail}>{selectedOption.detail}</Text>
                </View>
                <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
        </View>

        {/* NEW: Assignment Mode Section */}
        <View style={styles.formGroup}>
            <Text style={styles.label}>Assignment Mode</Text>
            <View style={styles.modeRow}>
                <ModeBtn mode="manual" label="Manual Pick" desc="Click square -> Enter Name" />
                <View style={{width: 10}}/>
                <ModeBtn mode="auto" label="Auto Assign" desc="Add Player -> Random Squares" />
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

        {/* Dropdown Modal */}
        <Modal visible={showDropdown} transparent={true} animationType="fade">
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDropdown(false)}>
                <View style={styles.dropdownList}>
                    <Text style={styles.dropdownHeader}>Select Size</Text>
                    {GRID_OPTIONS.map((option) => (
                        <TouchableOpacity key={option.id} style={styles.optionItem} onPress={() => { setSelectedOption(option); setShowDropdown(false); }}>
                            <Text style={[styles.optionText, selectedOption.id === option.id && styles.optionTextActive]}>{option.label}</Text>
                            <Text style={styles.optionDetail}>{option.detail}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>

      </ScrollView>
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
  dropdownButton: { backgroundColor: THEME.card, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: THEME.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dropdownDetail: { color: '#888', fontSize: 12, marginTop: 2 },
  dropdownArrow: { color: THEME.primary, fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  dropdownList: { backgroundColor: THEME.card, borderRadius: 12, borderWidth: 1, borderColor: THEME.primary, padding: 10 },
  dropdownHeader: { color: THEME.gold, fontWeight: 'bold', padding: 15, textTransform: 'uppercase', fontSize: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  optionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
  optionText: { color: '#fff', fontSize: 16 },
  optionTextActive: { color: THEME.primary, fontWeight: 'bold' },
  optionDetail: { color: '#666', fontSize: 12, marginTop: 2 },

  // NEW STYLES FOR MODE TOGGLE
  modeRow: { flexDirection: 'row' },
  modeBtn: { flex: 1, backgroundColor: THEME.card, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: THEME.border },
  modeBtnActive: { borderColor: THEME.primary, backgroundColor: '#222' },
  modeTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  modeTitleActive: { color: THEME.primary },
  modeDesc: { color: '#666', fontSize: 10 },
  modeDescActive: { color: '#ccc' }
});