import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../theme';

const CELL_SIZE = 45; 

export default function GridBoard({ 
  gridData = {},    
  topAxis = [],     
  leftAxis = [],    
  winningLoc = null,
  onSquarePress // <--- NEW PROP: Function to handle clicks
}) {

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    return parts.length > 1 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : name.substring(0, 2).toUpperCase();
  };

  const indices = Array.from({ length: 10 }, (_, i) => i);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 50}}>
        
        <View style={{ flexDirection: 'row' }}>
          
          {/* === LEFT COLUMN === */}
          <View style={{ width: CELL_SIZE }}>
            <View style={styles.cornerCell}>
               <Text style={{color: '#444', fontSize: 10}}>Q/S</Text>
            </View>
            {indices.map((r) => {
              const num = leftAxis[r] !== undefined ? leftAxis[r] : '?';
              const isWinningRow = winningLoc && winningLoc.row === r;
              return (
                <View key={`left-${r}`} style={[styles.headerCell, isWinningRow && styles.highlightHeader]}>
                  <Text style={[styles.headerText, isWinningRow && styles.highlightHeaderText]}>{num}</Text>
                </View>
              );
            })}
          </View>

          {/* === RIGHT AREA === */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              {/* TOP HEADER */}
              <View style={{ flexDirection: 'row' }}>
                {indices.map((i) => {
                   const num = topAxis[i] !== undefined ? topAxis[i] : '?';
                   const isWinningCol = winningLoc && winningLoc.col === i;
                   return (
                    <View key={`top-${i}`} style={[styles.headerCell, isWinningCol && styles.highlightHeader]}>
                      <Text style={[styles.headerText, isWinningCol && styles.highlightHeaderText]}>{num}</Text>
                    </View>
                   );
                })}
              </View>

              {/* GRID ROWS */}
              {indices.map((r) => (
                <View key={`row-${r}`} style={{ flexDirection: 'row' }}>
                  {indices.map((c) => {
                    const key = `${r}-${c}`;
                    const owner = gridData[key];
                    const initials = getInitials(owner);
                    const isWinningRow = winningLoc && winningLoc.row === r;
                    const isWinningCol = winningLoc && winningLoc.col === c;
                    const isWinner = isWinningRow && isWinningCol;

                    // NEW: Helper to fire the press event
                    const handlePress = () => {
                        if (onSquarePress) {
                            onSquarePress({ row: r, col: c, owner: owner || null });
                        }
                    };

                    return (
                      <TouchableOpacity 
                        key={key} 
                        activeOpacity={0.7}
                        onPress={handlePress} // <--- ACTION
                        style={[
                          styles.cell,
                          owner ? styles.takenCell : styles.freeCell,
                          (isWinningRow || isWinningCol) && styles.highlightCell,
                          isWinner && styles.winningCell
                        ]}
                      >
                        <Text style={[styles.cellText, isWinner && styles.winningCellText]}>
                          {initials}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

// Styles remain exactly the same as before
const styles = StyleSheet.create({
  container: { flex: 1 }, 
  cornerCell: { width: CELL_SIZE, height: CELL_SIZE, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#333' },
  headerCell: { width: CELL_SIZE, height: CELL_SIZE, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222', borderWidth: 1, borderColor: '#444' },
  headerText: { color: THEME.gold, fontWeight: 'bold', fontSize: 16 },
  highlightHeader: { backgroundColor: THEME.highlight, borderColor: THEME.gold },
  highlightHeaderText: { color: THEME.gold },
  cell: { width: CELL_SIZE, height: CELL_SIZE, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: '#333' },
  freeCell: { backgroundColor: THEME.bg },
  takenCell: { backgroundColor: THEME.card },
  highlightCell: { backgroundColor: THEME.highlight },
  winningCell: { backgroundColor: THEME.winnerBg, borderColor: '#fff', borderWidth: 2, zIndex: 10, transform: [{scale: 1.1}] },
  cellText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  winningCellText: { color: '#000', fontWeight: '900', fontSize: 14 },
  // Detail Modal Styles
  detailCard: {
      width: 300,
      backgroundColor: THEME.card,
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: THEME.primary,
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 5
  },
  detailTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: THEME.text,
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#333',
      width: '100%',
      textAlign: 'center',
      paddingBottom: 10
  },
  detailRow: {
      marginBottom: 15,
      alignItems: 'center'
  },
  detailLabel: {
      color: '#888',
      fontSize: 14,
      textTransform: 'uppercase',
      marginBottom: 4
  },
  detailValue: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold'
  }
});