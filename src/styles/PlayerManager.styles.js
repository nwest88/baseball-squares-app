import { StyleSheet } from 'react-native';
import { THEME } from '../theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: THEME.border },
  backBtn: { color: THEME.primary, fontSize: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  // STATS DASHBOARD
  statsContainer: { padding: 20, borderBottomWidth: 1, borderColor: '#333' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  statsLabel: { color: '#888', fontWeight: 'bold', fontSize: 12 },
  statsValue: { color: '#fff', fontWeight: 'bold', fontSize: 24 },
  statsSubtext: { color: '#666', fontSize: 12, marginTop: 8, textAlign: 'right' },
  progressBarBg: { height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: THEME.accent },

  // FORM CARDS
  formCard: { margin: 15, padding: 15, backgroundColor: THEME.card, borderRadius: 12, borderWidth: 1, borderColor: THEME.border },
  sectionTitle: { color: '#888', textTransform: 'uppercase', fontSize: 12, marginBottom: 10, fontWeight: 'bold' },
  row: { flexDirection: 'row', marginBottom: 10 },
  input: { backgroundColor: '#222', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#444' },
  addBtn: { backgroundColor: THEME.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  disabledBtn: { backgroundColor: '#444' },

  // ROSTER LIST
  listContainer: { flex: 1, padding: 15 },
  playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.card, padding: 12, marginBottom: 8, borderRadius: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: THEME.gold, fontWeight: 'bold' },
  playerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  playerNote: { color: '#888', fontSize: 12, marginTop: 2 },
  badge: { backgroundColor: THEME.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', backgroundColor: '#1E1E1E', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: THEME.primary },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  modalInput: { backgroundColor: '#333', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#555' }
});