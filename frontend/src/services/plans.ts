import api from './api';
import {
  ApiResponse,
  Plan,
  PlanMember,
  Activity,
  PaginatedResponse,
  PlanCategory,
  PlanType,
  MemberRole,
} from '../types';

export interface CreatePlanData {
  name: string;
  description?: string;
  category: PlanCategory;
  type?: PlanType;
  startDate?: string;
  endDate?: string;
}

export interface UpdatePlanData extends Partial<CreatePlanData> {
  status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface PlanFilters {
  category?: PlanCategory;
  type?: PlanType;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateActivityData {
  name: string;
  description?: string;
  date?: string;
  time?: string;
  locationName?: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

export const planService = {
  // Plan CRUD
  getPlans: async (filters?: PlanFilters): Promise<ApiResponse<PaginatedResponse<Plan>>> => {
    const response = await api.get('/plans', { params: filters });
    return response.data;
  },

  getPublicPlans: async (filters?: PlanFilters): Promise<ApiResponse<PaginatedResponse<Plan>>> => {
    const response = await api.get('/plans/discover', { params: filters });
    return response.data;
  },

  getPlanById: async (planId: string): Promise<ApiResponse<Plan>> => {
    const response = await api.get(`/plans/${planId}`);
    return response.data;
  },

  createPlan: async (data: CreatePlanData): Promise<ApiResponse<Plan>> => {
    const response = await api.post('/plans', data);
    return response.data;
  },

  updatePlan: async (planId: string, data: UpdatePlanData): Promise<ApiResponse<Plan>> => {
    const response = await api.put(`/plans/${planId}`, data);
    return response.data;
  },

  deletePlan: async (planId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/plans/${planId}`);
    return response.data;
  },

  updateCoverImage: async (planId: string, formData: FormData): Promise<ApiResponse<Plan>> => {
    const response = await api.put(`/plans/${planId}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  regenerateInviteCode: async (planId: string): Promise<ApiResponse<{ inviteCode: string }>> => {
    const response = await api.post(`/plans/${planId}/regenerate-code`);
    return response.data;
  },

  // Member management
  getMembers: async (planId: string): Promise<ApiResponse<PlanMember[]>> => {
    const response = await api.get(`/plans/${planId}/members`);
    return response.data;
  },

  updateMemberRole: async (
    planId: string,
    memberId: string,
    role: MemberRole
  ): Promise<ApiResponse<PlanMember>> => {
    const response = await api.put(`/plans/${planId}/members/${memberId}`, { role });
    return response.data;
  },

  removeMember: async (planId: string, memberId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/plans/${planId}/members/${memberId}`);
    return response.data;
  },

  leavePlan: async (planId: string): Promise<ApiResponse<null>> => {
    const response = await api.post(`/plans/${planId}/leave`);
    return response.data;
  },

  // Activity management
  getActivities: async (planId: string): Promise<ApiResponse<Activity[]>> => {
    const response = await api.get(`/plans/${planId}/activities`);
    return response.data;
  },

  getActivityById: async (planId: string, activityId: string): Promise<ApiResponse<Activity>> => {
    const response = await api.get(`/plans/${planId}/activities/${activityId}`);
    return response.data;
  },

  createActivity: async (planId: string, data: CreateActivityData): Promise<ApiResponse<Activity>> => {
    const response = await api.post(`/plans/${planId}/activities`, data);
    return response.data;
  },

  updateActivity: async (
    planId: string,
    activityId: string,
    data: Partial<CreateActivityData>
  ): Promise<ApiResponse<Activity>> => {
    const response = await api.put(`/plans/${planId}/activities/${activityId}`, data);
    return response.data;
  },

  deleteActivity: async (planId: string, activityId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/plans/${planId}/activities/${activityId}`);
    return response.data;
  },

  reorderActivities: async (
    planId: string,
    activityIds: string[]
  ): Promise<ApiResponse<Activity[]>> => {
    const response = await api.put(`/plans/${planId}/activities/reorder`, { activityIds });
    return response.data;
  },
};
