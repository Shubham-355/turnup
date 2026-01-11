import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday } from 'date-fns';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useChatStore, useAuthStore, usePlanStore } from '../../stores';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Avatar } from '../../components/ui/Avatar';
import { Message } from '../../types';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { currentPlan, fetchPlanById } = usePlanStore();
  const {
    messages,
    isLoading,
    isConnected,
    typingUsers,
    hasMore,
    connect,
    disconnect,
    joinPlan,
    leavePlan,
    fetchMessages,
    sendMessage,
    startTyping,
    stopTyping,
  } = useChatStore();

  const [inputText, setInputText] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id) {
      connect();
      fetchPlanById(id);
    }
    return () => {
      if (id) {
        leavePlan(id);
      }
    };
  }, [id]);

  useEffect(() => {
    if (id && isConnected) {
      joinPlan(id);
      fetchMessages(id);
    }
  }, [id, isConnected]);

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const formatMessageTime = (dateStr: string) => {
    return format(new Date(dateStr), 'h:mm a');
  };

  const handleSend = async () => {
    if (!inputText.trim() || !id) return;
    
    const text = inputText.trim();
    setInputText('');
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      stopTyping(id);
    }

    await sendMessage(id, text);
  };

  const handleInputChange = (text: string) => {
    setInputText(text);

    if (!id) return;

    // Handle typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (text.length > 0) {
      startTyping(id);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(id);
      }, 2000);
    } else {
      stopTyping(id);
    }
  };

  const handleLoadMore = async () => {
    if (!id || !hasMore || loadingMore || messages.length === 0) return;
    
    setLoadingMore(true);
    const oldestMessage = messages[0];
    await fetchMessages(id, { before: oldestMessage.createdAt });
    setLoadingMore(false);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.senderId === user?.id;
    // Since FlatList is inverted, the next message in visual order is at index - 1
    const reversedMessages = [...messages].reverse();
    const nextMessage = reversedMessages[index + 1];
    const prevMessage = reversedMessages[index - 1];
    
    // Show avatar if it's the last message from this sender in a group
    const showAvatar = !isOwnMessage && 
      (!nextMessage || nextMessage.senderId !== item.senderId);
    
    // Show sender name if it's the first message from this sender in a group  
    const showSenderName = !isOwnMessage &&
      (!prevMessage || prevMessage.senderId !== item.senderId);
    
    // Check if we need to show date separator
    const showDate = !prevMessage || 
      formatMessageDate(item.createdAt) !== formatMessageDate(prevMessage.createdAt);

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{formatMessageDate(item.createdAt)}</Text>
          </View>
        )}
        <View
          style={[
            styles.messageRow,
            isOwnMessage ? styles.ownMessageRow : styles.otherMessageRow,
          ]}
        >
          {!isOwnMessage && (
            <View style={styles.avatarContainer}>
              {showAvatar ? (
                <Avatar user={item.sender} size="sm" />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              isOwnMessage ? styles.ownBubble : styles.otherBubble,
              item.isDeleted && styles.deletedBubble,
            ]}
          >
            {showSenderName && item.sender && (
              <Text style={styles.senderName}>
                {item.sender.displayName || item.sender.username}
              </Text>
            )}
            <Text
              style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                item.isDeleted && styles.deletedText,
              ]}
            >
              {item.content}
            </Text>
            <Text style={[styles.timeText, isOwnMessage && styles.ownTimeText]}>
              {formatMessageTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const typingText = Array.from(typingUsers.values())
    .filter((t) => t.planId === id)
    .map((t) => t.username)
    .join(', ');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentPlan?.name || 'Chat'}
          </Text>
          {isConnected ? (
            <Text style={styles.headerSubtitle}>
              {typingText ? `${typingText} typing...` : 'Online'}
            </Text>
          ) : (
            <Text style={[styles.headerSubtitle, { color: colors.warning }]}>
              Connecting...
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => router.push(`/plans/${id}`)}
        >
          <Ionicons name="information-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        {isLoading && messages.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            ref={flatListRef}
            data={[...messages].reverse()}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            inverted
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadingMore}>
                  <LoadingSpinner size="small" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>Start the conversation!</Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={colors.textTertiary}
              value={inputText}
              onChangeText={handleInputChange}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? colors.text : colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.success,
  },
  infoButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    padding: spacing.md,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dateText: {
    ...typography.caption,
    color: colors.textTertiary,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  ownMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  ownBubble: {
    backgroundColor: colors.messageSent,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: colors.messageReceived,
    borderBottomLeftRadius: 4,
  },
  deletedBubble: {
    backgroundColor: colors.surfaceLight,
  },
  senderName: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  messageText: {
    ...typography.body,
  },
  ownMessageText: {
    color: colors.text,
  },
  otherMessageText: {
    color: colors.text,
  },
  deletedText: {
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    alignSelf: 'flex-end',
    fontSize: 10,
  },
  ownTimeText: {
    color: 'rgba(255,255,255,0.7)',
  },
  loadingMore: {
    paddingVertical: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.h4,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textTertiary,
  },
  inputContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
});
