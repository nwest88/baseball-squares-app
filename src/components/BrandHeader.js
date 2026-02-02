import React from 'react';
import { View, Text } from 'react-native';
import { THEME } from '../theme';
import Logo from './logo';
import { styles } from '../styles/BrandHeader.styles'; // <--- Import the shared fixed styles

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