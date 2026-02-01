import { StyleSheet } from 'react-native';
import { THEME } from '../theme';

export const styles = StyleSheet.create({
  // ... (Previous styles same as before) ...
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
  fabShare: { position: 'absolute', top: 130, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: THEME.primary, shadowOpacity: 0.5 },
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
  ownerNote: { color: '#aaa', fontSize: 14, fontStyle: 'italic', marginBottom: 15 },
  
  // NEW STYLE
  inputLabel: { color: '#888', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', fontWeight: 'bold' }
});