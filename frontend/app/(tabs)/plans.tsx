import React, { useEffect, useState, useCallback } from 'react';
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
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { usePlanStore } from '../../src/stores';
import { PlanCard } from '../../src/components/cards/PlanCard';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Plan, PlanCategory } from '../../src/types';

type FilterType = 'ALL' | 'NIGHTOUT' | 'TRIP';

export default function PlansScreen() {
  const { plans, isLoading, fetchPlans } = usePlanStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('ALL');

  useEffect(() => {
    fetchPlans();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlans();
    setRefreshing(false);
  }, []);

  const handlePlanPress = (plan: Plan) => {
    router.push(`/plans/${plan.id}`);
  };

  const filteredPlans = filter === 'ALL'
    ? plans
    : plans.filter((plan) => plan.category === filter);

  const renderPlan = ({ item }: { item: Plan }) => (
    <PlanCard plan={item} onPress={() => handlePlanPress(item)} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Plans</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['ALL', 'NIGHTOUT', 'TRIP'] as FilterType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterTab, filter === type && styles.filterTabActive]}
            onPress={() => setFilter(type)}
          >
            {type !== 'ALL' && (
              <Ionicons
                name={type === 'NIGHTOUT' ? 'moon' : 'airplane'}
                size={16}
                color={filter === type ? colors.text : colors.textSecondary}
              />
            )}
            <Text
              style={[
                styles.filterText,
                filter === type && styles.filterTextActive,
              ]}
            >
              {type === 'ALL' ? 'All' : type === 'NIGHTOUT' ? 'Night Out' : 'Trip'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Plans List */}
      {isLoading && plans.length === 0 ? (
        <LoadingSpinner fullScreen />
      ) : (
        <FlatList
          data={filteredPlans}
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
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="No Plans"
              message={
                filter === 'ALL'
                  ? "You haven't created any plans yet"
                  : `No ${filter.toLowerCase()} plans found`
              }
              actionLabel="Create Plan"
              onAction={() => router.push('/plans/create')}
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/plans/create')}
      >
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
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
