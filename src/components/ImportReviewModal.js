import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
// FIX 1: Import THEME (correct name) instead of theme
import { THEME } from '../theme';

export default function ImportReviewModal({ visible, onClose, onConfirm, importedPlayers, isLoading }) {
  // Calculate stats for the user
  const totalSquares = importedPlayers.reduce((sum, p) => sum + (p.count || 0), 0);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          <Text style={styles.title}>Review Import</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              {/* FIX 2: Use THEME.primary directly */}
              <ActivityIndicator size="large" color={THEME.primary} />
              <Text style={styles.loadingText}>Analyzing Image...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>Found {importedPlayers.length} names with {totalSquares} total squares.</Text>

              <View style={styles.listContainer}>
                <FlatList
                  data={importedPlayers}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.row}>
                      <Text style={styles.name}>{item.name}</Text>
                      <View style={styles.badge}>
                        <Text style={styles.count}>{item.count}</Text>
                      </View>
                    </View>
                  )}
                  ListEmptyComponent={<Text style={styles.emptyText}>No names found. Try a clearer image.</Text>}
                />
              </View>

              <View style={styles.actions}>
                <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                
                {importedPlayers.length > 0 && (
                  <TouchableOpacity onPress={onConfirm} style={[styles.button, styles.confirmButton]}>
                    <Text style={styles.confirmText}>Add Players</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333', // Fallback to avoid structure mismatch
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: THEME.primary, // FIX 2: Correct Usage
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  count: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: THEME.secondary, // FIX 2: Correct Usage
  },
  cancelText: {
    color: '#666',
    fontWeight: 'bold',
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  }
});