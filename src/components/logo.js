import React from 'react';
import { Image } from 'react-native';
import { THEME } from '../theme';

const logoSource = require('../../assets/logo.png'); 

export default function Logo({ width = 40, height = 40, color = THEME.primary }) {
  return (
    <Image 
      source={logoSource}
      resizeMode="contain" 
      tintColor={color}
      style={{
        width: width,
        height: height
      }}
    />
  );
}