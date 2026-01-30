import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../theme';

export default function GridBoard({ 
  gridData = {},    
  topAxis = [],     
  leftAxis = [],    
  winningLoc = null,
  onSquarePress 
}) {

  // DYNAMIC SIZE LOGIC:
  // If axis has 5 items, use big squares. If 10, use standard.
  const gridSize = topAxis.length || 10;
  const CELL_SIZE = gridSize === 5 ? 65 : 45; // Bigger squares for 5x5 games!

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    return parts.length > 1 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : name.substring(0, 2).toUpperCase();
  };

  // Create array [0, 1, 2... n] based on grid size
  const indices = Array.from({ length: gridSize }, (_, i) => i);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 50}}>
        
        <View style={{ flexDirection: 'row' }}>
          
          {/* === LEFT COLUMN === */}
          <View style={{ width: CELL_SIZE }}>
            <View style={[styles.cornerCell, {width: CELL_SIZE, height: CELL_SIZE}]}>
               <Text style={{color: '#444', fontSize: 10}}>Q/S</Text>
            </View>
            {indices.map((r) => {
              const num = leftAxis[r] !== undefined ? leftAxis[r] : '?';
              const isWinningRow = winningLoc && winningLoc.row === r;
              return (
                <View key={`left-${r}`} style={[styles.headerCell, {width: CELL_SIZE, height: CELL_SIZE}, isWinningRow && styles.highlightHeader]}>
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
                    <View key={`top-${i}`} style={[styles.headerCell, {width: CELL_SIZE, height: CELL_SIZE}, isWinningCol && styles.highlightHeader]}>
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

                    return (
                      <TouchableOpacity 
                        key={key} 
                        activeOpacity={0.7}
                        onPress={() => onSquarePress && onSquarePress({ row: r, col: c, owner: owner || null })}
                        style={[
                          styles.cell,
                          {width: CELL_SIZE, height: CELL_SIZE}, // Dynamic Size
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

const styles = StyleSheet.create({
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