import { create } from 'zustand';
import { itemsApi } from '../services/api/itemsApi';
import { collectionsApi } from '../services/api/collectionsApi';

export const useStore = create((set, get) => ({
  items: [],
  collections: [],
  isLoading: false,
  error: null,

  fetchItems: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await itemsApi.getAllItems(filters);
      set({ items: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  createItem: async (data) => {
    try {
      const newItem = await itemsApi.createItem(data);
      set((state) => ({ items: [newItem, ...state.items] }));
      return newItem;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  uploadItem: async (file, type, note) => {
    try {
      const newItem = await itemsApi.uploadItem(file, type, note);
      set((state) => ({ items: [newItem, ...state.items] }));
      return newItem;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateItem: async (id, data) => {
    try {
      const updatedItem = await itemsApi.updateItem(id, data);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updatedItem : item)),
      }));
      return updatedItem;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteItem: async (id) => {
    try {
      await itemsApi.deleteItem(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchCollections: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await collectionsApi.getAllCollections();
      set({ collections: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
