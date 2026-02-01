import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Alert } from 'react-native';
import { doc, setDoc } from 'firebase/firestore'; 
import { db } from '../../firebaseConfig'; 
import { THEME } from '../theme';
import { styles } from '../styles/CreateScreen.styles';
import BrandHeader from '../components/BrandHeader';

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
  
  // Assignment Mode State ('manual' or 'auto')
  const [assignmentMode, setAssignmentMode] = useState('manual');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !topTeam || !leftTeam) {
      Alert.alert("Missing Info", "Please fill out all fields.");
      return;
    }

    setLoading(true);

    try {
      const newGameId = generateGameId();
      
      const gameData = {
        id: newGameId,
        name: name,
        topTeam: topTeam,
        leftTeam: leftTeam,
        createdAt: new Date(),
        
        // Grid Settings
        gridCols: selectedOption.cols,
        gridRows: selectedOption.rows,
        assignmentMode: assignmentMode,
        
        // Arrays
        topAxis: Array(selectedOption.cols).fill("?"), 
        leftAxis: Array(selectedOption.rows).fill("?"),
        
        // Scores
        scores: { q1: { top: '', left: '' }, q2: { top: '', left: '' }, q3: { top: '', left: '' }, final: { top: '', left: '' } }
      };

      await setDoc(doc(db, "squares_pool", newGameId), gameData);

      setLoading(false);
      navigation.navigate('Game', { gameId: newGameId });

    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Could not create pool: " + error.message);
    }
  };

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
    <BrandHeader title="Create Contest" /> 
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>New Contest</Text>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Contest Name</Text>
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