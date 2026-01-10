import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../theme';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Avatar } from '../../components/ui/Avatar';
import { invitationService } from '../../services/invitations';
import { JoinRequest } from '../../types';

// Flat color constants to avoid theme nesting issues
const PRIMARY = '#FF6B35';
const SUCCESS = '#10B981';
const ERROR = '#EF4444';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const TEXT_TERTIARY = '#9CA3AF';
const BACKGROUND = '#FFFFFF';
const SURFACE = '#F9FAFB';
const BORDER = '#E5E7EB';
const PRIMARY_LIGHT = '#FFF7ED';

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

export default function JoinRequestsScreen() {
  const { planId, planName } = useLocalSearchParams<{ planId: string; planName: string }>();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchRequests = useCallback(async () => {
    if (!planId) return;
    
    try {
      const response = await invitationService.getJoinRequests(planId);
      // Handle both paginated and array responses
      const data = response.data as any;
      const allRequests = data?.items || data || [];
      // Filter to only show pending requests
      const pendingRequests = allRequests.filter((r: JoinRequest) => r.status === 'PENDING');
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Failed to load join requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (requestId: string) => {
    setProcessingIds(prev => new Set([...prev, requestId]));
    try {
      await invitationService.respondToJoinRequest(requestId, true);
      Alert.alert('Success', 'Request approved! User has been added to the trip.');
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleReject = async (requestId: string) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this join request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingIds(prev => new Set([...prev, requestId]));
            try {
              await invitationService.respondToJoinRequest(requestId, false);
              Alert.alert('Done', 'Request rejected');
              setRequests(prev => prev.filter(r => r.id !== requestId));
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to reject request');
            } finally {
              setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const renderRequest = ({ item }: { item: JoinRequest }) => {
    const isProcessing = processingIds.has(item.id);
    
    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Avatar user={item.user} size="md" />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.user?.displayName || item.user?.username || 'Unknown User'}
            </Text>
            <Text style={styles.requestTime}>{formatTimeAgo(item.createdAt)}</Text>
          </View>
        </View>

        {item.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>Message:</Text>
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.approveButton, isProcessing && styles.buttonDisabled]}
            onPress={() => handleApprove(item.id)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.approveButtonText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rejectButton, isProcessing && styles.buttonDisabled]}
            onPress={() => handleReject(item.id)}
            disabled={isProcessing}
          >
            <Ionicons name="close" size={18} color={ERROR} />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Join Requests</Text>
          {planName && (
            <Text style={styles.planName} numberOfLines={1}>{planName}</Text>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
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
            icon="person-add-outline"
            title="No Pending Requests"
            message="There are no pending join requests for this trip."
          />
        }
        ListHeaderComponent={
          requests.length > 0 ? (
            <View style={styles.listHeader}>
              <Ionicons name="person-add" size={20} color={PRIMARY} />
              <Text style={styles.listHeaderText}>
                {requests.length} pending request{requests.length !== 1 ? 's' : ''}
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  } as ViewStyle,
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  } as ViewStyle,
  backButton: {
    padding: spacing.xs,
  } as ViewStyle,
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  } as ViewStyle,
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  } as TextStyle,
  planName: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  } as TextStyle,
  headerSpacer: {
    width: 40,
  } as ViewStyle,
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  } as ViewStyle,
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_LIGHT,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  } as ViewStyle,
  listHeaderText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
  } as TextStyle,
  requestCard: {
    backgroundColor: SURFACE,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  } as ViewStyle,
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  } as ViewStyle,
  userInfo: {
    marginLeft: spacing.md,
    flex: 1,
  } as ViewStyle,
  userName: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    fontWeight: '600',
  } as TextStyle,
  requestTime: {
    fontSize: 12,
    color: TEXT_TERTIARY,
    marginTop: 2,
  } as TextStyle,
  messageContainer: {
    backgroundColor: BACKGROUND,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  } as ViewStyle,
  messageLabel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  } as TextStyle,
  messageText: {
    fontSize: 14,
    color: TEXT_PRIMARY,
  } as TextStyle,
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  } as ViewStyle,
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SUCCESS,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: 6,
  } as ViewStyle,
  approveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  } as TextStyle,
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: ERROR,
    gap: 6,
  } as ViewStyle,
  rejectButtonText: {
    color: ERROR,
    fontWeight: '600',
    fontSize: 14,
  } as TextStyle,
  buttonDisabled: {
    opacity: 0.6,
  } as ViewStyle,
  separator: {
    height: spacing.md,
  } as ViewStyle,
});
