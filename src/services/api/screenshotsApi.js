import apiClient from './client';

export const screenshotsApi = {
  uploadScreenshot: async (file) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    });
    const data = await apiClient.post('/screenshots', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  getScreenshots: async (params = {}) => {
    const data = await apiClient.get('/screenshots', { params });
    return data;
  },

  getScreenshot: async (id) => {
    const data = await apiClient.get(`/screenshots/${id}`);
    return data;
  },

  updateScreenshot: async (id, updateDto) => {
    const data = await apiClient.patch(`/screenshots/${id}`, updateDto);
    return data;
  },

  deleteScreenshot: async (id) => {
    await apiClient.delete(`/screenshots/${id}`);
  },

  retryProcessing: async (id) => {
    await apiClient.post(`/screenshots/${id}/retry`);
  }
};
