/**
 * @fileoverview Admin dashboard API endpoints.
 */

import api from './axios'

export const adminLogin = (body) => api.post('/admin/login', body)
export const adminRefresh = () => api.post('/admin/refresh')
export const getAdminAnalytics = () => api.get('/admin/analytics')
export const getAdminUsers = (params = {}) => api.get('/admin/users', { params })
export const banUser = (userId) => api.patch(`/admin/users/${userId}/ban`)
export const unbanUser = (userId) => api.patch(`/admin/users/${userId}/unban`)
export const getAdminPartners = (params = {}) => api.get('/admin/partners', { params })
export const getAdminPartnerDetail = (partnerId) => api.get(`/admin/partners/${partnerId}`)
export const approvePartner = (partnerId) => api.patch(`/admin/partners/${partnerId}/approve`)
export const rejectPartner = (partnerId, reason) =>
  api.patch(`/admin/partners/${partnerId}/reject`, { reason })
export const banPartner = (partnerId) => api.patch(`/admin/partners/${partnerId}/ban`)
export const unbanPartner = (partnerId) => api.patch(`/admin/partners/${partnerId}/unban`)
export const getAdminOutfits = (params = {}) => api.get('/admin/outfits', { params })
export const deleteAdminOutfit = (outfitId) => api.delete(`/admin/outfits/${outfitId}`)
export const getAdminOrders = (params = {}) => api.get('/admin/orders', { params })
export const getAdminOrder = (orderId) => api.get(`/admin/orders/${orderId}`)
export const getAdminAdmins = () => api.get('/admin/admins')
export const createAdmin = (body) => api.post('/admin/admins', body)
export const updateAdminPermissions = (adminId, body) =>
  api.patch(`/admin/admins/${adminId}`, body)
