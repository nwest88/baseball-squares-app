import { StyleSheet } from 'react-native';
import { THEME } from '../theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  
  // SECTIONS
  sectionHeader: { 
    color: THEME.gold, 
    fontSize: 12, 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    marginTop: 20, 
    marginBottom: 8, 
    marginLeft: 5,
    letterSpacing: 1.5,
    opacity: 0.8
  },
  
  // EMPTY STATES
  emptyContainer: {
    backgroundColor: 'rgba(30,30,30,0.5)',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 10
  },
  emptyText: { color: '#888', fontSize: 14, marginBottom: 5 },
  createLink: { color: THEME.primary, fontWeight: 'bold', fontSize: 14 },

  // FAB
  fab: {
    position: 'absolute', bottom: 30, right: 20, width: 60, height: 60,
    borderRadius: 30, backgroundColor: THEME.primary, justifyContent: 'center',
    alignItems: 'center', elevation: 10, shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 5, zIndex: 100,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: -3 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});