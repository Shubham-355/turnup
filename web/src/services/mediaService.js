import api from '../config/api';

export const mediaService = {
  getMedia: async (planId, params = {}) => {
    const response = await api.get(`/plans/${planId}/media`, { params });
    return response.data;
  },

  uploadSingleMedia: async (planId, file, { activityId, caption } = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (activityId) formData.append('activityId', activityId);
    if (caption) formData.append('caption', caption);
    
    const response = await api.post(`/plans/${planId}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadMultipleMedia: async (planId, files, { activityId, caption } = {}) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (activityId) formData.append('activityId', activityId);
    if (caption) formData.append('caption', caption);
    
    const response = await api.post(`/plans/${planId}/media/multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateCaption: async (mediaId, caption) => {
    const response = await api.put(`/media/${mediaId}/caption`, { caption });
    return response.data;
  },

  deleteMedia: async (mediaId) => {
    const response = await api.delete(`/media/${mediaId}`);
    return response.data;
  },
};
