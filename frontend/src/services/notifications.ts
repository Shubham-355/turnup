import api from './api';
import { ApiResponse, Notification, PaginatedResponse } from '../types';

export interface NotificationFilters {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

export const notificationService = {
  getNotifications: async (
    filters?: NotificationFilters
  ): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
    const response = await api.get('/notifications', { params: filters });
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<ApiResponse<Notification>> => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
};
