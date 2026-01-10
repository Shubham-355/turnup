import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuthStore, usePlanStore, useNotificationStore } from '../../stores';
import { PlanCard } from '../../components/cards/PlanCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Avatar } from '../../components/ui/Avatar';
import { Plan } from '../../types';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { plans, isLoading, fetchPlans } = usePlanStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchPlans();
    fetchUnreadCount();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPlans(), fetchUnreadCount()]);
    setRefreshing(false);
  }, []);

  const handlePlanPress = (plan: Plan) => {
    router.push(`/plans/${plan.id}`);
  };

  const handleCreatePlan = () => {
    router.push('/plans/create');
  };

  const renderPlan = ({ item }: { item: Plan }) => (
    <PlanCard plan={item} onPress={() => handlePlanPress(item)} />
  );

  const upcomingPlans = plans.filter((p) => p.status === 'ACTIVE');
  const draftPlans = plans.filter((p) => p.status === 'DRAFT');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar user={user || undefined} size="md" onPress={() => router.push('/profile')} />
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Hey, {user?.displayName || user?.username}!</Text>
            <Text style={styles.subGreeting}>What's the plan?</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCreatePlan}>
          <View style={[styles.actionIcon, { backgroundColor: colors.nightout }]}>
            <Ionicons name="moon" size={20} color={colors.text} />
          </View>
          <Text style={styles.actionText}>Night Out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/plans/create?category=TRIP')}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.trip }]}>
            <Ionicons name="airplane" size={20} color={colors.text} />
          </View>
          <Text style={styles.actionText}>Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/explore')}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.surfaceLight }]}>
            <Ionicons name="compass" size={20} color={colors.text} />
          </View>
          <Text style={styles.actionText}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/join')}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.surfaceLight }]}>
            <Ionicons name="qr-code" size={20} color={colors.text} />
          </View>
          <Text style={styles.actionText}>Join</Text>
        </TouchableOpacity>
      </View>

      {/* Plans List */}
      {isLoading && plans.length === 0 ? (
        <LoadingSpinner fullScreen />
      ) : plans.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No Plans Yet"
          message="Create your first plan and invite friends to join the fun!"
          actionLabel="Create Plan"
          onAction={handleCreatePlan}
        />
      ) : (
        <FlatList
          data={upcomingPlans}
          keyExtractor={(item) => item.id}
          renderItem={renderPlan}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={
            upcomingPlans.length > 0 ? (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Plans</Text>
                <TouchableOpacity onPress={() => router.push('/plans')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          ListFooterComponent={
            draftPlans.length > 0 ? (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Drafts</Text>
                </View>
                {draftPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onPress={() => handlePlanPress(plan)}
                    variant="compact"
                  />
                ))}
              </View>
            ) : null
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleCreatePlan}>
        <Ionicons name="add" size={28} color={colors.text} />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    marginLeft: spacing.md,
  },
  greetingText: {
    ...typography.h4,
    color: colors.text,
  },
  subGreeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...typography.caption,
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
