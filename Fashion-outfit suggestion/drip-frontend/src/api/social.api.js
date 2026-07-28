/**
 * @fileoverview Social interaction API - likes, bookmarks, follows, comments.
 */

import api from './axios'

export const toggleLike = (outfitId) => api.post(`/social/like/${outfitId}`)
export const getLikedOutfits = (params = {}) => api.get('/social/liked', { params })
export const toggleBookmark = (outfitId) => api.post(`/social/bookmark/${outfitId}`)
export const getBookmarkedOutfits = (params = {}) => api.get('/social/bookmarks', { params })
export const toggleFollow = (partnerId) => api.post(`/social/follow/${partnerId}`)
export const getFollowedPartners = (params = {}) => api.get('/social/following', { params })
export const getFollowers = (params = {}) => api.get('/social/partner/followers', { params })
export const checkFollowStatus = (partnerId) => api.get(`/social/follow/check/${partnerId}`)
export const addComment = (outfitId, text) =>
  api.post(`/social/comment/${outfitId}`, { text })
export const addReply = (commentId, text) =>
  api.post(`/social/comment/${commentId}/reply`, { text })
export const getComments = (outfitId, params = {}) =>
  api.get(`/social/comment/${outfitId}`, { params })
export const getReplies = (commentId) =>
  api.get(`/social/comment/${commentId}/replies`)
export const deleteComment = (commentId) =>
  api.delete(`/social/comment/${commentId}`)
export const getSocialStatus = (outfitId) =>
  api.get(`/social/status/${outfitId}`)
