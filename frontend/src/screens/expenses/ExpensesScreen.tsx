import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../theme';
import { expenseService } from '../../services';
import { usePlanStore, useAuthStore } from '../../stores';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Expense, ExpenseSummary, User } from '../../types';

type TabType = 'expenses' | 'balances' | 'settle';

interface DebtInfo {
  user: User;
  totalOwed: number;
  expenses: {
    id: string;
    title: string;
    amount: number;
    currency: string;
  }[];
}

interface Settlement {
  from: User;
  to: User;
  amount: string;
}

// Flat color values for easier use
const PRIMARY = '#FF6B35';
const ACCENT = '#10B981';
const ERROR = '#EF4444';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const SURFACE = '#F9FAFB';
const BORDER = '#E5E7EB';
const BACKGROUND = '#FFFFFF';

export default function ExpensesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { fetchPlanById } = usePlanStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [debts, setDebts] = useState<DebtInfo[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('expenses');

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    
    try {
      const [expensesRes, summaryRes, debtsRes] = await Promise.all([
        expenseService.getExpenses(id),
        expenseService.getSummary(id),
        expenseService.getUserDebts(id),
        fetchPlanById(id),
      ]);
      
      // API returns paginated response: { success, message, data: { items, pagination } }
      // expensesRes = { success, message, data } where data = { items, pagination }
      const expensesData = expensesRes?.data as unknown;
      let expensesList: Expense[] = [];
      if (Array.isArray(expensesData)) {
        expensesList = expensesData;
      } else if (expensesData && typeof expensesData === 'object' && 'items' in expensesData) {
        expensesList = (expensesData as { items: Expense[] }).items || [];
      }
      setExpenses(expensesList);
      setSummary(summaryRes?.data || null);
      setDebts(Array.isArray(debtsRes?.data) ? debtsRes.data : []);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, fetchPlanById]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleSettleShare = async (expenseId: string, shareUserId: string) => {
    try {
      await expenseService.settleShare(expenseId, shareUserId);
      loadData();
    } catch (error) {
      console.error('Failed to settle share:', error);
    }
  };

  const myBalance = summary?.balances?.find((b) => b.user.id === user?.id);
  const youOwe = debts.reduce((sum, debt) => sum + debt.totalOwed, 0);
  const youAreOwed = myBalance?.owedToYou || 0;

  // Calculate settlements
  const calculateSettlements = (): Settlement[] => {
    if (!summary?.balances) return [];
    
    const settlements: Settlement[] = [];
    const balances = summary.balances.map(b => ({
      ...b,
      netBalance: b.balance
    })).sort((a, b) => a.netBalance - b.netBalance);

    let i = 0;
    let j = balances.length - 1;

    while (i < j) {
      const debtor = balances[i];
      const creditor = balances[j];

      if (debtor.netBalance >= 0) break;
      if (creditor.netBalance <= 0) break;

      const amount = Math.min(-debtor.netBalance, creditor.netBalance);
      
      if (amount > 0.01) {
        settlements.push({
          from: debtor.user,
          to: creditor.user,
          amount: amount.toFixed(2)
        });
      }

      debtor.netBalance += amount;
      creditor.netBalance -= amount;

      if (Math.abs(debtor.netBalance) < 0.01) i++;
      if (Math.abs(creditor.netBalance) < 0.01) j--;
    }

    return settlements;
  };

  const settlements = calculateSettlements();

  const renderExpense = ({ item }: { item: Expense }) => {
    const isPaidByMe = item.paidById === user?.id;
    const myShare = item.shares?.find((s) => s.userId === user?.id);

    return (
      <View style={styles.expenseCard}>
        <View style={styles.expenseIcon}>
          <Ionicons name="receipt-outline" size={20} color={PRIMARY} />
        </View>
        <View style={styles.expenseContent}>
          <Text style={styles.expenseTitle}>{item.title}</Text>
          <Text style={styles.expensePaidBy}>
            Paid by {isPaidByMe ? 'you' : item.paidBy?.displayName || item.paidBy?.username || 'Unknown'}
          </Text>
          {/* Split breakdown */}
          <View style={styles.sharesContainer}>
            {item.shares?.map((share) => (
              <View 
                key={share.userId}
                style={[
                  styles.shareBadge,
                  share.isPaid && styles.shareBadgePaid,
                  !share.isPaid && share.userId === user?.id && !isPaidByMe && styles.shareBadgeOwed
                ]}
              >
                <Text style={[
                  styles.shareBadgeText,
                  share.isPaid && styles.shareBadgeTextPaid,
                  !share.isPaid && share.userId === user?.id && !isPaidByMe && styles.shareBadgeTextOwed
                ]}>
                  {share.user?.displayName?.[0] || share.user?.username?.[0] || '?'}: ${share.amount.toFixed(2)}
                  {share.isPaid && ' ✓'}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.expenseAmount}>
          <Text style={styles.totalAmount}>
            {item.currency} {item.amount.toFixed(2)}
          </Text>
          {isPaidByMe ? (
            <Text style={[styles.myShare, { color: ACCENT }]}>You paid</Text>
          ) : myShare && !myShare.isPaid ? (
            <Text style={[styles.myShare, { color: ERROR }]}>
              You owe ${myShare.amount.toFixed(2)}
            </Text>
          ) : myShare?.isPaid ? (
            <Text style={[styles.myShare, { color: ACCENT }]}>✓ Settled</Text>
          ) : null}
        </View>
      </View>
    );
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'expenses', label: 'Expenses' },
    { id: 'balances', label: 'Balances' },
    { id: 'settle', label: 'Settle Up' },
  ];

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expenses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push(`/plans/${id}/expenses/create`)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll}>
        <View style={styles.summaryCardsRow}>
          <View style={[styles.summaryCard, { backgroundColor: `${PRIMARY}15` }]}>
            <Ionicons name="wallet-outline" size={24} color={PRIMARY} />
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryValue}>${(summary?.totalSpent || 0).toFixed(2)}</Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="trending-down-outline" size={24} color={ERROR} />
            <Text style={styles.summaryLabel}>You Owe</Text>
            <Text style={[styles.summaryValue, { color: ERROR }]}>${youOwe.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="trending-up-outline" size={24} color={ACCENT} />
            <Text style={styles.summaryLabel}>You are Owed</Text>
            <Text style={[styles.summaryValue, { color: ACCENT }]}>${youAreOwed.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: SURFACE }]}>
            <Ionicons name="swap-horizontal-outline" size={24} color={TEXT_SECONDARY} />
            <Text style={styles.summaryLabel}>Net Balance</Text>
            <Text style={[
              styles.summaryValue, 
              { color: (youAreOwed - youOwe) >= 0 ? ACCENT : ERROR }
            ]}>
              {(youAreOwed - youOwe) >= 0 ? '+' : '-'}${Math.abs(youAreOwed - youOwe).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content based on active tab */}
      {activeTab === 'expenses' && (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={renderExpense}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={PRIMARY}
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
      )}

      {activeTab === 'balances' && (
        <ScrollView 
          style={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />
          }
        >
          {/* Group Balances */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Group Balances</Text>
            {summary?.balances?.map((balance) => {
              const isMe = balance.user?.id === user?.id;
              const netBalance = balance.balance;
              
              return (
                <View key={balance.user?.id} style={styles.balanceRow}>
                  <View style={styles.balanceUserInfo}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {(balance.user?.displayName || balance.user?.username || '?')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.balanceUserName}>
                        {isMe ? 'You' : (balance.user?.displayName || balance.user?.username)}
                      </Text>
                      <Text style={styles.balanceDetails}>
                        Paid: ${balance.paid.toFixed(2)} • Share: ${balance.owed.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.balanceAmountContainer}>
                    <Text style={[
                      styles.balanceAmount,
                      { color: netBalance >= 0 ? ACCENT : ERROR }
                    ]}>
                      {netBalance >= 0 ? '+' : '-'}${Math.abs(netBalance).toFixed(2)}
                    </Text>
                    <Text style={styles.balanceStatus}>
                      {netBalance >= 0 ? 'gets back' : 'owes'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* People Who Owe You */}
          {youAreOwed > 0 && (
            <View style={[styles.sectionCard, { backgroundColor: '#D1FAE5' }]}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="trending-up-outline" size={20} color={ACCENT} />
                <Text style={[styles.sectionTitle, { color: ACCENT, marginBottom: 0, marginLeft: 8 }]}>
                  People Who Owe You
                </Text>
              </View>
              {(expenses || [])
                .filter(exp => exp.paidBy?.id === user?.id)
                .flatMap(exp => exp.shares?.filter(s => s.userId !== user?.id && !s.isPaid) || [])
                .reduce((acc: { userId: string; user: User; amount: number }[], share) => {
                  const existing = acc.find(a => a.userId === share.userId);
                  if (existing) {
                    existing.amount += share.amount;
                  } else {
                    acc.push({
                      userId: share.userId,
                      user: share.user,
                      amount: share.amount,
                    });
                  }
                  return acc;
                }, [])
                .map((debt) => (
                  <View key={debt.userId} style={styles.debtRow}>
                    <View style={styles.debtUserInfo}>
                      <View style={[styles.avatarPlaceholder, { backgroundColor: '#A7F3D0' }]}>
                        <Text style={[styles.avatarText, { color: ACCENT }]}>
                          {(debt.user?.displayName || debt.user?.username || '?')[0].toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.debtUserName}>
                        {debt.user?.displayName || debt.user?.username}
                      </Text>
                    </View>
                    <Text style={[styles.debtAmount, { color: ACCENT }]}>
                      owes you ${debt.amount.toFixed(2)}
                    </Text>
                  </View>
                ))
              }
            </View>
          )}

          {/* People You Owe */}
          {debts.length > 0 && (
            <View style={[styles.sectionCard, { backgroundColor: '#FEE2E2' }]}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="trending-down-outline" size={20} color={ERROR} />
                <Text style={[styles.sectionTitle, { color: ERROR, marginBottom: 0, marginLeft: 8 }]}>
                  People You Owe
                </Text>
              </View>
              {debts.map((debt) => (
                <View key={debt.user?.id} style={styles.debtCard}>
                  <View style={styles.debtRow}>
                    <View style={styles.debtUserInfo}>
                      <View style={[styles.avatarPlaceholder, { backgroundColor: '#FECACA' }]}>
                        <Text style={[styles.avatarText, { color: ERROR }]}>
                          {(debt.user?.displayName || debt.user?.username || '?')[0].toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.debtUserName}>
                        {debt.user?.displayName || debt.user?.username}
                      </Text>
                    </View>
                    <Text style={[styles.debtAmount, { color: ERROR }]}>
                      you owe ${debt.totalOwed.toFixed(2)}
                    </Text>
                  </View>
                  {/* Expense breakdown */}
                  <View style={styles.debtBreakdown}>
                    {debt.expenses?.map((exp) => (
                      <View key={exp.id} style={styles.debtExpenseRow}>
                        <Text style={styles.debtExpenseTitle}>{exp.title}</Text>
                        <Text style={styles.debtExpenseAmount}>${exp.amount.toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'settle' && (
        <ScrollView 
          style={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />
          }
        >
          {/* Suggested Settlements */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Suggested Settlements</Text>
            <Text style={styles.sectionSubtitle}>
              Simplify debts by making these payments
            </Text>
            
            {settlements.length > 0 ? (
              settlements.map((settlement, idx) => {
                const isFromMe = settlement.from?.id === user?.id;
                const isToMe = settlement.to?.id === user?.id;
                
                return (
                  <View 
                    key={idx} 
                    style={[
                      styles.settlementCard,
                      isFromMe && { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
                      isToMe && { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' },
                    ]}
                  >
                    <View style={styles.settlementUsers}>
                      <View style={styles.settlementUser}>
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>
                            {(settlement.from?.displayName || settlement.from?.username || '?')[0].toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.settlementUserName}>
                          {isFromMe ? 'You' : (settlement.from?.displayName || settlement.from?.username)}
                        </Text>
                      </View>
                      <Ionicons name="arrow-forward" size={20} color={TEXT_SECONDARY} />
                      <View style={styles.settlementUser}>
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>
                            {(settlement.to?.displayName || settlement.to?.username || '?')[0].toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.settlementUserName}>
                          {isToMe ? 'You' : (settlement.to?.displayName || settlement.to?.username)}
                        </Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.settlementAmount,
                      { color: isFromMe ? ERROR : isToMe ? ACCENT : TEXT_PRIMARY }
                    ]}>
                      ${settlement.amount}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.allSettledContainer}>
                <Ionicons name="checkmark-circle" size={64} color={ACCENT} />
                <Text style={styles.allSettledTitle}>All Settled Up!</Text>
                <Text style={styles.allSettledSubtitle}>No pending settlements</Text>
              </View>
            )}
          </View>

          {/* Mark as Settled */}
          {(expenses || []).some(exp => exp.paidBy?.id === user?.id && exp.shares?.some(s => !s.isPaid && s.userId !== user?.id)) && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Mark Payments Received</Text>
              <Text style={styles.sectionSubtitle}>
                Mark shares as settled when someone pays you
              </Text>
              
              {(expenses || [])
                .filter(exp => exp.paidBy?.id === user?.id)
                .flatMap(exp => 
                  exp.shares
                    ?.filter(s => !s.isPaid && s.userId !== user?.id)
                    .map(share => ({
                      ...share,
                      expense: exp
                    })) || []
                )
                .map((share) => (
                  <View key={`${share.expense.id}-${share.userId}`} style={styles.settleShareRow}>
                    <View style={styles.settleShareInfo}>
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {(share.user?.displayName || share.user?.username || '?')[0].toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.settleShareName}>
                          {share.user?.displayName || share.user?.username}
                        </Text>
                        <Text style={styles.settleShareDetails}>
                          {share.expense.title} • ${share.amount.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.settleButton}
                      onPress={() => handleSettleShare(share.expense.id, share.userId)}
                    >
                      <Ionicons name="checkmark" size={18} color="#fff" />
                      <Text style={styles.settleButtonText}>Settle</Text>
                    </TouchableOpacity>
                  </View>
                ))
              }
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  } as ViewStyle,
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    flex: 1,
    marginHorizontal: spacing.sm,
  } as TextStyle,
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  summaryScroll: {
    maxHeight: 120,
  } as ViewStyle,
  summaryCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  } as ViewStyle,
  summaryCard: {
    width: 130,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.xs,
  } as ViewStyle,
  summaryLabel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  } as TextStyle,
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  } as TextStyle,
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    backgroundColor: SURFACE,
    borderRadius: borderRadius.lg,
    padding: 4,
  } as ViewStyle,
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  } as ViewStyle,
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,
  tabText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  } as TextStyle,
  tabTextActive: {
    color: TEXT_PRIMARY,
    fontWeight: '600',
  } as TextStyle,
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  } as ViewStyle,
  scrollContent: {
    flex: 1,
    padding: spacing.md,
  } as ViewStyle,
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: SURFACE,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  } as ViewStyle,
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: `${PRIMARY}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  } as ViewStyle,
  expenseContent: {
    flex: 1,
  } as ViewStyle,
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  } as TextStyle,
  expensePaidBy: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  } as TextStyle,
  sharesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: 4,
  } as ViewStyle,
  shareBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: SURFACE,
  } as ViewStyle,
  shareBadgePaid: {
    backgroundColor: '#D1FAE5',
  } as ViewStyle,
  shareBadgeOwed: {
    backgroundColor: '#FEE2E2',
  } as ViewStyle,
  shareBadgeText: {
    fontSize: 10,
    color: TEXT_SECONDARY,
  } as TextStyle,
  shareBadgeTextPaid: {
    color: ACCENT,
  } as TextStyle,
  shareBadgeTextOwed: {
    color: ERROR,
  } as TextStyle,
  expenseAmount: {
    alignItems: 'flex-end',
  } as ViewStyle,
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  } as TextStyle,
  myShare: {
    fontSize: 12,
    marginTop: 2,
  } as TextStyle,
  sectionCard: {
    backgroundColor: SURFACE,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  } as ViewStyle,
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: spacing.sm,
  } as TextStyle,
  sectionSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: spacing.md,
  } as TextStyle,
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  } as ViewStyle,
  balanceUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  } as ViewStyle,
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  } as TextStyle,
  balanceUserName: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  } as TextStyle,
  balanceDetails: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  } as TextStyle,
  balanceAmountContainer: {
    alignItems: 'flex-end',
  } as ViewStyle,
  balanceAmount: {
    fontSize: 16,
    fontWeight: '700',
  } as TextStyle,
  balanceStatus: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  } as TextStyle,
  debtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  } as ViewStyle,
  debtCard: {
    marginBottom: spacing.sm,
  } as ViewStyle,
  debtUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  } as ViewStyle,
  debtUserName: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  } as TextStyle,
  debtAmount: {
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
  debtBreakdown: {
    marginLeft: 44,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  } as ViewStyle,
  debtExpenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  } as ViewStyle,
  debtExpenseTitle: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  } as TextStyle,
  debtExpenseAmount: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  } as TextStyle,
  settlementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: BORDER,
  } as ViewStyle,
  settlementUsers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  } as ViewStyle,
  settlementUser: {
    alignItems: 'center',
    gap: 4,
  } as ViewStyle,
  settlementUserName: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  } as TextStyle,
  settlementAmount: {
    fontSize: 20,
    fontWeight: '700',
  } as TextStyle,
  allSettledContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  } as ViewStyle,
  allSettledTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginTop: spacing.md,
  } as TextStyle,
  allSettledSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: spacing.xs,
  } as TextStyle,
  settleShareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  } as ViewStyle,
  settleShareInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  } as ViewStyle,
  settleShareName: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  } as TextStyle,
  settleShareDetails: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  } as TextStyle,
  settleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: 4,
  } as ViewStyle,
  settleButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  } as TextStyle,
});
