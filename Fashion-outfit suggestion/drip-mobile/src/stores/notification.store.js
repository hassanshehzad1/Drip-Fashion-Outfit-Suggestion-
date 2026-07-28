import { create } from 'zustand';
import { notificationAPI } from '../api';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },

  // Get notifications
  getNotifications: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await notificationAPI.getNotifications(params);
      set({
        notifications: response.data.notifications,
        pagination: response.data.pagination,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load notifications',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      set({ unreadCount: response.data.count });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      await notificationAPI.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((notif) => ({ ...notif, isRead: true })),
        unreadCount: 0,
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      set((state) => ({
        notifications: state.notifications.filter((notif) => notif._id !== notificationId),
        unreadCount: state.notifications.find((n) => n._id === notificationId && !n.isRead)
          ? state.unreadCount - 1
          : state.unreadCount,
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Delete all read
  deleteAllRead: async () => {
    try {
      await notificationAPI.deleteAllRead();
      set((state) => ({
        notifications: state.notifications.filter((notif) => !notif.isRead),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Add notification (for socket events)
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
