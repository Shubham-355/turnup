import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Activity } from '../../types';
import { format } from 'date-fns';

interface ActivityCardProps {
  activity: Activity;
  onPress?: () => void;
  onDelete?: () => void;
  showOrder?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onPress,
  onDelete,
  showOrder = false,
}) => {
  const formatTime = () => {
    if (!activity.date && !activity.time) return null;
    
    let result = '';
    if (activity.date) {
      result = format(new Date(activity.date), 'MMM d');
    }
    if (activity.time) {
      result += result ? ` at ${activity.time}` : activity.time;
    }
    return result;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {showOrder && (
        <View style={styles.orderBadge}>
          <Text style={styles.orderText}>{activity.order}</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {activity.name}
          </Text>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
        
        {activity.description && (
          <Text style={styles.description} numberOfLines={2}>
            {activity.description}
          </Text>
        )}

        <View style={styles.meta}>
          {formatTime() && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{formatTime()}</Text>
            </View>
          )}
          
          {activity.locationName && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {activity.locationName}
              </Text>
            </View>
          )}
        </View>

        {(activity._count?.expenses || activity._count?.media) && (
          <View style={styles.stats}>
            {activity._count.expenses > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="receipt-outline" size={12} color={colors.textTertiary} />
                <Text style={styles.statText}>{activity._count.expenses}</Text>
              </View>
            )}
            {activity._count.media > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="images-outline" size={12} color={colors.textTertiary} />
                <Text style={styles.statText}>{activity._count.media}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  orderText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.sm,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  meta: {
    gap: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
