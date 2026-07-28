/**
 * @fileoverview AI-powered features API - personalized feed, style analysis, recommendations.
 */

import api from './axios'

export const getAIFeed = (params = {}) => api.get('/ai/feed', { params })
export const getStyleAnalysis = () => api.get('/ai/style-analysis')
export const getTrendingOutfits = (period = '7d') =>
  api.get('/ai/trending', { params: { period } })
export const getRecommendedPartners = () =>
  api.get('/ai/recommended-partners')
export const getSimilarOutfits = (outfitId, limit = 8) =>
  api.get(`/ai/similar/${outfitId}`, { params: { limit } })
export const getCompleteLook = (outfitId) =>
  api.get(`/ai/complete-look/${outfitId}`)
export const trackInteraction = (outfitId, action) =>
  api.post('/ai/track', { outfitId, action })
export const submitStyleQuiz = (answers) =>
  api.post('/ai/style-quiz', { answers })
