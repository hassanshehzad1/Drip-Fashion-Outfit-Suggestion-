import api from './axios'

// GET /api/chat/conversations
export const getConversations = () => api.get('/chat/conversations')

// GET /api/chat/unread-count
export const getChatUnreadCount = () =>
  api.get('/chat/unread-count')

// GET /api/chat/:otherPartyId
export const getMessages = (otherPartyId, otherPartyModel, params = {}) =>
  api.get(`/chat/${otherPartyId}`, {
    params: { otherPartyModel, ...params }
  })

// POST /api/chat/:otherPartyId
export const sendMessage = (otherPartyId, body) =>
  api.post(`/chat/${otherPartyId}`, body)

// DELETE /api/chat/message/:messageId
export const deleteMessage = (messageId) =>
  api.delete(`/chat/message/${messageId}`)
