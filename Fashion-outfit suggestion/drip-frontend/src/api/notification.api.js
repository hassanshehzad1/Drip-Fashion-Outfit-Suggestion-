/**
 * @fileoverview Notification API endpoints.
 */

import api from './axios'

export const getNotifications = (params = {}) =>
  api.get('/notification', { params })
export const getUnreadCount = () => api.get('/notification/unread-count')
export const markAllAsRead = () => api.patch('/notification/read-all')
export const deleteReadNotifications = () => api.delete('/notification/read')
export const markAsRead = (notificationId) =>
  api.patch(`/notification/${notificationId}/read`)
export const deleteNotification = (notificationId) =>
  api.delete(`/notification/${notificationId}`)
