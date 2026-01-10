import api from './api';
import { ApiResponse, UserLocation } from '../types';

export interface UpdateLocationData {
  latitude: number;
  longitude: number;
}

export const locationService = {
  updateLocation: async (
    planId: string,
    data: UpdateLocationData
  ): Promise<ApiResponse<UserLocation>> => {
    const response = await api.put(`/plans/${planId}/location`, data);
    return response.data;
  },

  getMemberLocations: async (planId: string): Promise<ApiResponse<UserLocation[]>> => {
    const response = await api.get(`/plans/${planId}/locations`);
    return response.data;
  },

  stopSharing: async (planId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/plans/${planId}/location`);
    return response.data;
  },
};
