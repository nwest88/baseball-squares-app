import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { loginUser, registerUser } from '../services/AuthService';
import { styles } from '../styles/LoginModal.styles';

// We pass props for visibility to keep it flexible
const LoginModal = ({ visible, onClose }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    let result;

    if (isRegistering) {
      result = await registerUser(email, password);
    } else {
      result = await loginUser(email, password);
    }

    setLoading(false);

    if (result.error) {
      Alert.alert('Authentication Failed', result.error);
    } else {
      // Success! The AuthContext in App.js detects the user change 
      // and automatically closes this modal via useEffect.
      // But we can also clear the form here.
      setEmail('');
      setPassword('');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          
          {/* Close X */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {isRegistering ? 'Join Quik Squares today' : 'Log in to manage your pools'}
            </Text>
          </View>

          {/* Inputs */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={styles.mainButton} 
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.mainButtonText}>
                {isRegistering ? 'Sign Up' : 'Log In'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={toggleMode}>
              <Text style={styles.linkText}>
                {isRegistering ? 'Log In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default LoginModal;