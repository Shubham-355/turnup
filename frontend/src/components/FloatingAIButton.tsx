import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AIAgentChat from '../screens/AIAgentChat';

/**
 * Floating AI Assistant Button
 * 
 * Add this component to your main app layout to provide
 * quick access to the AI assistant from anywhere in the app.
 * 
 * Usage:
 * <FloatingAIButton />
 */
const FloatingAIButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="sparkles" size={28} color="#fff" />
      </TouchableOpacity>

      {/* AI Chat Modal */}
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <AIAgentChat onClose={() => setIsVisible(false)} />
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});

export default FloatingAIButton;
