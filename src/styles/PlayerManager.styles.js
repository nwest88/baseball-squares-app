import { StyleSheet } from 'react-native';
import { THEME } from '../theme/index';

export const styles = StyleSheet.create({
  // --- Stats Section ---
  statsContainer: {
    padding: 15,
    backgroundColor: THEME.card, // Was #111
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statsLabel: {
    color: '#888', // Consider adding a subtext color to theme if not present
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statsValue: {
    color: THEME.text, // Was #fff
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: THEME.colors.primary, 
    borderRadius: 3,
    marginTop: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.colors.secondary,
    borderRadius: 3,
  },

  // --- Form / Add Player Section ---
  formCard: {
    backgroundColor: THEME.colors.cardLight, // Slightly lighter than card background
    padding: 15,
    margin: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: THEME.colors.input, // Consider adding an input background color to theme
    color: THEME.colors.text,
    padding: 12,
    borderRadius: 5,
    fontSize: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  addBtn: {
    backgroundColor: THEME.colors.primary,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  addBtnText: {
    color: '#fff', // Button text usually stays white
    fontWeight: 'bold',
    fontSize: 16,
  },

  // --- Player List Items ---
  playerRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.card, // Keep player rows consistent with card background
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  avatarText: {
    color: THEME.colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  playerName: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: THEME.colors.cardLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 5,
  },
  badgeText: {
    color: THEME.colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerNote: {
    color: THEME.colors.text,
    fontSize: 12,
    fontStyle: 'italic',
  },

  // --- Modals ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1a1a1a', // Modal bg
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'THEME.border',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    color: THEME.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#333',
    color: THEME.text,
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    width: '100%',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
});