import api from './api';
import { ApiResponse, Invitation, JoinRequest, Plan } from '../types';

export interface SendInvitationData {
  receiverId: string;
}

export interface JoinRequestData {
  message?: string;
}

export const invitationService = {
  // Invitations (sent by plan members)
  sendInvitation: async (
    planId: string,
    data: SendInvitationData
  ): Promise<ApiResponse<Invitation>> => {
    const response = await api.post(`/plans/${planId}/invitations`, data);
    return response.data;
  },

  getReceivedInvitations: async (): Promise<ApiResponse<Invitation[]>> => {
    const response = await api.get('/invitations/received');
    return response.data;
  },

  respondToInvitation: async (
    invitationId: string,
    accept: boolean
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.put(`/invitations/${invitationId}`, { accept });
    return response.data;
  },

  // Join requests (for public plans)
  requestToJoin: async (planId: string, data?: JoinRequestData): Promise<ApiResponse<JoinRequest>> => {
    const response = await api.post(`/plans/${planId}/join-request`, data);
    return response.data;
  },

  getJoinRequests: async (planId: string): Promise<ApiResponse<JoinRequest[]>> => {
    const response = await api.get(`/plans/${planId}/join-requests`);
    return response.data;
  },

  respondToJoinRequest: async (
    requestId: string,
    approve: boolean
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post(`/join-requests/${requestId}/respond`, { approve });
    return response.data;
  },

  // Join by invite code
  joinByCode: async (inviteCode: string): Promise<ApiResponse<Plan>> => {
    const response = await api.post('/plans/join', { inviteCode });
    return response.data;
  },

  // Get plan by invite code (preview before joining)
  getPlanByInviteCode: async (inviteCode: string): Promise<ApiResponse<Plan>> => {
    const response = await api.get(`/plans/invite/${inviteCode}`);
    return response.data;
  },

  // Search users to invite
  searchUsers: async (query: string): Promise<ApiResponse<{ id: string; username: string; displayName: string | null; avatar: string | null }[]>> => {
    const response = await api.get('/invitations/search-users', { params: { query } });
    return response.data;
  },
};
