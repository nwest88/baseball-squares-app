import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { THEME } from '../theme';
import Logo from './logo';

export default function BrandHeader({ title }) {
  return (
    <View style={styles.headerContainer}>
      {/* Use the Logo Component */}
      <View style={styles.logoWrapper}>
        <Logo width={35} height={35} color={THEME.primary} />
      </View>
      
      <View style={styles.logoTextContainer}>
        <Text style={styles.logoTextMain}>QUIK SQUARES</Text>
        <Text style={styles.logoTextSub}>Pool</Text>
      </View>

      {/* Screen Title Divider */}
      {title && <View style={styles.divider} />}
      {title && <Text style={styles.screenTitle}>{title}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: THEME.bg,
    borderBottomWidth: 1,
    borderColor: THEME.border,
  },
  logoWrapper: {
    marginRight: 10,
    // Optional: Add a shadow/glow to the logo
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  logoTextContainer: {
    flexDirection: 'column',
  },
  logoTextMain: {
    color: THEME.primary,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
    lineHeight: 16,
  },
  logoTextSub: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#333',
    marginHorizontal: 15,
  },
  screenTitle: {
    color: THEME.subtext,
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});