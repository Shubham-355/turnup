import api from './api';
import { ApiResponse, Message, PaginatedResponse, MessageType } from '../types';

export interface SendMessageData {
  content: string;
  type?: MessageType;
  metadata?: any;
}

export interface MessageFilters {
  before?: string;
  after?: string;
  limit?: number;
}

export const chatService = {
  getMessages: async (
    planId: string,
    filters?: MessageFilters
  ): Promise<ApiResponse<PaginatedResponse<Message>>> => {
    const response = await api.get(`/plans/${planId}/messages`, { params: filters });
    return response.data;
  },

  sendMessage: async (planId: string, data: SendMessageData): Promise<ApiResponse<Message>> => {
    const response = await api.post(`/plans/${planId}/messages`, data);
    return response.data;
  },

  deleteMessage: async (planId: string, messageId: string): Promise<ApiResponse<Message>> => {
    const response = await api.delete(`/plans/${planId}/messages/${messageId}`);
    return response.data;
  },

  markAsRead: async (planId: string): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.put(`/plans/${planId}/messages/read`);
    return response.data;
  },
};
