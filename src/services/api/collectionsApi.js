import apiClient from './client';

// Parse ISO 8601 strings into Date objects
const parseCollectionDates = (collection) => {
  if (!collection) return collection;
  return {
    ...collection,
    createdAt: collection.createdAt ? new Date(collection.createdAt) : undefined,
  };
};

const parseItemDates = (item) => {
  if (!item) return item;
  return {
    ...item,
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
  };
};

export const collectionsApi = {
  // GET /api/collections
  getAllCollections: async () => {
    const response = await apiClient.get('/collections');
    return response.map(parseCollectionDates);
  },

  // POST /api/collections
  createCollection: async (data) => {
    const response = await apiClient.post('/collections', data);
    return parseCollectionDates(response);
  },

  // DELETE /api/collections/{id}
  deleteCollection: async (id) => {
    return await apiClient.delete(`/collections/${id}`);
  },

  // GET /api/collections/{id}/items
  getCollectionItems: async (collectionId) => {
    const response = await apiClient.get(`/collections/${collectionId}/items`);
    return response.map(parseItemDates);
  },

  // POST /api/collections/{id}/items/{itemId}
  addItemToCollection: async (collectionId, itemId) => {
    return await apiClient.post(`/collections/${collectionId}/items/${itemId}`);
  },

  // DELETE /api/collections/{id}/items/{itemId}
  removeItemFromCollection: async (collectionId, itemId) => {
    return await apiClient.delete(`/collections/${collectionId}/items/${itemId}`);
  },
};
