import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/GamePoolCard.styles'; // <--- Named Import

// Dummy Data Default
const DUMMY_DATA = {
  title: "Super Bowl LVIII",
  host: "LBC Silver 12U",
  teamA: "SF",
  teamB: "KC",
  squaresSold: 12,
  totalSquares: 100,
  costPerSquare: 25,
  totalPot: 2000,
  payouts: { q1: 150, q2: 150, q3: 150, final: 250 }
};

export default function GamePoolCard({ data = DUMMY_DATA }) {
  // Safety check for payouts object
  const payouts = data.payouts || { q1: 0, q2: 0, q3: 0, final: 0 };

  return (
    <View style={styles.cardContainer}>
      
      {/* 1. HEADER SECTION */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>{data.title}</Text>
        <Text style={styles.subtitle}>{data.host}</Text>
        <View style={styles.divider} />
      </View>

      {/* 2. MATCHUP SECTION */}
      <View style={styles.matchupRow}>
        <Text style={styles.teamText}>{data.teamA}</Text>
        <Text style={styles.atText}>AT</Text>
        <Text style={styles.teamText}>{data.teamB}</Text>
      </View>

      {/* 3. STATUS & COST SECTION */}
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
          <Text style={[styles.statValue, styles.textGold]}>${data.totalPot}</Text>
          <Text style={styles.statLabel}>WINNABLE</Text>
        </View>
      </View>

      {/* 4. PAYOUT DETAILS (New) */}
      <View style={styles.payoutRow}>
        <View style={styles.payoutCol}>
          <Text style={styles.payoutLabel}>Q1</Text>
          <Text style={styles.payoutValue}>${payouts.q1}</Text>
        </View>
        <View style={styles.payoutCol}>
          <Text style={styles.payoutLabel}>HALF</Text>
          <Text style={styles.payoutValue}>${payouts.q2}</Text>
        </View>
        <View style={styles.payoutCol}>
          <Text style={styles.payoutLabel}>Q3</Text>
          <Text style={styles.payoutValue}>${payouts.q3}</Text>
        </View>
        <View style={styles.payoutCol}>
          <Text style={styles.payoutLabel}>FINAL</Text>
          <Text style={[styles.payoutValue, styles.textGold]}>${payouts.final}</Text>
        </View>
      </View>

    </View>
  );
}