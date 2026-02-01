import React, { useState } from 'react';
import { View, Text, TextInput, Button, SafeAreaView, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Alert } from 'react-native';
import { doc, setDoc } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth'; 
import { db } from '../../firebaseConfig'; 
import { THEME } from '../theme';
import BrandHeader from '../components/BrandHeader';
import { styles } from '../styles/CreateScreen.styles';

const generateGameId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const GRID_OPTIONS = [
    { id: 'std', label: 'Standard (100 Squares)', cols: 10, rows: 10, detail: '10x10 Grid • 0-9 Both Axes' },
    { id: 'half', label: 'Half Board (50 Squares)', cols: 10, rows: 5, detail: '10x5 Grid • 0-9 Top • 0-4 Side' },
    { id: 'qtr', label: 'Quick (25 Squares)', cols: 5, rows: 5, detail: '5x5 Grid • 0-4 Both Axes' },
];

export default function CreateScreen({ navigation }) {
  const [name, setName] = useState('');
  const [hostName, setHostName] = useState(''); 
  const [topTeam, setTopTeam] = useState('');
  const [leftTeam, setLeftTeam] = useState('');
  
  const [selectedOption, setSelectedOption] = useState(GRID_OPTIONS[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState('manual');
  
  const [price, setPrice] = useState(''); 
  const [hostCut, setHostCut] = useState(''); 
  const [isPublic, setIsPublic] = useState(true); 

  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !topTeam || !leftTeam) {
      Alert.alert("Missing Info", "Please fill out all fields.");
      return;
    }

    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
        Alert.alert("Error", "You must be signed in (even anonymously) to create a pool.");
        return;
    }

    setLoading(true);

    try {
      const newGameId = generateGameId();
      
      const gameData = {
        id: newGameId,
        name: name,
        hostName: hostName, 
        topTeam: topTeam,
        leftTeam: leftTeam,
        createdAt: new Date(),
        
        adminId: currentUser.uid,        
        pricePerSquare: Number(price) || 0, 
        hostCut: hostCut,                
        isPublic: isPublic,              

        gridCols: selectedOption.cols,
        gridRows: selectedOption.rows,
        assignmentMode: assignmentMode,
        
        topAxis: Array(selectedOption.cols).fill("?"), 
        leftAxis: Array(selectedOption.rows).fill("?"),
        
        scores: { q1: { top: '', left: '' }, q2: { top: '', left: '' }, q3: { top: '', left: '' }, final: { top: '', left: '' } }
      };

      await setDoc(doc(db, "squares_pool", newGameId), gameData);

      setLoading(false);
      navigation.replace('Game', { gameId: newGameId });

    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Could not create pool: " + error.message);
    }
  };

  const ToggleBtn = ({ selected, label, desc, onPress }) => (
    <TouchableOpacity 
        style={[styles.modeBtn, selected && styles.modeBtnActive]} 
        onPress={onPress}
    >
        <Text style={[styles.modeTitle, selected && styles.modeTitleActive]}>{label}</Text>
        <Text style={[styles.modeDesc, selected && styles.modeDescActive]}>{desc}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BrandHeader title="New Pool" />
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* BASIC INFO */}
        <View style={styles.formGroup}>
            <Text style={styles.label}>Pool Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Super Bowl Party" placeholderTextColor="#666" value={name} onChangeText={setName}/>
        </View>

        {/* HOST INFO */}
        <View style={styles.formGroup}>
            <Text style={styles.label}>Host / Organization</Text>
            <TextInput style={styles.input} placeholder="e.g. LBC Silver 12U" placeholderTextColor="#666" value={hostName} onChangeText={setHostName}/>
        </View>

        <View style={styles.row}>
            <View style={[styles.formGroup, {flex: 1, marginRight: 10}]}>
                <Text style={styles.label}>Away (Top)</Text>
                <TextInput style={styles.input} placeholder="e.g. Chiefs" placeholderTextColor="#666" value={topTeam} onChangeText={setTopTeam}/>
            </View>
            <View style={[styles.formGroup, {flex: 1}]}>
                <Text style={styles.label}>Home (Left)</Text>
                <TextInput style={styles.input} placeholder="e.g. Eagles" placeholderTextColor="#666" value={leftTeam} onChangeText={setLeftTeam}/>
            </View>
        </View>

        {/* GRID FORMAT */}
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

        {/* FINANCIALS */}
        <View style={styles.row}>
            <View style={[styles.formGroup, {flex: 1, marginRight: 10}]}>
                <Text style={styles.label}>Price / Square ($)</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="0" 
                    placeholderTextColor="#666" 
                    value={price} 
                    onChangeText={setPrice}
                    keyboardType="numeric"
                />
            </View>
            <View style={[styles.formGroup, {flex: 1}]}>
                <Text style={styles.label}>Host Cut</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="e.g. 50% or $500" 
                    placeholderTextColor="#666" 
                    value={hostCut} 
                    onChangeText={setHostCut}
                />
            </View>
        </View>

        {/* ASSIGNMENT MODE */}
        <View style={styles.formGroup}>
            <Text style={styles.label}>Assignment Mode</Text>
            <View style={styles.modeRow}>
                <ToggleBtn selected={assignmentMode === 'manual'} label="Manual Pick" desc="Click square -> Enter Name" onPress={() => setAssignmentMode('manual')} />
                <View style={{width: 10}}/>
                <ToggleBtn selected={assignmentMode === 'auto'} label="Auto Assign" desc="Add Player -> Random Squares" onPress={() => setAssignmentMode('auto')} />
            </View>
        </View>

        {/* PRIVACY SETTINGS */}
        <View style={styles.formGroup}>
            <Text style={styles.label}>Privacy</Text>
            <View style={styles.modeRow}>
                <ToggleBtn selected={isPublic === true} label="Public" desc="Visible in Search" onPress={() => setIsPublic(true)} />
                <View style={{width: 10}}/>
                <ToggleBtn selected={isPublic === false} label="Private" desc="Invite Link Only" onPress={() => setIsPublic(false)} />
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