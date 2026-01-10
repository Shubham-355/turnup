import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { usePlanStore, useAuthStore } from '../../stores';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Avatar } from '../../components/ui/Avatar';

export default function MapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { currentPlan, members, fetchPlanById } = usePlanStore();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    
    try {
      await fetchPlanById(id);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load plan:', error);
      Alert.alert('Error', 'Failed to load plan details');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  if (!currentPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Map</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Plan not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Map - {currentPlan.name}</Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={64} color={colors.text.secondary} />
        <Text style={styles.placeholderTitle}>Map Feature</Text>
        <Text style={styles.placeholderText}>
          Map functionality requires building a development build with Expo.
        </Text>
        <Text style={styles.placeholderText}>
          Run: npx expo run:android or npx expo run:ios
        </Text>
      </View>

      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>Plan Members</Text>
        <ScrollView style={styles.membersList}>
          {members.map((member) => (
            <View key={member.userId} style={styles.memberItem}>
              <Avatar
                uri={member.user?.avatar}
                name={member.user?.displayName || member.user?.username || ''}
                size={40}
              />
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>
                  {member.user?.displayName || member.user?.username}
                </Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
  },
  placeholderTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  membersSection: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  membersList: {
    maxHeight: 200,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  memberInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  memberName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  memberRole: {
    ...typography.caption,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
});
