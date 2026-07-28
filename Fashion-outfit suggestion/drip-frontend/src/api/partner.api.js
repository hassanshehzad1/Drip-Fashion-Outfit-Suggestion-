/**
 * @fileoverview Partner (brand) authentication and profile API endpoints.
 */

import api from './axios'

export const registerPartner = (body) => api.post('/partner/auth/register', body)
export const loginPartner = (body) => api.post('/partner/auth/login', body)
export const logoutPartner = () => api.post('/partner/auth/logout')
export const refreshPartnerToken = () => api.post('/partner/auth/refresh')
export const getPartnerMe = () => api.get('/partner/me')
export const updatePartnerProfile = (body) => api.patch('/partner/update-profile', body)
export const changePartnerPassword = (body) => api.patch('/partner/change-password', body)
export const getPartnerPublicProfile = (partnerId) => api.get(`/partner/${partnerId}`)
export const followPartner = (partnerId) => api.post(`/partner/${partnerId}/follow`)
export const unfollowPartner = (partnerId) => api.delete(`/partner/${partnerId}/follow`)
