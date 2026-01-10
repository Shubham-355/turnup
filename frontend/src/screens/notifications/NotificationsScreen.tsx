import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../theme';
import { useNotificationStore } from '../../stores';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { invitationService } from '../../services/invitations';
import { Notification, NotificationType } from '../../types';

// Flat color constants
const PRIMARY = '#FF6B35';
const SECONDARY = '#6366F1';
const SUCCESS = '#10B981';
const ERROR = '#EF4444';
const WARNING = '#F59E0B';
const INFO = '#3B82F6';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const TEXT_TERTIARY = '#9CA3AF';
const BACKGROUND = '#FFFFFF';
const CARD_BG = '#F9FAFB';
const BORDER = '#E5E7EB';
const PRIMARY_LIGHT = '#FFF7ED';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'PLAN_INVITE':
      return { name: 'mail', color: PRIMARY };
    case 'JOIN_REQUEST':
      return { name: 'person-add', color: SECONDARY };
    case 'JOIN_APPROVED':
      return { name: 'checkmark-circle', color: SUCCESS };
    case 'JOIN_REJECTED':
      return { name: 'close-circle', color: ERROR };
    case 'PLAN_UPDATE':
      return { name: 'refresh', color: INFO };
    case 'NEW_ACTIVITY':
      return { name: 'calendar', color: SECONDARY };
    case 'NEW_EXPENSE':
      return { name: 'receipt', color: SUCCESS };
    case 'EXPENSE_SETTLED':
      return { name: 'checkmark-circle', color: SUCCESS };
    case 'NEW_MESSAGE':
      return { name: 'chatbubble', color: PRIMARY };
    case 'MEMBER_JOINED':
      return { name: 'person-add', color: INFO };
    case 'MEMBER_LEFT':
      return { name: 'person-remove', color: WARNING };
    default:
      return { name: 'notifications', color: TEXT_SECONDARY };
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export default function NotificationsScreen() {
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationStore();
  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const handleNotificationPress = async (notification: Notification) => {
    // Don't navigate for join requests, they have action buttons
    if (notification.type === 'JOIN_REQUEST') return;

    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type and data
    if (notification.data?.planId) {
      router.push(`/plans/${notification.data.planId}`);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleApproveRequest = async (notification: Notification) => {
    const requestId = notification.data?.requestId;
    if (!requestId) {
      Alert.alert('Error', 'Invalid request');
      return;
    }

    setProcessingIds(prev => new Set([...prev, notification.id]));
    try {
      await invitationService.respondToJoinRequest(requestId, true);
      Alert.alert('Success', 'Request approved! User has been added to the trip.');
      // Remove from list
      if (removeNotification) {
        removeNotification(notification.id);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (notification: Notification) => {
    const requestId = notification.data?.requestId;
    if (!requestId) {
      Alert.alert('Error', 'Invalid request');
      return;
    }

    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this join request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingIds(prev => new Set([...prev, notification.id]));
            try {
              await invitationService.respondToJoinRequest(requestId, false);
              Alert.alert('Done', 'Request rejected');
              if (removeNotification) {
                removeNotification(notification.id);
              }
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to reject request');
            } finally {
              setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(notification.id);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);
    const isJoinRequest = item.type === 'JOIN_REQUEST';
    const isProcessing = processingIds.has(item.id);

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.isRead && styles.unread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={isJoinRequest ? 1 : 0.7}
        disabled={isJoinRequest}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
          <Ionicons name={icon.name as any} size={20} color={icon.color} />
        </View>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>

          {/* Action buttons for join requests */}
          {isJoinRequest && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.approveButton, isProcessing && styles.buttonDisabled]}
                onPress={() => handleApproveRequest(item)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rejectButton, isProcessing && styles.buttonDisabled]}
                onPress={() => handleRejectRequest(item)}
                disabled={isProcessing}
              >
                <Ionicons name="close" size={16} color={ERROR} />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              {item.data?.planId && (
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => router.push(`/plans/${item.data.planId}`)}
                >
                  <Text style={styles.viewButtonText}>View Trip</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No notifications"
            message="You're all caught up! Check back later for updates."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  badge: {
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60,
  },
  markAllButton: {
    padding: spacing.xs,
  },
  markAllText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: CARD_BG,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  unread: {
    backgroundColor: PRIMARY_LIGHT,
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    fontWeight: '600',
    marginBottom: 4,
    flex: 1,
  },
  body: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: TEXT_TERTIARY,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    marginLeft: spacing.sm,
  },
  separator: {
    height: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    gap: 8,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SUCCESS,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  approveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ERROR,
    gap: 4,
  },
  rejectButtonText: {
    color: ERROR,
    fontWeight: '600',
    fontSize: 13,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  viewButtonText: {
    color: PRIMARY,
    fontWeight: '600',
    fontSize: 13,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
