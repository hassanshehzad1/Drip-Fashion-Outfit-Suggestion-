import { create } from 'zustand';
import { outfitAPI } from '../api';

export const useOutfitStore = create((set, get) => ({
  outfits: [],
  currentOutfit: null,
  partnerOutfits: [],
  myOutfits: [],
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },

  // Get feed
  getFeed: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await outfitAPI.getFeed(params);
      set({
        outfits: response.data.outfits,
        pagination: response.data.pagination,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load feed',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Get single outfit
  getSingleOutfit: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await outfitAPI.getSingleOutfit(id);
      set({ currentOutfit: response.data.outfit, isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load outfit',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Get partner outfits
  getPartnerOutfits: async (partnerId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await outfitAPI.getPartnerOutfits(partnerId, params);
      set({
        partnerOutfits: response.data.outfits,
        pagination: response.data.pagination,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load partner outfits',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Get my outfits
  getMyOutfits: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await outfitAPI.getMyOutfits(params);
      set({
        myOutfits: response.data.outfits,
        pagination: response.data.pagination,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load my outfits',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Create outfit
  createOutfit: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await outfitAPI.createOutfit(data);
      set((state) => ({
        myOutfits: [response.data.outfit, ...state.myOutfits],
        isLoading: false,
      }));
      return { success: true, outfit: response.data.outfit };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create outfit',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Update outfit
  updateOutfit: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await outfitAPI.updateOutfit(id, data);
      set((state) => ({
        myOutfits: state.myOutfits.map((outfit) =>
          outfit._id === id ? response.data.outfit : outfit
        ),
        currentOutfit: state.currentOutfit?._id === id ? response.data.outfit : state.currentOutfit,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update outfit',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Toggle featured
  toggleFeatured: async (id) => {
    try {
      await outfitAPI.toggleFeatured(id);
      set((state) => ({
        myOutfits: state.myOutfits.map((outfit) =>
          outfit._id === id ? { ...outfit, isFeatured: !outfit.isFeatured } : outfit
        ),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Delete outfit
  deleteOutfit: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await outfitAPI.deleteOutfit(id);
      set((state) => ({
        myOutfits: state.myOutfits.filter((outfit) => outfit._id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete outfit',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Clear current outfit
  clearCurrentOutfit: () => set({ currentOutfit: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));
