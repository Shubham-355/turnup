import api from '../config/api';

export const planService = {
  getPlans: async () => {
    const response = await api.get('/plans');
    return response.data;
  },

  getPlan: async (planId) => {
    const response = await api.get(`/plans/${planId}`);
    return response.data;
  },

  createPlan: async (planData) => {
    const response = await api.post('/plans', planData);
    return response.data;
  },

  updatePlan: async (planId, planData) => {
    const response = await api.put(`/plans/${planId}`, planData);
    return response.data;
  },

  deletePlan: async (planId) => {
    const response = await api.delete(`/plans/${planId}`);
    return response.data;
  },

  getPublicPlans: async () => {
    const response = await api.get('/plans/discover');
    return response.data;
  },

  // Join plan by invite code
  joinPlanByCode: async (inviteCode) => {
    const response = await api.post('/plans/join', { inviteCode });
    return response.data;
  },

  // Request to join a public plan
  requestToJoin: async (planId, message) => {
    const response = await api.post(`/plans/${planId}/join-request`, { message });
    return response.data;
  },

  leavePlan: async (planId) => {
    const response = await api.post(`/plans/${planId}/leave`);
    return response.data;
  },
};
