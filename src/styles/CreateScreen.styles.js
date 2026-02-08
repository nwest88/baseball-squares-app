import { StyleSheet, Platform, StatusBar } from 'react-native';
import { THEME } from '../theme/index';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0},
  content: { padding: 20 },
  header: { fontSize: 32, fontWeight: 'bold', color: THEME.colors.text, marginBottom: 20 },
  formGroup: { marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: THEME.colors.gold, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', fontSize: 12 },
  input: { backgroundColor: THEME.colors.card, color: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: THEME.colors.border, fontSize: 16 },
  spacer: { height: 10 },
  
  // BUTTONS
  createBtn: { backgroundColor: THEME.colors.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  
  // DROPDOWN
  dropdownButton: { backgroundColor: THEME.colors.card, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: THEME.colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dropdownDetail: { color: '#888', fontSize: 12, marginTop: 2 },
  dropdownArrow: { color: THEME.colors.primary, fontSize: 18 },
  
  // MODAL
  modalOverlay: { flex: 1, backgroundColor: THEME.colors.overlay, justifyContent: 'center', padding: 20 },
  dropdownList: { backgroundColor: THEME.colors.card, borderRadius: 12, borderWidth: 1, borderColor: THEME.colors.primary, padding: 10 },
  dropdownHeader: { color: THEME.colors.gold, fontWeight: 'bold', padding: 15, textTransform: 'uppercase', fontSize: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  optionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
  optionText: { color: THEME.colors.text, fontSize: 16 },
  optionTextActive: { color: THEME.colors.primary, fontWeight: 'bold' },
  optionDetail: { color: '#666', fontSize: 12, marginTop: 2 },
  
  // TOGGLE BUTTONS
  modeRow: { flexDirection: 'row' },
  modeBtn: { flex: 1, backgroundColor: THEME.colors.card, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: THEME.colors.border },
  modeBtnActive: { borderColor: THEME.colors.primary, backgroundColor: '#222' },
  modeTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  modeTitleActive: { color: THEME.colors.primary },
  modeDesc: { color: '#666', fontSize: 10 },
  modeDescActive: { color: '#ccc' }
});