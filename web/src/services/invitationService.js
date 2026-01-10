import api from '../config/api';

export const invitationService = {
  createInvitation: async (planId) => {
    const response = await api.post(`/plans/${planId}/invitations`);
    return response.data;
  },

  // Get plan details by invite code
  getInvitation: async (inviteCode) => {
    const response = await api.get(`/plans/invite/${inviteCode}`);
    return response.data;
  },

  // Join plan by invite code
  acceptInvitation: async (inviteCode) => {
    const response = await api.post('/plans/join', { inviteCode });
    return response.data;
  },

  // Request to join a public plan
  requestToJoin: async (planId, message) => {
    const response = await api.post(`/plans/${planId}/join-request`, { message });
    return response.data;
  },

  // Get join requests for a plan (for admins)
  getJoinRequests: async (planId) => {
    const response = await api.get(`/plans/${planId}/join-requests`);
    return response.data;
  },

  // Respond to a join request
  respondToJoinRequest: async (requestId, approve) => {
    const response = await api.post(`/join-requests/${requestId}/respond`, { approve });
    return response.data;
  },
};
