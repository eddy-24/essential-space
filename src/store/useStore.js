import { create } from 'zustand';
import { screenshotsApi } from '../services/api/screenshotsApi';

export const useStore = create((set) => ({
  screenshots: [],
  isLoading: false,
  error: null,

  fetchScreenshots: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await screenshotsApi.getScreenshots(params);
      set({ screenshots: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  uploadScreenshot: async (file) => {
    try {
      const newItem = await screenshotsApi.uploadScreenshot(file);
      set((state) => ({ screenshots: [newItem, ...state.screenshots] }));
      return newItem;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteScreenshot: async (id) => {
    try {
      await screenshotsApi.deleteScreenshot(id);
      set((state) => ({
        screenshots: state.screenshots.filter((s) => s.id !== id),
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));
