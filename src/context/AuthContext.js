import React, { createContext, useState, useEffect, useContext } from 'react';
import { subscribeToAuth } from '../services/AuthService';

// Create the context (The "Radio Frequency" everyone listens to)
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Listen to Firebase
  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      // Auto-close modal if login is successful
      if (currentUser) {
        setModalVisible(false);
      }
    });
    return unsubscribe;
  }, []);

  // Actions accessible by any screen
  const showLogin = () => setModalVisible(true);
  const hideLogin = () => setModalVisible(false);
  const logout = () => {
    // We can add auth.signOut() calls here if we want to centralize logic
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        modalVisible, 
        showLogin, 
        hideLogin 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// A simple hook to use this context easily
export const useAuth = () => useContext(AuthContext);