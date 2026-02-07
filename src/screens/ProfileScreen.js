import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { THEME } from '../theme/index';
import BrandHeader from '../components/BrandHeader';
import { logoutUser, resetPassword } from '../services/AuthService';

// We use the same named export pattern for styles
import { styles } from '../styles/ProfileScreen.styles';

const ProfileScreen = ({ navigation, user }) => {
  const handleLogout = async () => {
    await logoutUser();
    // The AuthContext in App.js will handle the state change
    // We just need to go home or close the screen
    navigation.navigate('Home'); 
  };

  const handlePasswordReset = async () => {
    if (!user || !user.email) return;
    Alert.alert(
      "Reset Password",
      `Send a password reset email to ${user.email}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Send Email", 
          onPress: async () => {
            await resetPassword(user.email);
            Alert.alert("Success", "Check your email inbox.");
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <BrandHeader title="Guest" />
        <View style={styles.centerContent}>
          <Text style={styles.text}>Please log in to view your profile.</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BrandHeader title="My Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* User Card */}
        <View style={styles.card}>
          <Text style={styles.label}>LOGGED IN AS</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.uid}>ID: {user.uid}</Text>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.actionRow} onPress={handlePasswordReset}>
          <Text style={styles.actionText}>Change Password</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={[styles.buttonText, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default ProfileScreen;