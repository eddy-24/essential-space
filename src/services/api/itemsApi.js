import apiClient from './client';

// Parse ISO 8601 strings into Date objects as specified in the API contract
const parseItemDates = (item) => {
  if (!item) return item;
  return {
    ...item,
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
  };
};

export const itemsApi = {
  // GET /api/items
  getAllItems: async (filters) => {
    const response = await apiClient.get('/items', { params: filters });
    return response.map(parseItemDates);
  },

  // POST /api/items
  createItem: async (data) => {
    const response = await apiClient.post('/items', data);
    return parseItemDates(response);
  },

  // POST /api/items/upload
  uploadItem: async (file, type, note) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (note) {
      formData.append('note', note);
    }

    const response = await apiClient.post('/items/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return parseItemDates(response);
  },

  // PUT /api/items/{id}
  updateItem: async (id, data) => {
    const response = await apiClient.put(`/items/${id}`, data);
    return parseItemDates(response);
  },

  // DELETE /api/items/{id}
  deleteItem: async (id) => {
    return await apiClient.delete(`/items/${id}`);
  },
};
