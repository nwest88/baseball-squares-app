import { StyleSheet } from 'react-native';
import { THEME } from '../theme/index';

export default StyleSheet.create({
  // 1. MAIN CONTAINER
  cardContainer: {
    backgroundColor: THEME.card, // Now White in Moyer Theme
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 2,
    
    // Shadow / Elevation
    shadowColor: THEME.shadow.shadowColor,
    shadowOffset: THEME.shadow.shadowOffset,
    shadowOpacity: THEME.shadow.shadowOpacity,
    shadowRadius: THEME.shadow.shadowRadius,
    elevation: THEME.shadow.elevation,
    
    // Border
    borderWidth: 1,
    borderColor: THEME.border,
  },

  // 2. HEADER
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.text, // Navy/Slate
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.subtext, // Using subtext for cleaner look, or use THEME.gold if preferred
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    width: '40%',
    backgroundColor: THEME.card,
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
    color: THEME.text,
  },
  atText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.subtext,
    marginHorizontal: 12,
  },

  // 4. STATS ROW
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.background, // Using Theme Background (Light Grey) instead of hardcoded #252525
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: THEME.border,
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
    color: THEME.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.subtext,
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
    color: THEME.subtext,
    marginBottom: 2,
  },
  payoutValue: {
    fontSize: 12,
    fontWeight: '500',
    color: THEME.text,
  },
  
  // Helper for Gold Text (replaces inline styles)
  textGold: {
    color: THEME.gold,
  }
});