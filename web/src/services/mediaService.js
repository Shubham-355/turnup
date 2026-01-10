import api from '../config/api';

export const mediaService = {
  getMedia: async (planId) => {
    const response = await api.get(`/plans/${planId}/media`);
    return response.data;
  },

  uploadMedia: async (planId, formData) => {
    const response = await api.post(`/plans/${planId}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteMedia: async (mediaId) => {
    const response = await api.delete(`/media/${mediaId}`);
    return response.data;
  },
};
