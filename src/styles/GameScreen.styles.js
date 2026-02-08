import { StyleSheet, Platform } from 'react-native';
import { THEME } from '../theme/index';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  
  // --- Scoreboard ---
  scoreboard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: THEME.colors.background, 
    borderBottomWidth: 1,
    borderColor: THEME.colors.border,
    height: 80, 
  },
  teamBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    letterSpacing: 1,
  },
  bigScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME.text,
    includeFontPadding: false,
  },
  vsText: {
    color: '#666',
    fontSize: 20,
    marginHorizontal: 15,
    marginTop: 10,
  },

  // --- Tabs (Refined for equal width) ---
  tabBar: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.background,
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: 'space-between', // Changed from center to space-between
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  qTab: {
    flex: 1, // Make them expand equally
    paddingVertical: 8, // Increased padding
    borderRadius: 8, // Changed from 20 for a more tab-like feel (optional, but looks better wide)
    marginHorizontal: 2, // Reduced margin
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center', // Center text
    justifyContent: 'center',
  },
  qTabActive: {
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.border,
  },
  qTabText: {
    color: THEME.colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 12, // Base size
    textAlign: 'center',
  },
  qTabScoreText: { // New style for the score subtitle
    color: THEME.colors.text.secondary,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  qTabTextActive: {
    color: THEME.colors.text, 
    fontWeight: 'bold',
  },
  qTabScoreTextActive: { // Active score text
    color: THEME.colors.text,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },

  // --- Board Layout ---
  centeredView: {
    flex: 1,
    alignItems: 'center', 
    backgroundColor: THEME.colors.background,
  },
  boardConstrainer: {
    flex: 1,
    width: '100%',
    maxWidth: 500, 
    paddingBottom: 20, 
  },
  
  // -- NEW: Explicit Header Labels --
  // Top Label: Looks good, keeping as is
  topTeamLabel: {
    fontWeight: 'bold',
    fontSize: 14, 
    marginBottom: 5,
    textAlign: 'center',
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.2)', 
    borderRadius: 4,
    alignSelf: 'center', 
    paddingHorizontal: 100, 
    maxWidth: '90%', 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Left Label Container
  leftLabelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40, 
    marginRight: 5, 
    zIndex: 10, 
    overflow: 'visible', 
  },
  
  // Left Team Label
  teamLabelLeft: {
    fontWeight: 'bold',
    fontSize: 14, 
    textAlign: 'center',
    transform: [{ rotate: '-90deg' }],
    width: 180, 
    position: 'absolute', 
    left: -70, 
    backgroundColor: 'rgba(0,0,0,0.2)', 
    borderRadius: 4,
    paddingVertical: 5, 
    paddingHorizontal: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  // --- Modal / Details Card ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: THEME.colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: THEME.shadows.default,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  
  // Ticket / Square Info
  ticketContainer: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0', // Ticket color
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  ticketColumn: {
    flex: 1,
    alignItems: 'center',
  },
  ticketDivider: {
    width: 1,
    backgroundColor: '#999',
    marginHorizontal: 10,
  },
  ticketLabel: {
    color: '#555',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  ticketNumber: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  ownerName: {
    color: THEME.colors.secondary,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  ownerNote: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  modalInput: {
    backgroundColor: THEME.colors.card,
    color: THEME.colors.text,
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    fontSize: 16,
  },
  
  // Admin Section Headers
  sectionHeader: {
    color: THEME.colors.secondary, // Section headers pop
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    paddingBottom: 5,
  },
  inputLabel: {
    color: THEME.colors.primary,
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  scoreLabel: {
    color: THEME.colors.text,
    width: 60,
    fontWeight: 'bold',
  },
  smallScoreInput: {
    backgroundColor: '#5c5959',
    color: '#fff',
    width: 60,
    padding: 8,
    borderRadius: 4,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  actionBtn: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  actionBtnText: {
    color: THEME.text,
    fontWeight: 'bold',
  },
  
  // FABs
  fabRight: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.secondary, // Assuming secondary is a good action color
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabAbove: {
    position: 'absolute',
    bottom: 90, // Positioned above the share FAB
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});