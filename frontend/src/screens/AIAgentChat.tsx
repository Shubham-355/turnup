import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

interface AIAgentChatProps {
  navigation?: any;
  onClose?: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  routeData?: any;
}

const AIAgentChat = ({ navigation, onClose }: AIAgentChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Load conversation history
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Auto scroll to bottom when new message arrives
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const response = await api.get('/ai-agent/history');
      
      const history = response.data.data;
      const formattedMessages = history.map((item: any) => ({
        role: item.role,
        text: item.parts[0].text
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await api.post('/ai-agent/chat', { message: userMessage });

      const aiResponse = response.data.data.message;
      const toolResults = response.data.data.toolResults || [];
      
      // Check if there's a directions result
      const directionsResult = toolResults.find((r: any) => r.name === 'getDirections');
      if (directionsResult && directionsResult.result.success) {
        setRouteData(directionsResult.result);
      }

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: aiResponse,
        routeData: directionsResult?.result
      }]);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      // Check for rate limit error
      const isRateLimit = error.response?.status === 429 || 
                          error.response?.data?.message?.includes('busy') ||
                          error.response?.data?.message?.includes('429');
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: isRateLimit 
          ? '⏳ I\'m a bit busy right now. Please wait a few seconds and try again!'
          : 'Sorry, I encountered an error. Please try again.' 
      }]);
      setRouteData(null);
    } finally {
      setLoading(false);
    }
  };

  const resetConversation = async () => {
    try {
      await api.post('/ai-agent/reset', {});
      setMessages([]);
      setRouteData(null);
    } catch (error) {
      console.error('Failed to reset conversation:', error);
    }
  };

  const openInMaps = () => {
    if (routeData?.origin && routeData?.destination) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(routeData.origin)}&destination=${encodeURIComponent(routeData.destination)}`;
      Linking.openURL(url);
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <View
        key={index}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.aiMessage
        ]}
      >
        {!isUser && (
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={16} color="#fff" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {message.text}
          </Text>
        </View>
        {isUser && (
          <View style={styles.userIcon}>
            <Ionicons name="person" size={16} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  const quickActions = [
    { text: 'Create trip to Starbucks and La Pinoz', icon: 'airplane' as const },
    { text: 'Plan a nightout at Skybar', icon: 'moon' as const },
    { text: 'Show my plans', icon: 'list' as const },
    { text: 'Search for cafes nearby', icon: 'cafe' as const },
  ];

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name={onClose ? "close" : "arrow-back"} size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons name="sparkles" size={24} color="#fff" />
          <Text style={styles.headerText}>AI Assistant</Text>
        </View>
        <TouchableOpacity onPress={resetConversation}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="sparkles" size={64} color="#7C3AED" />
            <Text style={styles.emptyTitle}>AI Assistant Ready</Text>
            <Text style={styles.emptySubtitle}>
              I can help you create plans, add activities, manage expenses, and more!
            </Text>
            
            {/* Quick Actions */}
            <View style={styles.quickActions}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickAction}
                  onPress={() => {
                    setInput(action.text);
                  }}
                >
                  <Ionicons name={action.icon} size={18} color="#7C3AED" />
                  <Text style={styles.quickActionText}>{action.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {messages.map(renderMessage)}

        {/* Route Info Card */}
        {routeData && (
          <View style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <Ionicons name="map" size={20} color="#7C3AED" />
              <Text style={styles.routeTitle}>Route Information</Text>
            </View>
            <View style={styles.routeInfo}>
              <View style={styles.routeInfoItem}>
                <Ionicons name="navigate" size={16} color="#6b7280" />
                <Text style={styles.routeInfoText}>{routeData.distance}</Text>
              </View>
              <View style={styles.routeInfoItem}>
                <Ionicons name="time" size={16} color="#6b7280" />
                <Text style={styles.routeInfoText}>{routeData.duration}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.openMapButton} onPress={openInMaps}>
              <Ionicons name="open-outline" size={18} color="#fff" />
              <Text style={styles.openMapButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#7C3AED" />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    backgroundColor: '#7C3AED',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    color: '#1f2937',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
    justifyContent: 'center',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ede9fe',
    borderRadius: 20,
  },
  quickActionText: {
    color: '#7C3AED',
    fontWeight: '500',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#1f2937',
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6b7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  loadingText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 22,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  routeInfo: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeInfoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  openMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 12,
  },
  openMapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AIAgentChat;
