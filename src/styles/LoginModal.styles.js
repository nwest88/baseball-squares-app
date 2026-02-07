import { StyleSheet, Dimensions, Platform } from 'react-native';
import { THEME } from '../theme/index';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // The dark transparent background
  overlay: {
    flex: 1,
    backgroundColor: THEME.overlay, // 'rgba(15, 23, 42, 0.75)'
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // The actual modal card
  container: {
    width: width * 0.9,
    maxWidth: 400, // Don't get too wide on tablets
    backgroundColor: THEME.card,
    borderRadius: THEME.radius,
    padding: THEME.padding,
    
    // Shadows
    shadowColor: THEME.shadow.shadowColor,
    shadowOffset: THEME.shadow.shadowOffset,
    shadowOpacity: THEME.shadow.shadowOpacity,
    shadowRadius: THEME.shadow.shadowRadius,
    elevation: THEME.shadow.elevation,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.primary, // Navy
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.subtext,
  },
  
  // Form
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: THEME.text,
  },
  
  // Buttons
  mainButton: {
    backgroundColor: THEME.accent, // Vibrant Blue
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  mainButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Footer / Toggle
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  footerText: {
    color: THEME.subtext,
    fontSize: 14,
  },
  linkText: {
    color: THEME.accent,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  
  // Close Button
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
    zIndex: 10,
  },
  closeText: {
    fontSize: 24,
    color: THEME.subtext,
    lineHeight: 24,
  }
});