import api from '../config/api';

export const expenseService = {
  getExpenses: async (planId) => {
    const response = await api.get(`/plans/${planId}/expenses`);
    return response.data;
  },

  createExpense: async (planId, expenseData) => {
    const response = await api.post(`/plans/${planId}/expenses`, expenseData);
    return response.data;
  },

  updateExpense: async (expenseId, expenseData) => {
    const response = await api.put(`/expenses/${expenseId}`, expenseData);
    return response.data;
  },

  deleteExpense: async (expenseId) => {
    const response = await api.delete(`/expenses/${expenseId}`);
    return response.data;
  },

  // Settle a user's share of an expense
  settleExpense: async (expenseId, userId) => {
    const response = await api.post(`/expenses/${expenseId}/settle/${userId}`);
    return response.data;
  },

  // Get expense summary for a plan
  getExpenseSummary: async (planId) => {
    const response = await api.get(`/plans/${planId}/expenses/summary`);
    return response.data;
  },

  // Get user's debts for a plan
  getUserDebts: async (planId) => {
    const response = await api.get(`/plans/${planId}/expenses/debts`);
    return response.data;
  },
};
