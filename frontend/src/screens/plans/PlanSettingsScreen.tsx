import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius } from '../../theme';
import { usePlanStore, useAuthStore } from '../../stores';

const COLORS = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceLight: '#F3F4F6',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  primary: '#FF6B35',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  success: '#10B981',
  warning: '#F59E0B',
};

export default function PlanSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { currentPlan, updatePlan, deletePlan, leavePlan, isLoading } = usePlanStore();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(true);

  const isOwner = currentPlan?.ownerId === user?.id;
  const isAdmin = currentPlan?.members?.some(
    m => m.userId === user?.id && (m.role === 'OWNER' || m.role === 'ADMIN')
  );

  const handleTogglePlanType = async () => {
    if (!currentPlan || !isAdmin) return;
    
    const newType = currentPlan.type === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
    try {
      await updatePlan(currentPlan.id, { type: newType });
    } catch (error) {
      Alert.alert('Error', 'Failed to update plan visibility');
    }
  };

  const handleCopyInviteCode = () => {
    if (!currentPlan?.inviteCode) return;
    // In a real app, use Clipboard API
    Alert.alert('Copied!', `Invite code: ${currentPlan.inviteCode}`);
  };

  const handleLeavePlan = () => {
    Alert.alert(
      'Leave Plan',
      'Are you sure you want to leave this plan? You will need an invite to rejoin.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leavePlan(id!);
              router.replace('/(tabs)');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to leave plan');
            }
          },
        },
      ]
    );
  };

  const handleDeletePlan = () => {
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this plan? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlan(id!);
              router.replace('/(tabs)');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete plan');
            }
          },
        },
      ]
    );
  };

  const handleManageMembers = () => {
    router.push(`/plans/${id}/join-requests`);
  };

  if (!currentPlan) {
    return (
      <SafeAreaView style={styles.container as ViewStyle} edges={['top']}>
        <View style={styles.loadingContainer as ViewStyle}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container as ViewStyle} edges={['top']}>
      {/* Header */}
      <View style={styles.header as ViewStyle}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton as ViewStyle}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title as TextStyle}>Plan Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView as ViewStyle}
        contentContainerStyle={styles.content as ViewStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* Plan Info */}
        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>Plan Information</Text>
          <View style={styles.card as ViewStyle}>
            <View style={styles.infoRow as ViewStyle}>
              <Text style={styles.infoLabel as TextStyle}>Name</Text>
              <Text style={styles.infoValue as TextStyle}>{currentPlan.name}</Text>
            </View>
            <View style={styles.divider as ViewStyle} />
            <View style={styles.infoRow as ViewStyle}>
              <Text style={styles.infoLabel as TextStyle}>Category</Text>
              <Text style={styles.infoValue as TextStyle}>
                {currentPlan.category === 'NIGHTOUT' ? '🎉 Night Out' : '✈️ Trip'}
              </Text>
            </View>
            <View style={styles.divider as ViewStyle} />
            <View style={styles.infoRow as ViewStyle}>
              <Text style={styles.infoLabel as TextStyle}>Status</Text>
              <View style={[styles.statusBadge as ViewStyle, 
                currentPlan.status === 'ACTIVE' && { backgroundColor: '#D1FAE5' },
                currentPlan.status === 'COMPLETED' && { backgroundColor: '#DBEAFE' },
              ]}>
                <Text style={[styles.statusText as TextStyle,
                  currentPlan.status === 'ACTIVE' && { color: '#10B981' },
                  currentPlan.status === 'COMPLETED' && { color: '#3B82F6' },
                ]}>
                  {currentPlan.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Invite Code */}
        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>Invite Code</Text>
          <TouchableOpacity style={styles.inviteCard as ViewStyle} onPress={handleCopyInviteCode}>
            <View style={styles.inviteContent as ViewStyle}>
              <Ionicons name="key-outline" size={24} color={COLORS.primary} />
              <Text style={styles.inviteCode as TextStyle}>{currentPlan.inviteCode}</Text>
            </View>
            <Ionicons name="copy-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.inviteHint as TextStyle}>
            Share this code to invite others to join the plan
          </Text>
        </View>

        {/* Visibility Settings (Admin only) */}
        {isAdmin && (
          <View style={styles.section as ViewStyle}>
            <Text style={styles.sectionTitle as TextStyle}>Visibility</Text>
            <View style={styles.card as ViewStyle}>
              <View style={styles.settingRow as ViewStyle}>
                <View style={styles.settingInfo as ViewStyle}>
                  <Text style={styles.settingLabel as TextStyle}>Public Plan</Text>
                  <Text style={styles.settingDescription as TextStyle}>
                    Anyone can find and join this plan
                  </Text>
                </View>
                <Switch
                  value={currentPlan.type === 'PUBLIC'}
                  onValueChange={handleTogglePlanType}
                  trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
                  thumbColor={COLORS.background}
                />
              </View>
            </View>
          </View>
        )}

        {/* Notifications */}
        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>Notifications</Text>
          <View style={styles.card as ViewStyle}>
            <View style={styles.settingRow as ViewStyle}>
              <View style={styles.settingInfo as ViewStyle}>
                <Text style={styles.settingLabel as TextStyle}>Push Notifications</Text>
                <Text style={styles.settingDescription as TextStyle}>
                  Get notified about plan updates
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
                thumbColor={COLORS.background}
              />
            </View>
          </View>
        </View>

        {/* Location Sharing */}
        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>Location</Text>
          <View style={styles.card as ViewStyle}>
            <View style={styles.settingRow as ViewStyle}>
              <View style={styles.settingInfo as ViewStyle}>
                <Text style={styles.settingLabel as TextStyle}>Share My Location</Text>
                <Text style={styles.settingDescription as TextStyle}>
                  Other members can see your location on the map
                </Text>
              </View>
              <Switch
                value={locationSharingEnabled}
                onValueChange={setLocationSharingEnabled}
                trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
                thumbColor={COLORS.background}
              />
            </View>
          </View>
        </View>

        {/* Members */}
        {isAdmin && (
          <View style={styles.section as ViewStyle}>
            <Text style={styles.sectionTitle as TextStyle}>Members</Text>
            <TouchableOpacity style={styles.menuItem as ViewStyle} onPress={handleManageMembers}>
              <Ionicons name="people-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.menuLabel as TextStyle}>Manage Members</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Danger Zone */}
        <View style={styles.section as ViewStyle}>
          <Text style={[styles.sectionTitle as TextStyle, { color: COLORS.danger }]}>
            Danger Zone
          </Text>
          <View style={styles.dangerCard as ViewStyle}>
            {!isOwner && (
              <TouchableOpacity 
                style={styles.dangerButton as ViewStyle} 
                onPress={handleLeavePlan}
                disabled={isLoading}
              >
                <Ionicons name="exit-outline" size={22} color={COLORS.danger} />
                <Text style={styles.dangerButtonText as TextStyle}>Leave Plan</Text>
              </TouchableOpacity>
            )}
            {isOwner && (
              <>
                <TouchableOpacity 
                  style={styles.dangerButton as ViewStyle} 
                  onPress={handleDeletePlan}
                  disabled={isLoading}
                >
                  <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
                  <Text style={styles.dangerButtonText as TextStyle}>Delete Plan</Text>
                </TouchableOpacity>
                <Text style={styles.dangerHint as TextStyle}>
                  Deleting will permanently remove the plan and all its data
                </Text>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  infoLabel: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  infoValue: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: COLORS.surfaceLight,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  inviteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  inviteCode: {
    ...typography.h4,
    color: COLORS.text,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  inviteHint: {
    ...typography.caption,
    color: COLORS.textTertiary,
    marginTop: spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  settingDescription: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  menuLabel: {
    ...typography.body,
    color: COLORS.text,
    flex: 1,
  },
  dangerCard: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  dangerButtonText: {
    ...typography.body,
    color: COLORS.danger,
    fontWeight: '600',
  },
  dangerHint: {
    ...typography.caption,
    color: COLORS.danger,
    marginTop: spacing.xs,
    opacity: 0.8,
  },
});
