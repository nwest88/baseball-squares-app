import { StyleSheet } from 'react-native';
import { THEME } from '../theme/';

export const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    background: THEME.colors.background,
    backgroundColor: THEME.colors.background, // Or THEME.background/card
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    justifyContent: 'flex-start', // Align content to the left
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
    marginRight: 10,
  },
  brandText: {
    color: THEME.colors.primary, // Using theme color
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});