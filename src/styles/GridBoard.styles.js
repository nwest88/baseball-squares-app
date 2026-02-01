import { StyleSheet } from 'react-native';
import { THEME } from '../theme';

export const styles = StyleSheet.create({
  container: { flex: 1 }, 
  cornerCell: { justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#333' },
  headerCell: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#222', borderWidth: 1, borderColor: '#444' },
  headerText: { color: THEME.gold, fontWeight: 'bold', fontSize: 16 },
  highlightHeader: { backgroundColor: THEME.highlight, borderColor: THEME.gold },
  highlightHeaderText: { color: THEME.gold },
  cell: { justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: '#333' },
  freeCell: { backgroundColor: THEME.bg },
  takenCell: { backgroundColor: THEME.card },
  highlightCell: { backgroundColor: THEME.highlight },
  winningCell: { backgroundColor: THEME.winnerBg, borderColor: '#fff', borderWidth: 2, zIndex: 10, transform: [{scale: 1.1}] },
  cellText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  winningCellText: { color: '#000', fontWeight: '900', fontSize: 14 }
});