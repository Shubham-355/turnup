import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { usePlanStore, useAuthStore } from '../../stores';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Activity } from '../../types';

export default function ActivityDetailScreen() {
  const { planId, activityId } = useLocalSearchParams<{ planId: string; activityId: string }>();
  const { currentPlan, activities, deleteActivity, isLoading } = usePlanStore();
  const { user } = useAuthStore();

  const activity = activities.find((a) => a.id === activityId);

  if (!activity) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Activity not found</Text>
          <Button title="Go Back" onPress={() => router.back()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = activity.createdById === user?.id;
  const isPlanOwner = currentPlan?.ownerId === user?.id;
  const canDelete = isOwner || isPlanOwner;

  const handleDelete = () => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteActivity(planId!, activityId!);
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete activity');
            }
          },
        },
      ]
    );
  };

  const handleOpenMaps = () => {
    if (activity.latitude && activity.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${activity.latitude},${activity.longitude}`;
      Linking.openURL(url);
    } else if (activity.locationAddress) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activity.locationAddress)}`;
      Linking.openURL(url);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {activity.name}
        </Text>
        {canDelete && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color={colors.error.main} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Activity Info Card */}
        <View style={styles.card}>
          <Text style={styles.activityName}>{activity.name}</Text>
          
          {activity.description && (
            <Text style={styles.description}>{activity.description}</Text>
          )}

          <View style={styles.divider} />

          {/* Date & Time */}
          {(activity.date || activity.time) && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={20} color={colors.primary.main} />
              </View>
              <View style={styles.infoContent}>
                {activity.date && (
                  <Text style={styles.infoText}>{formatDate(activity.date)}</Text>
                )}
                {activity.time && (
                  <Text style={styles.infoSubtext}>{formatTime(activity.time)}</Text>
                )}
              </View>
            </View>
          )}

          {/* Location */}
          {(activity.locationName || activity.locationAddress) && (
            <TouchableOpacity style={styles.infoRow} onPress={handleOpenMaps}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={20} color={colors.primary.main} />
              </View>
              <View style={styles.infoContent}>
                {activity.locationName && (
                  <Text style={styles.infoText}>{activity.locationName}</Text>
                )}
                {activity.locationAddress && (
                  <Text style={styles.infoSubtext}>{activity.locationAddress}</Text>
                )}
              </View>
              <Ionicons name="open-outline" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}

          {/* Created By */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={20} color={colors.primary.main} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                Added by {activity.createdBy.displayName || activity.createdBy.username}
              </Text>
              <Text style={styles.infoSubtext}>
                {new Date(activity.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/plans/${planId}/expenses/create?activityId=${activityId}`)}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.success.light }]}>
              <Ionicons name="receipt-outline" size={20} color={colors.success.main} />
            </View>
            <Text style={styles.actionText}>Add Expense</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          {(activity.latitude && activity.longitude) && (
            <TouchableOpacity style={styles.actionButton} onPress={handleOpenMaps}>
              <View style={[styles.actionIcon, { backgroundColor: colors.info.light }]}>
                <Ionicons name="navigate-outline" size={20} color={colors.info.main} />
              </View>
              <Text style={styles.actionText}>Get Directions</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        {activity._count && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activity._count.expenses}</Text>
              <Text style={styles.statLabel}>Expenses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activity._count.media}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  activityName: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  infoSubtext: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  actionsCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  actionsTitle: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary.main,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
