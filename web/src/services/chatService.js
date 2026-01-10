import api from '../config/api';

export const chatService = {
  getMessages: async (planId) => {
    const response = await api.get(`/plans/${planId}/messages`);
    return response.data;
  },

  sendMessage: async (planId, content) => {
    const response = await api.post(`/plans/${planId}/messages`, { content });
    return response.data;
  },
};
