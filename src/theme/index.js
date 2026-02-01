// src/theme.js

export const THEME = {
  // --- 1. BRAND PALETTE ---
  primary: '#29ff49',     // "Electric Blue" (Brand Identity)
  accent: '#00C853',      // "Money Green" (Action buttons, Success)
  gold: '#FFD700',        // Axis numbers / Quarter Tabs

// --- 2. BACKGROUNDS ---
  bg: '#121212',      // The main app background (Deepest Black)
  card: '#1E1E1E',    // Cards/Modals (Slightly lighter for depth)
  overlay: 'rgba(0,0,0,0.85)', // The dark fade behind modals

  // --- 3. TEXT COLORS ---
  text: '#FFFFFF',    // Main Headings
  subtext: '#A0A0A0', // Secondary info (Notes, subtitles)
  gold: '#FFD700',    // Specific "Winning" text color
  error: '#FF4444',   // Error messages

  // --- 4. GAME COLORS ---
  red: '#E63946',     // Team A (e.g. Chiefs)
  green: '#2A9D8F',   // Team B (e.g. Eagles)
  border: '#333333',  // Grid lines and dividers
  
  // --- 5. SPACING & LAYOUT ---
  radius: 12,         // Consistency for rounded corners
  padding: 20,        // Standard screen padding
  
  // Grid Logic Colors
  highlight: 'rgba(255, 215, 0, 0.15)', // The crosshair highlight
  winnerBg: '#00E676',    // The bright winning square background
  activeTab: '#333333'
};