import api from '../config/api';

export const activityService = {
  getActivities: async (planId) => {
    const response = await api.get(`/plans/${planId}/activities`);
    return response.data;
  },

  createActivity: async (planId, activityData) => {
    const response = await api.post(`/plans/${planId}/activities`, activityData);
    return response.data;
  },

  updateActivity: async (activityId, activityData) => {
    const response = await api.put(`/activities/${activityId}`, activityData);
    return response.data;
  },

  deleteActivity: async (activityId) => {
    const response = await api.delete(`/activities/${activityId}`);
    return response.data;
  },
};
