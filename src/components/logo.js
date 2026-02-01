import React from 'react';
import { Image } from 'react-native';
import { THEME } from '../theme';

// Make sure you place your png file in the assets folder!
// If you don't have a transparent PNG yet, just use a placeholder or screenshot for now.
const logoSource = require('../../assets/logo.png'); 

export default function Logo({ width = 40, height = 40, color = THEME.primary }) {
  return (
    <Image 
      source={logoSource}
      style={{
        width: width,
        height: height,
        resizeMode: 'contain',
        // This magic property lets you recolor a transparent PNG!
        // If your PNG has a background (not transparent), remove this line.
        tintColor: color, 
      }}
    />
  );
}