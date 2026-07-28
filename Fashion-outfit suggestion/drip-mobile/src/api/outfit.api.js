import api from './axios'

// GET /api/outfit/feed
export const getFeed = (params = {}) =>
  api.get('/outfit/feed', { params })

// GET /api/outfit/my-outfits (partner auth required)
export const getMyOutfits = (params = {}) =>
  api.get('/outfit/my-outfits', { params })

// GET /api/outfit/partner/:partnerId (public)
export const getPartnerOutfits = (partnerId, params = {}) =>
  api.get(`/outfit/partner/${partnerId}`, { params })

// GET /api/outfit/:outfitId (public)
export const getOutfit = (outfitId) => api.get(`/outfit/${outfitId}`)

// POST /api/outfit (partner auth required)
export const createOutfit = (body) => api.post('/outfit', body)

// PATCH /api/outfit/:outfitId (partner auth, must own outfit)
export const updateOutfit = (outfitId, body) =>
  api.patch(`/outfit/${outfitId}`, body)

// PATCH /api/outfit/:outfitId/featured (partner auth)
export const toggleFeatured = (outfitId) =>
  api.patch(`/outfit/${outfitId}/featured`)

// DELETE /api/outfit/:outfitId (partner auth, own outfit only)
export const deleteOutfit = (outfitId) =>
  api.delete(`/outfit/${outfitId}`)
