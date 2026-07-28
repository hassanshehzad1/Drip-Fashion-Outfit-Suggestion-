import api from './axios'

// GET /api/notification
export const getNotifications = (params = {}) =>
  api.get('/notification', { params })

// GET /api/notification/unread-count
export const getUnreadCount = () =>
  api.get('/notification/unread-count')

// PATCH /api/notification/read-all
export const markAllAsRead = () =>
  api.patch('/notification/read-all')

// DELETE /api/notification/read
export const deleteReadNotifications = () =>
  api.delete('/notification/read')

// PATCH /api/notification/:notificationId/read
export const markAsRead = (notificationId) =>
  api.patch(`/notification/${notificationId}/read`)

// DELETE /api/notification/:notificationId
export const deleteNotification = (notificationId) =>
  api.delete(`/notification/${notificationId}`)
