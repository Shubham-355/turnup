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

  settleExpense: async (expenseId) => {
    const response = await api.post(`/expenses/${expenseId}/settle`);
    return response.data;
  },
};
