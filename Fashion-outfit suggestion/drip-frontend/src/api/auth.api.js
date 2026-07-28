/**
 * @fileoverview Authentication API endpoints for users.
 */

import api from './axios'

export const registerUser = (body) => api.post('/auth/register', body)
export const loginUser = (body) => api.post('/auth/login', body)
export const logoutUser = () => api.post('/auth/logout')
export const refreshUserToken = () => api.post('/auth/refresh')
export const getMe = () => api.get('/auth/me')
export const updateProfile = (body) => api.patch('/auth/update-profile', body)
export const changePassword = (body) => api.patch('/auth/change-password', body)
