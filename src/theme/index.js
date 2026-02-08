// The Single Source of Truth for Quik Squares
// Strategy: "Hybrid" approach.

export const THEME = {
  // =================================================================
  // 1. LEGACY/FLAT STRUCTURE
  // =================================================================
  primary: '#0f172a',     // Deep Navy Blue
  accent: '#3b82f6',      // Vibrant Blue
  gold: '#eab308',        // Darker Gold
  
  // Backgrounds
  //background: '#f8fafc',  // Light Blue-Grey
  card: '#ffffff',        // Pure White
  overlay: 'rgba(15, 23, 42, 0.75)', // Navy fade

  // Text
  text: '#1e293b',        // Dark Slate
  subtext: '#64748b',     // Muted Blue-Grey
  error: '#ef4444',       // Red

  // Game Logic
  red: '#ef4444',
  green: '#10b981',
  border: '#e2e8f0',
  
  // Layout
  radius: 12,
  padding: 20,
  
  // Grid Specific
  highlight: 'rgba(59, 130, 246, 0.2)',
  winnerBg: '#dcfce7',
  activeTab: '#ffffff',
  sectionHeader: '#64748b', // Added missing key
  
  // Shadows
  shadow: {
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // =================================================================
  // 2. MODERN STRUCTURE
  // =================================================================
  colors: {
    primary: '#0f172a',
    secondary: '#3b82f6', 
    accent: '#0ea5e9',    
    background: '#f8fafc',
    backgroundColor: '#f8fafc',
    card: '#ffffff',
    surface: '#ffffff', 
    input: '#ffffff',  
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      inverse: '#ffffff',
      error: '#ef4444',
      success: '#10b981'
    },
    border: '#e2e8f0',
    success: '#10b981',
    error: '#ef4444',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  shadows: {
    default: { shadowColor: '#64748b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
    small: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }
  }
};

// --- SAFETY EXPORT ---
// This ensures files importing { theme } (lowercase) still work.
export const theme = THEME;