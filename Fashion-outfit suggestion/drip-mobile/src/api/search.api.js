import api from './axios'

// GET /api/search (public)
export const searchOutfits = (params = {}) =>
  api.get('/search', { params })

// GET /api/search/trending (public)
export const getTrendingTags = () => api.get('/search/trending')

// GET /api/search/partners (public)
export const searchPartners = (params = {}) =>
  api.get('/search/partners', { params })

// GET /api/search/suggestions (public)
export const getSearchSuggestions = (q) =>
  api.get('/search/suggestions', { params: { q } })

// GET /api/search/category/:category (public)
export const searchByCategory = (category, params = {}) =>
  api.get(`/search/category/${category}`, { params })

// GET /api/search/personalized (user auth)
export const getPersonalizedSearch = (params = {}) =>
  api.get('/search/personalized', { params })
