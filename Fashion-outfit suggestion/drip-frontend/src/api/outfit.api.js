/**
 * @fileoverview Outfit (fashion item) API endpoints for feed, search, and management.
 */

import api from './axios'

export const getFeed = (params = {}) => api.get('/outfit/feed', { params })
export const getMyOutfits = (params = {}) => api.get('/outfit/my-outfits', { params })
export const getPartnerOutfits = (partnerId, params = {}) =>
  api.get(`/outfit/partner/${partnerId}`, { params })
export const getOutfit = (outfitId) => api.get(`/outfit/${outfitId}`)
export const createOutfit = (body) => api.post('/outfit', body)
export const updateOutfit = (outfitId, body) => api.patch(`/outfit/${outfitId}`, body)
export const toggleFeatured = (outfitId) => api.patch(`/outfit/${outfitId}/featured`)
export const deleteOutfit = (outfitId) => api.delete(`/outfit/${outfitId}`)
