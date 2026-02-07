import { StyleSheet } from 'react-native';
import { THEME } from '../theme/index';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  content: {
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: THEME.radius,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: THEME.shadow.shadowColor,
    shadowOffset: THEME.shadow.shadowOffset,
    shadowOpacity: THEME.shadow.shadowOpacity,
    shadowRadius: THEME.shadow.shadowRadius,
    elevation: THEME.shadow.elevation,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.subtext,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  email: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 5,
  },
  uid: {
    fontSize: 12,
    color: THEME.subtext,
    fontFamily: 'monospace',
  },
  text: {
    color: THEME.text,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.error,
    marginTop: 20,
  },
  logoutText: {
    color: THEME.error,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  actionText: {
    fontSize: 16,
    color: THEME.text,
  },
  arrow: {
    fontSize: 16,
    color: THEME.subtext,
  }
});