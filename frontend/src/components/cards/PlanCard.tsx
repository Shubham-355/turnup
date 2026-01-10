import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Plan } from '../../types';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.lg * 2;

interface PlanCardProps {
  plan: Plan;
  onPress: () => void;
  variant?: 'default' | 'compact';
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onPress, variant = 'default' }) => {
  const categoryColor = plan.category === 'NIGHTOUT' ? colors.nightout : colors.trip;
  const categoryIcon = plan.category === 'NIGHTOUT' ? 'moon' : 'airplane';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return format(new Date(dateStr), 'MMM d, yyyy');
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.compactCategoryBadge, { backgroundColor: categoryColor }]}>
          <Ionicons name={categoryIcon} size={16} color={colors.white} />
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {plan.name}
          </Text>
          <Text style={styles.compactMeta}>
            {plan._count?.members || 0} members • {plan._count?.activities || 0} activities
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        {plan.coverImage ? (
          <Image source={{ uri: plan.coverImage }} style={styles.coverImage} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: categoryColor }]}>
            <Ionicons name={categoryIcon} size={48} color={colors.white} />
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.gradient}
        />
        <View style={styles.categoryBadge}>
          <Ionicons name={categoryIcon} size={14} color={colors.text} />
          <Text style={styles.categoryText}>{plan.category}</Text>
        </View>
        {plan.type === 'PUBLIC' && (
          <View style={styles.publicBadge}>
            <Ionicons name="globe" size={12} color={colors.text} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {plan.name}
        </Text>
        {plan.description && (
          <Text style={styles.description} numberOfLines={2}>
            {plan.description}
          </Text>
        )}
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="people" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>{plan._count?.members || 0}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="list" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>{plan._count?.activities || 0}</Text>
          </View>
          {plan.startDate && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>{formatDate(plan.startDate)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  categoryBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  categoryText: {
    ...typography.caption,
    color: colors.text,
    textTransform: 'capitalize',
  },
  publicBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: spacing.xs,
    borderRadius: borderRadius.full,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Compact variant
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  compactCategoryBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  compactMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
