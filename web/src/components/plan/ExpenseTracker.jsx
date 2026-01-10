import { useState, useEffect } from 'react';
import { Plus, DollarSign, Users as UsersIcon, Check, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { expenseService } from '../../services/expenseService';
import { formatDate } from '../../utils/dateUtils';
import useAuthStore from '../../stores/authStore';
import theme from '../../theme';

const ExpenseTracker = ({ planId }) => {
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses', 'balances', 'settle'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    splitType: 'EQUAL',
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const fetchData = async () => {
    try {
      const [expensesRes, summaryRes, debtsRes] = await Promise.all([
        expenseService.getExpenses(planId),
        expenseService.getExpenseSummary(planId),
        expenseService.getUserDebts(planId),
      ]);
      setExpenses(expensesRes.data?.items || []);
      setSummary(summaryRes.data || null);
      setDebts(debtsRes.data || []);
    } catch (error) {
      console.error('Failed to load expense data:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    try {
      await expenseService.createExpense(planId, {
        title: formData.title,
        description: formData.description || undefined,
        amount: parseFloat(formData.amount),
        splitType: formData.splitType,
      });
      toast.success('Expense added successfully');
      setShowExpenseForm(false);
      setFormData({ title: '', description: '', amount: '', splitType: 'EQUAL' });
      fetchData();
    } catch (error) {
      console.error('Failed to add expense:', error);
      toast.error(error.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleSettleShare = async (expenseId, shareUserId) => {
    try {
      await expenseService.settleExpense(expenseId, shareUserId);
      toast.success('Share settled successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to settle share:', error);
      toast.error('Failed to settle share');
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  
  // Calculate what current user owes and is owed
  const myBalance = summary?.balances?.find(b => b.user?.id === user?.id);
  const youOwe = debts.reduce((sum, debt) => sum + debt.totalOwed, 0);
  const youAreOwed = myBalance?.owedToYou || 0;

  // Calculate settlements (who owes whom)
  const calculateSettlements = () => {
    if (!summary?.balances) return [];
    
    const settlements = [];
    const balances = summary.balances.map(b => ({
      ...b,
      netBalance: b.balance
    })).sort((a, b) => a.netBalance - b.netBalance);

    // Simple settlement algorithm
    let i = 0; // owes money (negative balance)
    let j = balances.length - 1; // is owed money (positive balance)

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

  const tabs = [
    { id: 'expenses', label: 'Expenses' },
    { id: 'balances', label: 'Balances' },
    { id: 'settle', label: 'Settle Up' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
        <Button onClick={() => setShowExpenseForm(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Spent</div>
              <div className="text-2xl font-bold text-gray-900">
                ${totalExpenses.toFixed(2)}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.colors.primary.main}20` }}>
              <DollarSign className="w-6 h-6" style={{ color: theme.colors.primary.main }} />
            </div>
          </div>
        </Card>
        
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">You Owe</div>
              <div className="text-2xl font-bold text-red-600">
                ${youOwe.toFixed(2)}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">You Are Owed</div>
              <div className="text-2xl font-bold text-green-600">
                ${youAreOwed.toFixed(2)}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Net Balance</div>
              <div className={`text-2xl font-bold ${(youAreOwed - youOwe) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(youAreOwed - youOwe) >= 0 ? '+' : '-'}${Math.abs(youAreOwed - youOwe).toFixed(2)}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading expenses...</div>
      ) : (
        <>
          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            expenses.length === 0 ? (
              <Card className="p-12 text-center">
                <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No expenses yet</h3>
                <p className="text-gray-600">Start tracking your group expenses</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => {
                  const isPaidByMe = expense.paidBy?.id === user?.id;
                  const myShare = expense.shares?.find(s => s.userId === user?.id);
                  
                  return (
                    <Card key={expense.id} className="p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {expense.title}
                          </h3>
                          {expense.description && (
                            <p className="text-sm text-gray-500 mb-2">{expense.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>
                              Paid by <span className="font-medium">{isPaidByMe ? 'You' : (expense.paidBy?.displayName || expense.paidBy?.username)}</span>
                            </span>
                            <span>•</span>
                            <span>{formatDate(expense.createdAt)}</span>
                          </div>
                          
                          {/* Split Details */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500 mb-2">Split ({expense.splitType})</div>
                            <div className="flex flex-wrap gap-2">
                              {expense.shares?.map((share) => (
                                <div 
                                  key={share.userId}
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    share.isPaid 
                                      ? 'bg-green-100 text-green-700' 
                                      : share.userId === user?.id && !isPaidByMe
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {share.user?.displayName || share.user?.username}: ${share.amount.toFixed(2)}
                                  {share.isPaid && ' ✓'}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-gray-900">
                            ${parseFloat(expense.amount).toFixed(2)}
                          </div>
                          {isPaidByMe ? (
                            <div className="text-sm text-green-600 mt-1">You paid</div>
                          ) : myShare && !myShare.isPaid ? (
                            <div className="text-sm text-red-600 mt-1">
                              You owe ${myShare.amount.toFixed(2)}
                            </div>
                          ) : myShare?.isPaid ? (
                            <div className="text-sm text-green-600 mt-1">✓ Settled</div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )
          )}

          {/* Balances Tab */}
          {activeTab === 'balances' && (
            <div className="space-y-4">
              <Card className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Balances</h3>
                {summary?.balances?.length > 0 ? (
                  <div className="space-y-3">
                    {summary.balances.map((balance) => {
                      const isMe = balance.user?.id === user?.id;
                      const netBalance = balance.balance;
                      
                      return (
                        <div key={balance.user?.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                              {(balance.user?.displayName || balance.user?.username || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {isMe ? 'You' : (balance.user?.displayName || balance.user?.username)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Paid: ${balance.paid.toFixed(2)} • Share: ${balance.owed.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div className={`text-right ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <div className="font-bold">
                              {netBalance >= 0 ? '+' : '-'}${Math.abs(netBalance).toFixed(2)}
                            </div>
                            <div className="text-xs">
                              {netBalance >= 0 ? 'gets back' : 'owes'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No balance data available</p>
                )}
              </Card>

              {/* Who Owes You */}
              {myBalance?.owedToYou > 0 && (
                <Card className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                    People Who Owe You
                  </h3>
                  <div className="space-y-3">
                    {expenses
                      .filter(exp => exp.paidBy?.id === user?.id)
                      .flatMap(exp => exp.shares?.filter(s => s.userId !== user?.id && !s.isPaid) || [])
                      .reduce((acc, share) => {
                        const existing = acc.find(a => a.userId === share.userId);
                        if (existing) {
                          existing.amount += share.amount;
                          existing.shares.push(share);
                        } else {
                          acc.push({
                            userId: share.userId,
                            user: share.user,
                            amount: share.amount,
                            shares: [share]
                          });
                        }
                        return acc;
                      }, [])
                      .map((debt) => (
                        <div key={debt.userId} className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-medium">
                              {(debt.user?.displayName || debt.user?.username || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {debt.user?.displayName || debt.user?.username}
                              </div>
                              <div className="text-xs text-gray-500">
                                {debt.shares.length} expense(s)
                              </div>
                            </div>
                          </div>
                          <div className="text-green-600 font-bold">
                            owes you ${debt.amount.toFixed(2)}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </Card>
              )}

              {/* What You Owe */}
              {debts.length > 0 && (
                <Card className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
                    People You Owe
                  </h3>
                  <div className="space-y-3">
                    {debts.map((debt) => (
                      <div key={debt.user?.id} className="p-3 rounded-xl bg-red-50 border border-red-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-medium">
                              {(debt.user?.displayName || debt.user?.username || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {debt.user?.displayName || debt.user?.username}
                              </div>
                              <div className="text-xs text-gray-500">
                                {debt.expenses?.length} expense(s)
                              </div>
                            </div>
                          </div>
                          <div className="text-red-600 font-bold">
                            you owe ${debt.totalOwed.toFixed(2)}
                          </div>
                        </div>
                        {/* Expense breakdown */}
                        <div className="mt-2 pt-2 border-t border-red-100">
                          {debt.expenses?.map((exp) => (
                            <div key={exp.id} className="flex justify-between text-sm text-gray-600 py-1">
                              <span>{exp.title}</span>
                              <span>${exp.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Settle Up Tab */}
          {activeTab === 'settle' && (
            <div className="space-y-4">
              <Card className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Settlements</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Simplify debts by making these payments to settle up
                </p>
                
                {settlements.length > 0 ? (
                  <div className="space-y-3">
                    {settlements.map((settlement, idx) => {
                      const isFromMe = settlement.from?.id === user?.id;
                      const isToMe = settlement.to?.id === user?.id;
                      
                      return (
                        <div 
                          key={idx} 
                          className={`flex items-center justify-between p-4 rounded-xl border ${
                            isFromMe ? 'bg-red-50 border-red-200' : isToMe ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium">
                              {(settlement.from?.displayName || settlement.from?.username || '?')[0].toUpperCase()}
                            </div>
                            <div className="font-medium">
                              {isFromMe ? 'You' : (settlement.from?.displayName || settlement.from?.username)}
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium">
                              {(settlement.to?.displayName || settlement.to?.username || '?')[0].toUpperCase()}
                            </div>
                            <div className="font-medium">
                              {isToMe ? 'You' : (settlement.to?.displayName || settlement.to?.username)}
                            </div>
                          </div>
                          <div className={`font-bold text-lg ${isFromMe ? 'text-red-600' : isToMe ? 'text-green-600' : 'text-gray-900'}`}>
                            ${settlement.amount}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Check className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">All Settled Up!</h4>
                    <p className="text-gray-500">No pending settlements in this group</p>
                  </div>
                )}
              </Card>

              {/* Mark as Settled Section */}
              {expenses.some(exp => exp.paidBy?.id === user?.id && exp.shares?.some(s => !s.isPaid && s.userId !== user?.id)) && (
                <Card className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark Payments as Received</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Mark shares as settled when someone pays you back
                  </p>
                  <div className="space-y-3">
                    {expenses
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
                        <div key={`${share.expense.id}-${share.userId}`} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium">
                              {(share.user?.displayName || share.user?.username || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {share.user?.displayName || share.user?.username}
                              </div>
                              <div className="text-xs text-gray-500">
                                {share.expense.title} • ${share.amount.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleSettleShare(share.expense.id, share.userId)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Mark Settled
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Expense Modal */}
      {showExpenseForm && (
        <Modal
          isOpen={showExpenseForm}
          onClose={() => setShowExpenseForm(false)}
          title="Add Expense"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Expense title"
              required
            />
            <Input
              label="Description (optional)"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional details"
            />
            <Input
              label="Amount"
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              icon={DollarSign}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Split Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="splitType"
                    value="EQUAL"
                    checked={formData.splitType === 'EQUAL'}
                    onChange={(e) => setFormData(prev => ({ ...prev, splitType: e.target.value }))}
                    className="mr-2"
                  />
                  <span>Split Equally</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="splitType"
                    value="CUSTOM"
                    checked={formData.splitType === 'CUSTOM'}
                    onChange={(e) => setFormData(prev => ({ ...prev, splitType: e.target.value }))}
                    className="mr-2"
                  />
                  <span>Custom Split</span>
                </label>
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowExpenseForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Expense
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ExpenseTracker;
