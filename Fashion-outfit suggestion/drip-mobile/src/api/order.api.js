import api from './axios'

// POST /api/order/checkout (user auth)
export const checkout = (body) => api.post('/order/checkout', body)

// GET /api/order/my-orders (user auth)
export const getMyOrders = (params = {}) =>
  api.get('/order/my-orders', { params })

// GET /api/order/partner-orders (partner auth)
export const getPartnerOrders = (params = {}) =>
  api.get('/order/partner-orders', { params })

// GET /api/order/partner-stats (partner auth)
export const getPartnerStats = () => api.get('/order/partner-stats')

// GET /api/order/:orderId (user auth)
export const getOrder = (orderId) => api.get(`/order/${orderId}`)

// PATCH /api/order/:orderId/status (partner auth)
export const updateOrderStatus = (orderId, status) =>
  api.patch(`/order/${orderId}/status`, { status })

// PATCH /api/order/:orderId/cancel (user auth)
export const cancelOrder = (orderId, reason) =>
  api.patch(`/order/${orderId}/cancel`, { reason })
