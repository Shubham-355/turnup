import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { usePlanStore, useAuthStore } from '../../stores';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { Avatar } from '../../components/ui/Avatar';
import { expenseService } from '../../services';
import { SplitType, PlanMember } from '../../types';

export default function CreateExpenseScreen() {
  const { planId, activityId } = useLocalSearchParams<{ planId: string; activityId?: string }>();
  const { currentPlan, members, activities, fetchPlanDetails } = usePlanStore();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(activityId || null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (planId) {
      fetchPlanDetails(planId);
    }
  }, [planId]);

  useEffect(() => {
    // Select all members by default
    if (members.length > 0 && selectedMembers.length === 0) {
      setSelectedMembers(members.map((m) => m.userId));
    }
  }, [members]);

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCustomShareChange = (userId: string, value: string) => {
    setCustomShares((prev) => ({ ...prev, [userId]: value }));
  };

  const calculateSplit = () => {
    const totalAmount = parseFloat(amount) || 0;
    const memberCount = selectedMembers.length;

    if (memberCount === 0) return {};

    if (splitType === 'EQUAL') {
      const shareAmount = totalAmount / memberCount;
      return selectedMembers.reduce((acc, userId) => {
        acc[userId] = shareAmount.toFixed(2);
        return acc;
      }, {} as Record<string, string>);
    }

    return customShares;
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an expense title');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (selectedMembers.length === 0) {
      Alert.alert('Error', 'Please select at least one member to split with');
      return;
    }

    const shares = calculateSplit();
    const totalShares = Object.values(shares).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const totalAmount = parseFloat(amount);

    if (splitType !== 'EQUAL' && Math.abs(totalShares - totalAmount) > 0.01) {
      Alert.alert('Error', 'The shares must add up to the total amount');
      return;
    }

    setIsLoading(true);

    try {
      await expenseService.createExpense(planId!, {
        title: title.trim(),
        description: description.trim() || undefined,
        amount: totalAmount,
        splitType,
        activityId: selectedActivityId || undefined,
        shares: selectedMembers.map((userId) => ({
          userId,
          amount: parseFloat(shares[userId]) || totalAmount / selectedMembers.length,
        })),
      });

      Alert.alert('Success', 'Expense created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create expense');
    } finally {
      setIsLoading(false);
    }
  };

  const splitOptions: { type: SplitType; label: string; icon: string }[] = [
    { type: 'EQUAL', label: 'Split Equally', icon: 'git-compare-outline' },
    { type: 'CUSTOM', label: 'Custom Amounts', icon: 'calculator-outline' },
    { type: 'BY_ITEM', label: 'By Item', icon: 'pie-chart-outline' },
  ];

  const calculatedShares = calculateSplit();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Details</Text>

          <TextInput
            label="Title *"
            placeholder="e.g., Dinner, Uber, Tickets"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            label="Amount *"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            leftIcon={<Text style={styles.currencySymbol}>$</Text>}
          />

          <TextInput
            label="Description"
            placeholder="Add notes..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Activity Selection */}
        {activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Link to Activity (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.activityChip,
                  !selectedActivityId && styles.activityChipSelected,
                ]}
                onPress={() => setSelectedActivityId(null)}
              >
                <Text
                  style={[
                    styles.activityChipText,
                    !selectedActivityId && styles.activityChipTextSelected,
                  ]}
                >
                  None
                </Text>
              </TouchableOpacity>
              {activities.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityChip,
                    selectedActivityId === activity.id && styles.activityChipSelected,
                  ]}
                  onPress={() => setSelectedActivityId(activity.id)}
                >
                  <Text
                    style={[
                      styles.activityChipText,
                      selectedActivityId === activity.id && styles.activityChipTextSelected,
                    ]}
                  >
                    {activity.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Split Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Split Method</Text>
          <View style={styles.splitOptions}>
            {splitOptions.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.splitOption,
                  splitType === option.type && styles.splitOptionSelected,
                ]}
                onPress={() => setSplitType(option.type)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={splitType === option.type ? colors.primary.main : colors.text.secondary}
                />
                <Text
                  style={[
                    styles.splitOptionText,
                    splitType === option.type && styles.splitOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Members Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Split With</Text>
          {members.map((member) => (
            <TouchableOpacity
              key={member.userId}
              style={styles.memberRow}
              onPress={() => toggleMember(member.userId)}
            >
              <View style={styles.memberInfo}>
                <Avatar
                  source={member.user.avatar}
                  name={member.user.displayName || member.user.username}
                  size={40}
                />
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>
                    {member.user.displayName || member.user.username}
                    {member.userId === user?.id && ' (You)'}
                  </Text>
                  {splitType === 'EQUAL' && selectedMembers.includes(member.userId) && (
                    <Text style={styles.memberShare}>
                      ${calculatedShares[member.userId] || '0.00'}
                    </Text>
                  )}
                </View>
              </View>

              {splitType === 'EQUAL' ? (
                <View
                  style={[
                    styles.checkbox,
                    selectedMembers.includes(member.userId) && styles.checkboxSelected,
                  ]}
                >
                  {selectedMembers.includes(member.userId) && (
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  )}
                </View>
              ) : (
                <View style={styles.customShareInput}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    value={customShares[member.userId] || ''}
                    onChangeText={(value) => handleCustomShareChange(member.userId, value)}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    style={styles.shareInput}
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        {amount && parseFloat(amount) > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>${parseFloat(amount).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Split Between</Text>
              <Text style={styles.summaryValue}>{selectedMembers.length} people</Text>
            </View>
            {splitType === 'EQUAL' && selectedMembers.length > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Each Pays</Text>
                <Text style={styles.summaryValueHighlight}>
                  ${(parseFloat(amount) / selectedMembers.length).toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Add Expense"
            onPress={handleCreate}
            loading={isLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  currencySymbol: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  activityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    marginRight: spacing.sm,
  },
  activityChipSelected: {
    backgroundColor: colors.primary.main,
  },
  activityChipText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  activityChipTextSelected: {
    color: colors.white,
  },
  splitOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  splitOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    gap: spacing.xs,
  },
  splitOptionSelected: {
    backgroundColor: colors.primary.light,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  splitOptionText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  splitOptionTextSelected: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberDetails: {
    marginLeft: spacing.md,
  },
  memberName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  memberShare: {
    ...typography.caption,
    color: colors.success.main,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  customShareInput: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  currencyPrefix: {
    ...typography.body,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  shareInput: {
    flex: 1,
    marginBottom: 0,
  },
  summaryCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  summaryValueHighlight: {
    ...typography.h3,
    color: colors.primary.main,
  },
  buttonContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
