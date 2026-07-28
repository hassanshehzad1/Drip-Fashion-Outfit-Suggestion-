import { create } from 'zustand';
import { socialAPI } from '../api';

export const useSocialStore = create((set, get) => ({
  likedOutfits: [],
  bookmarkedOutfits: [],
  followedPartners: [],
  followers: [],
  comments: [],
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },

  // Toggle like
  toggleLike: async (outfitId) => {
    try {
      const response = await socialAPI.toggleLike(outfitId);
      set((state) => {
        const isLiked = response.data.liked;
        return {
          likedOutfits: isLiked
            ? [...state.likedOutfits, outfitId]
            : state.likedOutfits.filter((id) => id !== outfitId),
        };
      });
      return { success: true, liked: response.data.liked };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Get liked outfits
  getLikedOutfits: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await socialAPI.getLikedOutfits(params);
      set({
        likedOutfits: response.data.outfits.map((o) => o._id),
        isLoading: false,
      });
      return { success: true, outfits: response.data.outfits };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load liked outfits',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Toggle bookmark
  toggleBookmark: async (outfitId) => {
    try {
      const response = await socialAPI.toggleBookmark(outfitId);
      set((state) => {
        const isBookmarked = response.data.bookmarked;
        return {
          bookmarkedOutfits: isBookmarked
            ? [...state.bookmarkedOutfits, outfitId]
            : state.bookmarkedOutfits.filter((id) => id !== outfitId),
        };
      });
      return { success: true, bookmarked: response.data.bookmarked };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Get bookmarked outfits
  getBookmarkedOutfits: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await socialAPI.getBookmarkedOutfits(params);
      set({
        bookmarkedOutfits: response.data.outfits.map((o) => o._id),
        isLoading: false,
      });
      return { success: true, outfits: response.data.outfits };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load bookmarked outfits',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Toggle follow
  toggleFollow: async (partnerId) => {
    try {
      const response = await socialAPI.toggleFollow(partnerId);
      set((state) => {
        const isFollowing = response.data.following;
        return {
          followedPartners: isFollowing
            ? [...state.followedPartners, partnerId]
            : state.followedPartners.filter((id) => id !== partnerId),
        };
      });
      return { success: true, following: response.data.following };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Get followed partners
  getFollowedPartners: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await socialAPI.getFollowedPartners(params);
      set({
        followedPartners: response.data.partners.map((p) => p._id),
        isLoading: false,
      });
      return { success: true, partners: response.data.partners };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load followed partners',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Get followers
  getFollowers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await socialAPI.getFollowers(params);
      set({
        followers: response.data.followers,
        pagination: response.data.pagination,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load followers',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Add comment
  addComment: async (outfitId, data) => {
    try {
      const response = await socialAPI.addComment(outfitId, data);
      set((state) => ({
        comments: [response.data.comment, ...state.comments],
      }));
      return { success: true, comment: response.data.comment };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Get comments
  getComments: async (outfitId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await socialAPI.getComments(outfitId, params);
      set({
        comments: response.data.comments,
        pagination: response.data.pagination,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load comments',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Delete comment
  deleteComment: async (commentId) => {
    try {
      await socialAPI.deleteComment(commentId);
      set((state) => ({
        comments: state.comments.filter((comment) => comment._id !== commentId),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Check status
  checkLikeBookmarkStatus: async (outfitId) => {
    try {
      const response = await socialAPI.checkLikeBookmarkStatus(outfitId);
      set({
        likedOutfits: response.data.liked ? [outfitId] : [],
        bookmarkedOutfits: response.data.bookmarked ? [outfitId] : [],
      });
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
