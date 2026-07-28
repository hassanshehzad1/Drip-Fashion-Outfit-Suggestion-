import api from './axios'

// GET /api/ai/feed (user auth)
export const getAIFeed = (params = {}) =>
  api.get('/ai/feed', { params })

// GET /api/ai/style-analysis (user auth)
export const getStyleAnalysis = () => api.get('/ai/style-analysis')

// GET /api/ai/trending (public)
export const getTrendingOutfits = (period = '7d') =>
  api.get('/ai/trending', { params: { period } })

// GET /api/ai/recommended-partners (user auth)
export const getRecommendedPartners = () =>
  api.get('/ai/recommended-partners')

// GET /api/ai/similar/:outfitId (public)
export const getSimilarOutfits = (outfitId, limit = 8) =>
  api.get(`/ai/similar/${outfitId}`, { params: { limit } })

// GET /api/ai/complete-look/:outfitId (public)
export const getCompleteLook = (outfitId) =>
  api.get(`/ai/complete-look/${outfitId}`)

// POST /api/ai/track (user auth)
export const trackInteraction = (outfitId, action) =>
  api.post('/ai/track', { outfitId, action })

// POST /api/ai/style-quiz (user auth)
export const submitStyleQuiz = (answers) =>
  api.post('/ai/style-quiz', { answers })
