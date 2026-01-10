import api from '../config/api';

export const invitationService = {
  createInvitation: async (planId) => {
    const response = await api.post(`/plans/${planId}/invitations`);
    return response.data;
  },

  getInvitation: async (invitationCode) => {
    const response = await api.get(`/invitations/${invitationCode}`);
    return response.data;
  },

  acceptInvitation: async (invitationCode) => {
    const response = await api.post(`/invitations/${invitationCode}/accept`);
    return response.data;
  },
};
