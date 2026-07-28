/**
 * @fileoverview Order and checkout API endpoints.
 */

import api from './axios'

export const checkout = (body) => api.post('/order/checkout', body)
export const checkoutOrder = checkout
export const getMyOrders = (params = {}) => api.get('/order/my-orders', { params })
export const getPartnerOrders = (params = {}) =>
  api.get('/order/partner-orders', { params })
export const getPartnerStats = () => api.get('/order/partner-stats')
export const getOrder = (orderId) => api.get(`/order/${orderId}`)
export const updateOrderStatus = (orderId, status) =>
  api.patch(`/order/${orderId}/status`, { status })
export const cancelOrder = (orderId, reason) =>
  api.patch(`/order/${orderId}/cancel`, { reason })
