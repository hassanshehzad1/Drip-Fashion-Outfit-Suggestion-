import api from './axios'

// POST /api/social/like/:outfitId (user auth)
export const toggleLike = (outfitId) =>
  api.post(`/social/like/${outfitId}`)

// GET /api/social/liked (user auth)
export const getLikedOutfits = (params = {}) =>
  api.get('/social/liked', { params })

// POST /api/social/bookmark/:outfitId (user auth)
export const toggleBookmark = (outfitId) =>
  api.post(`/social/bookmark/${outfitId}`)

// GET /api/social/bookmarks (user auth)
export const getBookmarkedOutfits = (params = {}) =>
  api.get('/social/bookmarks', { params })

// POST /api/social/follow/:partnerId (user auth)
export const toggleFollow = (partnerId) =>
  api.post(`/social/follow/${partnerId}`)

// GET /api/social/following (user auth)
export const getFollowedPartners = (params = {}) =>
  api.get('/social/following', { params })

// GET /api/social/partner/followers (partner auth)
export const getFollowers = (params = {}) =>
  api.get('/social/partner/followers', { params })

// GET /api/social/follow/check/:partnerId (user auth)
export const checkFollowStatus = (partnerId) =>
  api.get(`/social/follow/check/${partnerId}`)

// POST /api/social/comment/:outfitId (user auth)
export const addComment = (outfitId, text) =>
  api.post(`/social/comment/${outfitId}`, { text })

// POST /api/social/comment/:commentId/reply (user auth)
export const addReply = (commentId, text) =>
  api.post(`/social/comment/${commentId}/reply`, { text })

// GET /api/social/comment/:outfitId (public)
export const getComments = (outfitId, params = {}) =>
  api.get(`/social/comment/${outfitId}`, { params })

// GET /api/social/comment/:commentId/replies (public)
export const getReplies = (commentId) =>
  api.get(`/social/comment/${commentId}/replies`)

// DELETE /api/social/comment/:commentId (user auth, own comment only)
export const deleteComment = (commentId) =>
  api.delete(`/social/comment/${commentId}`)

// GET /api/social/status/:outfitId (user auth)
export const getSocialStatus = (outfitId) =>
  api.get(`/social/status/${outfitId}`)
