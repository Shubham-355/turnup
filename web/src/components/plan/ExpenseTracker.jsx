import { useState, useEffect } from 'react';
import { Plus, DollarSign, Users as UsersIcon, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { expenseService } from '../../services/expenseService';
import { formatDate } from '../../utils/dateUtils';
import useAuthStore from '../../stores/authStore';

const ExpenseTracker = ({ planId }) => {
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    splitType: 'equal',
  });

  useEffect(() => {
    fetchExpenses();
  }, [planId]);

  const fetchExpenses = async () => {
    try {
      const response = await expenseService.getExpenses(planId);
      setExpenses(response.data?.items || []);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    try {
      await expenseService.createExpense(planId, {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      toast.success('Expense added successfully');
      setShowExpenseForm(false);
      setFormData({ description: '', amount: '', splitType: 'equal' });
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to add expense');
    }
  };

  const handleSettleExpense = async (expenseId) => {
    try {
      await expenseService.settleExpense(expenseId, user?.id);
      toast.success('Expense settled');
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to settle expense');
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const userBalance = expenses.reduce((balance, exp) => {
    if (exp.paidBy?.id === user?.id) {
      return balance + parseFloat(exp.amount || 0);
    }
    const split = exp.splits?.find(s => s.userId === user?.id);
    if (split) {
      return balance - parseFloat(split.amount || 0);
    }
    return balance;
  }, 0);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Your Balance</div>
          <div className={`text-2xl font-bold ${userBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(userBalance).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {userBalance >= 0 ? 'You are owed' : 'You owe'}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-gray-900">{expenses.length}</div>
        </Card>
      </div>

      {/* Expenses List */}
      {loading ? (
        <div className="text-center py-12">Loading expenses...</div>
      ) : expenses.length === 0 ? (
        <Card className="p-12 text-center">
          <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No expenses yet</h3>
          <p className="text-gray-600">Start tracking your group expenses</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <Card key={expense.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {expense.description}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Paid by: {expense.paidBy?.name}</div>
                    <div>Split: {expense.splitType}</div>
                    <div>{formatDate(expense.createdAt)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${parseFloat(expense.amount).toFixed(2)}
                  </div>
                  {!expense.settled && expense.paidBy?.id !== user?.id && (
                    <Button
                      size="sm"
                      variant="success"
                      className="mt-2"
                      onClick={() => handleSettleExpense(expense.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Settle
                    </Button>
                  )}
                  {expense.settled && (
                    <div className="text-sm text-green-600 mt-2">✓ Settled</div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
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
              label="Description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What was this for?"
              required
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
                    value="equal"
                    checked={formData.splitType === 'equal'}
                    onChange={(e) => setFormData(prev => ({ ...prev, splitType: e.target.value }))}
                    className="mr-2"
                  />
                  <span>Split Equally</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="splitType"
                    value="custom"
                    checked={formData.splitType === 'custom'}
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
