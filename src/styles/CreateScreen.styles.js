import { StyleSheet } from 'react-native';
import { THEME } from '../theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  content: { padding: 20 },
  header: { fontSize: 32, fontWeight: 'bold', color: THEME.text, marginBottom: 20 },
  formGroup: { marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: THEME.gold, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', fontSize: 12 },
  input: { backgroundColor: THEME.card, color: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: THEME.border, fontSize: 16 },
  spacer: { height: 10 },
  
  // BUTTONS
  createBtn: { backgroundColor: THEME.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  
  // DROPDOWN
  dropdownButton: { backgroundColor: THEME.card, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: THEME.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dropdownDetail: { color: '#888', fontSize: 12, marginTop: 2 },
  dropdownArrow: { color: THEME.primary, fontSize: 18 },
  
  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  dropdownList: { backgroundColor: THEME.card, borderRadius: 12, borderWidth: 1, borderColor: THEME.primary, padding: 10 },
  dropdownHeader: { color: THEME.gold, fontWeight: 'bold', padding: 15, textTransform: 'uppercase', fontSize: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  optionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
  optionText: { color: '#fff', fontSize: 16 },
  optionTextActive: { color: THEME.primary, fontWeight: 'bold' },
  optionDetail: { color: '#666', fontSize: 12, marginTop: 2 },
  
  // TOGGLE BUTTONS
  modeRow: { flexDirection: 'row' },
  modeBtn: { flex: 1, backgroundColor: THEME.card, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: THEME.border },
  modeBtnActive: { borderColor: THEME.primary, backgroundColor: '#222' },
  modeTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  modeTitleActive: { color: THEME.primary },
  modeDesc: { color: '#666', fontSize: 10 },
  modeDescActive: { color: '#ccc' }
});