/**
 * @fileoverview Chat and messaging API endpoints.
 */

import api from './axios'

export const getConversations = () => api.get('/chat/conversations')
export const getChatUnreadCount = () => api.get('/chat/unread-count')
export const getMessages = (otherPartyId, otherPartyModel, params = {}) =>
  api.get(`/chat/${otherPartyId}`, { params: { otherPartyModel, ...params } })
export const sendMessage = (otherPartyId, body) =>
  api.post(`/chat/${otherPartyId}`, body)
export const deleteMessage = (messageId) =>
  api.delete(`/chat/message/${messageId}`)
export const searchMessages = (otherPartyId, q, otherPartyModel) =>
  api.get(`/chat/${otherPartyId}/search`, { params: { q, otherPartyModel } })
