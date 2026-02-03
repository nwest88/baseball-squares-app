import { StyleSheet, Platform } from 'react-native';
import { THEME } from '../theme';

export const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: THEME.bg,
    borderBottomWidth: 1,
    borderColor: THEME.border,
    // --- FIX: Fixed Height creates consistency across Web & Mobile ---
    height: 70, 
    width: '100%',
  },
  logoWrapper: {
    marginRight: 10,
    // FIX: Use Platform.select to handle Web vs Native shadows
    ...Platform.select({
      web: {
        boxShadow: `0px 0px 10px ${THEME.primary}`, // CSS style shadow for Web
      },
      default: {
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
    }),
  },
  logoTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
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