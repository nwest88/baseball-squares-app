import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../theme'; // <--- Import Theme

// Dummy Data Default (In case props aren't passed yet)
const DUMMY_DATA = {
  title: "Super Bowl LVIII",
  host: "LBC Silver 12U",
  teamA: "SF",
  teamB: "KC",
  squaresSold: 12,
  totalSquares: 100,
  costPerSquare: 20,
  totalPot: 2000,
  payouts: { q1: 250, q2: 500, q3: 250, final: 1000 }
};

export default function GamePoolCard({ data = DUMMY_DATA }) {
  return (
    <View style={styles.cardContainer}>
      
      {/* 1. HEADER SECTION */}
      <View style={styles.header}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.subtitle}>{data.host}</Text>
        <View style={styles.divider} />
      </View>

      {/* 2. MATCHUP SECTION (Row 1) */}
      <View style={styles.matchupRow}>
        <Text style={styles.teamText}>{data.teamA}</Text>
        <Text style={styles.atText}>AT</Text>
        <Text style={styles.teamText}>{data.teamB}</Text>
      </View>

      {/* 3. STATUS & COST SECTION (Row 2) */}
      <View style={styles.statsRow}>
        {/* Column 1: Progress */}
        <View style={styles.statCol}>
          <Text style={styles.statValue}>{data.squaresSold}/{data.totalSquares}</Text>
          <Text style={styles.statLabel}>SOLD</Text>
        </View>
        
        <View style={styles.verticalDivider} />

        {/* Column 2: Cost */}
        <View style={styles.statCol}>
          <Text style={styles.statValue}>${data.costPerSquare}</Text>
          <Text style={styles.statLabel}>PER SQ</Text>
        </View>

        <View style={styles.verticalDivider} />

        {/* Column 3: Pot */}
        <View style={styles.statCol}>
          <Text style={[styles.statValue, {color: THEME.gold}]}>${data.totalPot}</Text>
          <Text style={styles.statLabel}>TOTAL POT</Text>
        </View>
      </View>

      {/* 4. PAYOUT DETAILS (Row 3 - Footer) */}
      <View style={styles.payoutRow}>
        <View style={styles.payoutCol}>
          <Text style={styles.payoutLabel}>QTR 1</Text>
          <Text style={styles.payoutValue}>${data.payouts.q1}</Text>
        </View>
        <View style={styles.payoutCol}>
          <Text style={styles.payoutLabel}>HALF</Text>
          <Text style={styles.payoutValue}>${data.payouts.q2}</Text>
        </View>
        <View style={styles.payoutCol}>
          <Text style={styles.payoutLabel}>QTR 3</Text>
          <Text style={styles.payoutValue}>${data.payouts.q3}</Text>
        </View>
        <View style={styles.payoutCol}>
          <Text style={styles.payoutLabel}>FINAL</Text>
          <Text style={[styles.payoutValue, {color: THEME.gold}]}>${data.payouts.final}</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  // 1. MAIN CONTAINER
  cardContainer: {
    backgroundColor: THEME.card, // Dark Grey
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 2, 
    
    // Shadow / Elevation (Subtle depth)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, // Darker shadow for dark mode
    shadowRadius: 6,
    elevation: 4, 
    
    // Border
    borderWidth: 1,
    borderColor: THEME.border, // Subtle dark border
  },

  // 2. HEADER
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.text, // White
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.primary, // Gold for the Host Name
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    width: '40%', 
    backgroundColor: THEME.border,
    marginTop: 12,
  },

  // 3. MATCHUP
  matchupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline', 
    marginBottom: 20,
  },
  teamText: {
    fontSize: 32,
    fontWeight: '900',
    color: THEME.text, // White
  },
  atText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.subtext, // Grey
    marginHorizontal: 12,
  },

  // 4. STATS ROW (3 Columns)
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252525', // Slightly lighter/darker than card for contrast
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    height: '60%',
    backgroundColor: THEME.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text, // White
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.subtext, // Grey
    textTransform: 'uppercase',
  },

  // 5. PAYOUT FOOTER
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  payoutCol: {
    flex: 1,
    alignItems: 'center',
  },
  payoutLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.subtext, // Grey
    marginBottom: 2,
  },
  payoutValue: {
    fontSize: 12,
    fontWeight: '500',
    color: THEME.text, // White
  },
});