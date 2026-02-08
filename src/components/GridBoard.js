import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from '../styles/GridBoard.styles';
import { THEME } from '../theme';

export default function GridBoard({ 
  gridData = {},    
  topAxis = [],     
  leftAxis = [],    
  winningLoc = null,
  highlightedPlayers = [], 
  onSquarePress,
  isWide = false 
}) {

  // Dynamic sizing logic
  const colCount = topAxis.length || 10;
  const rowCount = leftAxis.length || 10;

  let baseSize = 45;
  if (isWide) baseSize = 65;
  if (colCount <= 5) baseSize = 65; 
  
  const CELL_SIZE = baseSize;

  const getInitials = (ownerData) => {
    if (!ownerData) return "";
    const name = (typeof ownerData === 'object' && ownerData !== null) 
                 ? ownerData.name 
                 : ownerData;

    if (!name) return "";
    
    const parts = name.trim().split(" ");
    return parts.length > 1 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : name.substring(0, 2).toUpperCase();
  };

  const colIndices = Array.from({ length: colCount }, (_, i) => i);
  const rowIndices = Array.from({ length: rowCount }, (_, i) => i);

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{paddingBottom: 50}}
        bounces={false} 
        overScrollMode="never"
      >
        <View style={{ flexDirection: 'row' }}>
          
          {/* === LEFT COLUMN (Y-Axis) === */}
          <View style={{ width: CELL_SIZE }}>
            <View style={[styles.cornerCell, {width: CELL_SIZE, height: CELL_SIZE}]}>
               <Text style={{color: '#444', fontSize: 10}}>Q/S</Text>
            </View>
            {rowIndices.map((r) => {
              const num = leftAxis[r] !== undefined ? leftAxis[r] : '?';
              const isWinningRow = winningLoc && winningLoc.row === r;
              return (
                <View key={`left-${r}`} style={[styles.headerCell, {width: CELL_SIZE, height: CELL_SIZE}, isWinningRow && styles.highlightHeader]}>
                  <Text style={[styles.headerText, isWinningRow && styles.highlightHeaderText]}>{num}</Text>
                </View>
              );
            })}
          </View>

          {/* === RIGHT AREA (X-Axis + Grid) === */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
          >
            <View>
              {/* TOP HEADER */}
              <View style={{ flexDirection: 'row' }}>
                {colIndices.map((i) => {
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
              {rowIndices.map((r) => (
                <View key={`row-${r}`} style={{ flexDirection: 'row' }}>
                  {colIndices.map((c) => {
                    const key = `${r}-${c}`;
                    const owner = gridData[key];
                    const initials = getInitials(owner);
                    
                    // --- HIGHLIGHT LOGIC ---
                    const ownerName = owner ? (typeof owner === 'object' ? owner.name : owner) : null;
                    const isHighlighted = highlightedPlayers && highlightedPlayers.includes(ownerName);

                    // Winner Logic
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
                          {width: CELL_SIZE, height: CELL_SIZE},
                          owner ? styles.takenCell : styles.freeCell,
                          isHighlighted && styles.playerHighlight,
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