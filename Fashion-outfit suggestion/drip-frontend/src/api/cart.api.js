/**
 * @fileoverview Shopping cart API endpoints.
 */

import api from './axios'

export const getCart = () => api.get('/cart')
export const addToCart = (body) => api.post('/cart/add', body)
export const updateCartItem = (itemId, quantity) =>
  api.patch(`/cart/item/${itemId}`, { quantity })
export const removeCartItem = (itemId) =>
  api.delete(`/cart/item/${itemId}`)
export const clearCart = () => api.delete('/cart/clear')
