import api from './api';
import { ApiResponse, Media, PaginatedResponse } from '../types';

export interface MediaFilters {
  type?: 'IMAGE' | 'VIDEO';
  activityId?: string;
  page?: number;
  limit?: number;
}

export const mediaService = {
  getMedia: async (
    planId: string,
    filters?: MediaFilters
  ): Promise<ApiResponse<PaginatedResponse<Media>>> => {
    const response = await api.get(`/plans/${planId}/media`, { params: filters });
    return response.data;
  },

  uploadMedia: async (
    planId: string,
    formData: FormData,
    activityId?: string
  ): Promise<ApiResponse<Media>> => {
    if (activityId) {
      formData.append('activityId', activityId);
    }
    const response = await api.post(`/plans/${planId}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateCaption: async (
    planId: string,
    mediaId: string,
    caption: string
  ): Promise<ApiResponse<Media>> => {
    const response = await api.put(`/plans/${planId}/media/${mediaId}`, { caption });
    return response.data;
  },

  deleteMedia: async (planId: string, mediaId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/plans/${planId}/media/${mediaId}`);
    return response.data;
  },
};
