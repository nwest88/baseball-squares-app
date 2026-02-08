import { StyleSheet } from 'react-native';
import { THEME } from '../theme/index';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background, // Grid background often stays white/light for readability
  },
  
  // --- Header Cells ---
  cornerCell: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerCell: {
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  
  // --- Grid Cells ---
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  freeCell: {
    backgroundColor: '#fff',
  },
  takenCell: {
    backgroundColor: '#d1e0e74d', // Keep light blue, or use a very light THEME.primary shade
  },
  cellText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // --- Winner Highlights ---
  highlightHeader: {
    backgroundColor: '#e9f086', 
  },
  highlightHeaderText: {
    color: '#000000', 
    fontWeight: 'bold',
  },
  highlightCell: {
    backgroundColor: '#fffec4', 
  },
  winningCell: {
    backgroundColor: '#e1e428', 
    borderWidth: 2,
    borderColor: '#f3f73c',
  },
  winningCellText: {
    color: THEME.colors.primary,
    fontSize: 18,
  },

  // --- Player Highlight ---
  playerHighlight: {
    borderWidth: 3,
    borderColor: THEME.colors.secondary,
    backgroundColor: THEME.colors.highlight, // Subtle background change to indicate highlight
  }
});