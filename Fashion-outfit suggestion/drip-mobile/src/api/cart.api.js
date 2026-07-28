import api from './axios'

// GET /api/cart (user auth)
export const getCart = () => api.get('/cart')

// POST /api/cart/add (user auth)
export const addToCart = (body) => api.post('/cart/add', body)

// PATCH /api/cart/item/:itemId (user auth)
export const updateCartItem = (itemId, quantity) =>
  api.patch(`/cart/item/${itemId}`, { quantity })

// DELETE /api/cart/item/:itemId (user auth)
export const removeCartItem = (itemId) =>
  api.delete(`/cart/item/${itemId}`)

// DELETE /api/cart/clear (user auth)
export const clearCart = () => api.delete('/cart/clear')
