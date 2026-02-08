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
    backgroundColor: '#e6f7ff', // Keep light blue, or use a very light THEME.primary shade
  },
  cellText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // --- Winner Highlights ---
  highlightHeader: {
    backgroundColor: '#ffecb3', 
  },
  highlightHeaderText: {
    color: '#d32f2f', 
    fontWeight: 'bold',
  },
  highlightCell: {
    backgroundColor: '#fff9c4', 
  },
  winningCell: {
    backgroundColor: '#ffeb3b', 
    borderWidth: 2,
    borderColor: '#fbc02d',
  },
  winningCellText: {
    color: '#d32f2f',
    fontSize: 18,
  },

  // --- Player Highlight ---
  playerHighlight: {
    borderWidth: 3,
    borderColor: THEME.gold,
    backgroundColor: 'rgba(255, 215, 0, 0.4)',
  }
});