import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { expenseService } from '../../services';
import { usePlanStore, useAuthStore } from '../../stores';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Avatar } from '../../components/ui/Avatar';
import { Expense, ExpenseSummary } from '../../types';

export default function ExpensesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { currentPlan, fetchPlanById } = usePlanStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    
    try {
      const [expensesRes, summaryRes] = await Promise.all([
        expenseService.getExpenses(id),
        expenseService.getSummary(id),
        fetchPlanById(id),
      ]);
      
      setExpenses(expensesRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [id]);

  const myBalance = summary?.balances.find((b) => b.user.id === user?.id);

  const renderExpense = ({ item }: { item: Expense }) => {
    const isPaidByMe = item.paidById === user?.id;
    const myShare = item.shares.find((s) => s.userId === user?.id);

    return (
      <TouchableOpacity
        style={styles.expenseCard}
        onPress={() => router.push(`/plans/${id}/expenses/${item.id}`)}
      >
        <View style={styles.expenseIcon}>
          <Ionicons name="receipt-outline" size={20} color={colors.text} />
        </View>
        <View style={styles.expenseContent}>
          <Text style={styles.expenseTitle}>{item.title}</Text>
          <View style={styles.expenseMeta}>
            <Text style={styles.expensePaidBy}>
              Paid by {isPaidByMe ? 'you' : item.paidBy.displayName || item.paidBy.username}
            </Text>
            {item.activity && (
              <Text style={styles.expenseActivity}>• {item.activity.name}</Text>
            )}
          </View>
        </View>
        <View style={styles.expenseAmount}>
          <Text style={styles.totalAmount}>
            {item.currency} {item.amount.toFixed(2)}
          </Text>
          {myShare && !isPaidByMe && (
            <Text style={[styles.myShare, myShare.isPaid && styles.paidShare]}>
              {myShare.isPaid ? 'Settled' : `You owe ${item.currency} ${myShare.amount.toFixed(2)}`}
            </Text>
          )}
          {isPaidByMe && (
            <Text style={styles.myShare}>You paid</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expenses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push(`/plans/${id}/expenses/create`)}
        >
          <Ionicons name="add" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      {summary && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Total Spent</Text>
            <Text style={styles.summaryAmount}>
              {summary.currency} {summary.totalSpent.toFixed(2)}
            </Text>
          </View>
          
          {myBalance && (
            <View style={styles.balanceContainer}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>You paid</Text>
                <Text style={styles.balanceValue}>
                  {summary.currency} {myBalance.paid.toFixed(2)}
                </Text>
              </View>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Your share</Text>
                <Text style={styles.balanceValue}>
                  {summary.currency} {myBalance.owed.toFixed(2)}
                </Text>
              </View>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Balance</Text>
                <Text
                  style={[
                    styles.balanceValue,
                    myBalance.balance > 0 && styles.positiveBalance,
                    myBalance.balance < 0 && styles.negativeBalance,
                  ]}
                >
                  {myBalance.balance > 0 ? '+' : ''}
                  {summary.currency} {myBalance.balance.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Settlements Overview */}
      {myBalance && (myBalance.outstanding > 0 || myBalance.owedToYou > 0) && (
        <View style={styles.settlementsCard}>
          {myBalance.outstanding > 0 && (
            <View style={styles.settlementRow}>
              <View style={[styles.settlementDot, { backgroundColor: colors.error }]} />
              <Text style={styles.settlementText}>
                You owe {summary?.currency} {myBalance.outstanding.toFixed(2)}
              </Text>
            </View>
          )}
          {myBalance.owedToYou > 0 && (
            <View style={styles.settlementRow}>
              <View style={[styles.settlementDot, { backgroundColor: colors.success }]} />
              <Text style={styles.settlementText}>
                Others owe you {summary?.currency} {myBalance.owedToYou.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Expenses List */}
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpense}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="wallet-outline"
            title="No Expenses Yet"
            message="Add expenses to split costs with your group"
            actionLabel="Add Expense"
            onAction={() => router.push(`/plans/${id}/expenses/create`)}
          />
        }
      />
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
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text,
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    ...typography.h1,
    color: colors.text,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  balanceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  balanceValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  positiveBalance: {
    color: colors.success,
  },
  negativeBalance: {
    color: colors.error,
  },
  settlementsCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  settlementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settlementDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  settlementText: {
    ...typography.body,
    color: colors.text,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  expenseContent: {
    flex: 1,
  },
  expenseTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  expenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  expensePaidBy: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  expenseActivity: {
    ...typography.caption,
    color: colors.textTertiary,
    marginLeft: spacing.xs,
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  myShare: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  paidShare: {
    color: colors.success,
  },
});
