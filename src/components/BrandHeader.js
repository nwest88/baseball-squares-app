import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native'; // Added StyleSheet
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/BrandHeader.styles';
import { THEME } from '../theme'; // Import THEME for the title color

export default function BrandHeader({ title }) { // Accept title prop
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer}>
      {/* Left Side: Title (if provided) */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {title && (
          <Text style={localStyles.screenTitle}>{title}</Text>
        )}
      </View>

      {/* Right Side: Brand Logo & Name */}
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.logoContainer}>
        <Text style={styles.brandText}>QuikSquares</Text>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  screenTitle: {
    color: THEME.primary, // Or THEME.text / THEME.primary depending on preference
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  }
});