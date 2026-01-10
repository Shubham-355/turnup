import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { usePlanStore, useAuthStore } from '../../stores';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Avatar } from '../../components/ui/Avatar';
import { ActivityCard } from '../../components/cards/ActivityCard';
import { Button } from '../../components/ui/Button';
import { invitationService } from '../../services';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    currentPlan,
    activities,
    members,
    isLoading,
    fetchPlanById,
    fetchActivities,
    fetchMembers,
    clearCurrentPlan,
  } = usePlanStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isRequestingJoin, setIsRequestingJoin] = useState(false);
  const [hasRequestedJoin, setHasRequestedJoin] = useState(false);

  useEffect(() => {
    if (id) {
      loadPlanData();
    }
    return () => clearCurrentPlan();
  }, [id]);

  const loadPlanData = async () => {
    if (!id) return;
    await Promise.all([
      fetchPlanById(id),
      fetchActivities(id),
      fetchMembers(id),
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPlanData();
    setRefreshing(false);
  }, [id]);

  const handleShare = async () => {
    if (!currentPlan) return;
    try {
      await Share.share({
        message: `Join my plan "${currentPlan.name}" on TurnUp! Use code: ${currentPlan.inviteCode}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleRequestJoin = async () => {
    if (!id) return;
    setIsRequestingJoin(true);
    try {
      await invitationService.requestToJoin(id);
      setHasRequestedJoin(true);
      Alert.alert('Success', 'Your request to join has been sent! The plan owner will review it.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send join request';
      if (message.includes('already')) {
        setHasRequestedJoin(true);
      }
      Alert.alert('Error', message);
    } finally {
      setIsRequestingJoin(false);
    }
  };

  const isOwner = currentPlan?.ownerId === user?.id;
  const isMember = members.some((m) => m.userId === user?.id);
  const isAdmin = members.find((m) => m.userId === user?.id)?.role === 'ADMIN';
  const canManage = isOwner || isAdmin;
  const isPublicPlan = currentPlan?.type === 'PUBLIC';

  if (isLoading && !currentPlan) {
    return <LoadingSpinner fullScreen />;
  }

  if (!currentPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Plan not found</Text>
          <Button title="Go Back" onPress={() => router.back()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  const categoryColor = currentPlan.category === 'NIGHTOUT' ? colors.nightout : colors.trip;
  const categoryIcon = currentPlan.category === 'NIGHTOUT' ? 'moon' : 'airplane';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          {currentPlan.coverImage ? (
            <Image source={{ uri: currentPlan.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverPlaceholder, { backgroundColor: categoryColor }]}>
              <Ionicons name={categoryIcon} size={64} color={colors.text} />
            </View>
          )}
          <LinearGradient
            colors={['transparent', colors.background]}
            style={styles.coverGradient}
          />
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Menu Button */}
          {canManage && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => router.push(`/plans/${id}/settings`)}
            >
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        {/* Plan Info */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.badges}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                <Ionicons name={categoryIcon} size={14} color={colors.text} />
                <Text style={styles.categoryText}>{currentPlan.category}</Text>
              </View>
              {currentPlan.type === 'PUBLIC' && (
                <View style={styles.publicBadge}>
                  <Ionicons name="globe" size={14} color={colors.text} />
                  <Text style={styles.publicText}>Public</Text>
                </View>
              )}
            </View>
            <Text style={styles.title}>{currentPlan.name}</Text>
            {currentPlan.description && (
              <Text style={styles.description}>{currentPlan.description}</Text>
            )}
            
            {/* Dates */}
            {(currentPlan.startDate || currentPlan.endDate) && (
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.dateText}>
                  {currentPlan.startDate && format(new Date(currentPlan.startDate), 'MMM d, yyyy')}
                  {currentPlan.endDate && ` - ${format(new Date(currentPlan.endDate), 'MMM d, yyyy')}`}
                </Text>
              </View>
            )}
          </View>

          {/* Request to Join Button for non-members viewing public plans */}
          {isPublicPlan && !isMember && (
            <View style={styles.joinRequestSection}>
              {hasRequestedJoin ? (
                <View style={styles.requestPendingCard}>
                  <Ionicons name="hourglass-outline" size={24} color={colors.primary} />
                  <Text style={styles.requestPendingText}>Request Pending</Text>
                  <Text style={styles.requestPendingSubtext}>
                    Waiting for the plan owner to approve your request
                  </Text>
                </View>
              ) : (
                <Button
                  title={isRequestingJoin ? 'Sending Request...' : 'Request to Join'}
                  onPress={handleRequestJoin}
                  disabled={isRequestingJoin}
                  icon={<Ionicons name="person-add" size={20} color="#fff" />}
                />
              )}
            </View>
          )}

          {/* Quick Actions - Only show for members */}
          {isMember && (
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => router.push(`/plans/${id}/chat`)}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="chatbubbles" size={22} color={colors.text} />
                </View>
                <Text style={styles.actionLabel}>Chat</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => router.push(`/plans/${id}/expenses`)}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="wallet" size={22} color={colors.text} />
                </View>
                <Text style={styles.actionLabel}>Expenses</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => router.push(`/plans/${id}/media`)}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="images" size={22} color={colors.text} />
                </View>
                <Text style={styles.actionLabel}>Photos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => router.push(`/plans/${id}/map`)}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="map" size={22} color={colors.text} />
                </View>
                <Text style={styles.actionLabel}>Map</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Members - Always show member list for public plans */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Members ({members.length})</Text>
              {isMember && (
                <TouchableOpacity onPress={() => router.push(`/plans/${id}/members`)}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.membersRow}>
              {members.slice(0, 5).map((member) => (
                <Avatar key={member.id} user={member.user} size="md" />
              ))}
              {members.length > 5 && (
                <View style={styles.moreMembersButton}>
                  <Text style={styles.moreMembersText}>+{members.length - 5}</Text>
                </View>
              )}
              {isMember && (
                <TouchableOpacity
                  style={styles.inviteButton}
                  onPress={handleShare}
                >
                  <Ionicons name="person-add" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Activities */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Activities</Text>
              <View style={styles.sectionActions}>
                {isMember && activities.length > 0 && activities.some(a => a.latitude && a.longitude) && (
                  <TouchableOpacity 
                    onPress={() => router.push(`/plans/${id}/route`)}
                    style={styles.routeButton}
                  >
                    <Ionicons name="navigate" size={18} color={colors.primary} />
                    <Text style={styles.routeButtonText}>View Route</Text>
                  </TouchableOpacity>
                )}
                {canManage && (
                  <TouchableOpacity onPress={() => router.push(`/plans/${id}/activities/create`)}>
                    <Ionicons name="add-circle" size={24} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {activities.length === 0 ? (
              <View style={styles.emptyActivities}>
                <Ionicons name="list-outline" size={32} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No activities yet</Text>
                {canManage && (
                  <Button
                    title="Add Activity"
                    variant="outline"
                    size="sm"
                    onPress={() => router.push(`/plans/${id}/activities/create`)}
                  />
                )}
              </View>
            ) : (
              activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  showOrder
                  onPress={() => router.push(`/plans/${id}/activities/${activity.id}`)}
                />
              ))
            )}
          </View>

          {/* Invite Code - Only show for members */}
          {isMember && (
            <View style={styles.section}>
              <View style={styles.inviteCodeCard}>
                <View style={styles.inviteCodeContent}>
                  <Text style={styles.inviteCodeLabel}>Invite Code</Text>
                  <Text style={styles.inviteCode}>{currentPlan.inviteCode}</Text>
                </View>
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                  <Ionicons name="share-social" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  errorText: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  coverContainer: {
    height: 240,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginTop: -spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    ...typography.caption,
    color: colors.text,
    textTransform: 'capitalize',
  },
  publicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
  },
  publicText: {
    ...typography.caption,
    color: colors.text,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.md,
  },
  routeButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -spacing.sm,
  },
  moreMembersButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  moreMembersText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  inviteButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  emptyActivities: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  inviteCodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  inviteCodeContent: {
    flex: 1,
  },
  inviteCodeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inviteCode: {
    ...typography.h3,
    color: colors.primary,
    letterSpacing: 2,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinRequestSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  requestPendingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  requestPendingText: {
    ...typography.h4,
    color: colors.text,
  },
  requestPendingSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
