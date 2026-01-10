import api from './api';
import { ApiResponse, Expense, ExpenseSummary, SplitType } from '../types';

export interface CreateExpenseData {
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  splitType?: SplitType;
  activityId?: string;
  shares: {
    userId: string;
    amount?: number;
  }[];
  receipt?: FormData;
}

export interface UpdateExpenseData {
  title?: string;
  description?: string;
  amount?: number;
  splitType?: SplitType;
}

export const expenseService = {
  getExpenses: async (planId: string): Promise<ApiResponse<Expense[]>> => {
    const response = await api.get(`/plans/${planId}/expenses`);
    return response.data;
  },

  getExpenseById: async (planId: string, expenseId: string): Promise<ApiResponse<Expense>> => {
    const response = await api.get(`/plans/${planId}/expenses/${expenseId}`);
    return response.data;
  },

  createExpense: async (planId: string, data: CreateExpenseData): Promise<ApiResponse<Expense>> => {
    const response = await api.post(`/plans/${planId}/expenses`, data);
    return response.data;
  },

  updateExpense: async (
    planId: string,
    expenseId: string,
    data: UpdateExpenseData
  ): Promise<ApiResponse<Expense>> => {
    const response = await api.put(`/plans/${planId}/expenses/${expenseId}`, data);
    return response.data;
  },

  deleteExpense: async (planId: string, expenseId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/plans/${planId}/expenses/${expenseId}`);
    return response.data;
  },

  getSummary: async (planId: string): Promise<ApiResponse<ExpenseSummary>> => {
    const response = await api.get(`/plans/${planId}/expenses/summary`);
    return response.data;
  },

  settleShare: async (planId: string, shareId: string): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.put(`/plans/${planId}/expenses/shares/${shareId}/settle`);
    return response.data;
  },
};
