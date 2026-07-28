import { useNotificationStore } from '../stores';

export const useNotification = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    pagination,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    addNotification,
    clearError,
  } = useNotificationStore();

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    pagination,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    addNotification,
    clearError,
  };
};
