import api from './axios'

// POST /api/auth/register
// BODY: { name, email, password }
export const registerUser = (body) => api.post('/auth/register', body)

// POST /api/auth/login
// BODY: { email, password }
export const loginUser = (body) => api.post('/auth/login', body)

// POST /api/auth/refresh
// BODY: { refreshToken }
export const refreshUserToken = (refreshToken) =>
  api.post('/auth/refresh', { refreshToken })

// POST /api/auth/logout
export const logoutUser = () => api.post('/auth/logout')

// GET /api/auth/me
export const getMe = () => api.get('/auth/me')

// PATCH /api/auth/update-profile
export const updateProfile = (body) => api.patch('/auth/update-profile', body)

// PATCH /api/auth/change-password
export const changePassword = (body) => api.patch('/auth/change-password', body)
