/**
 * @fileoverview Search and discovery API endpoints.
 */

import api from './axios'

export const searchOutfits = (params = {}) => api.get('/search', { params })
export const getTrendingTags = () => api.get('/search/trending')
export const searchPartners = (params = {}) => api.get('/search/partners', { params })
export const getSearchSuggestions = (q) =>
  api.get('/search/suggestions', { params: { q } })
export const searchByCategory = (category, params = {}) =>
  api.get(`/search/category/${category}`, { params })
export const getPersonalizedSearch = (params = {}) =>
  api.get('/search/personalized', { params })
