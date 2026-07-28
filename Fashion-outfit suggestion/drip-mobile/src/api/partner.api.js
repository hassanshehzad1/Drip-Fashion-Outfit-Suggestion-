import api from './axios'

// POST /api/partner/auth/register
export const registerPartner = (body) =>
  api.post('/partner/auth/register', body)

// POST /api/partner/auth/login
export const loginPartner = (body) => api.post('/partner/auth/login', body)

// POST /api/partner/auth/refresh
export const refreshPartnerToken = (refreshToken) =>
  api.post('/partner/auth/refresh', { refreshToken })

// POST /api/partner/auth/logout
export const logoutPartner = () => api.post('/partner/auth/logout')

// GET /api/partner/me
export const getPartnerMe = () => api.get('/partner/me')

// PATCH /api/partner/update-profile
export const updatePartnerProfile = (body) =>
  api.patch('/partner/update-profile', body)

// PATCH /api/partner/change-password
export const changePartnerPassword = (body) =>
  api.patch('/partner/change-password', body)

// GET /api/partner/:partnerId (public)
export const getPartnerPublic = (partnerId) =>
  api.get(`/partner/${partnerId}`)
