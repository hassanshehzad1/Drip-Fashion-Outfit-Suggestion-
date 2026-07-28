import { create } from 'zustand';
import { chatAPI } from '../api';

export const useChatStore = create((set, get) => ({
  conversations: [],
  currentMessages: [],
  currentConversationId: null,
  unreadCount: 0,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 50, total: 0, pages: 0 },

  // Get conversations
  getConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatAPI.getConversations();
      set({
        conversations: response.data.conversations,
        unreadCount: response.data.unreadCount,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load conversations',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Get messages
  getMessages: async (otherPartyId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatAPI.getMessages(otherPartyId, params);
      set({
        currentMessages: response.data.messages,
        currentConversationId: response.data.conversationId,
        pagination: response.data.pagination,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load messages',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Send message
  sendMessage: async (otherPartyId, data) => {
    try {
      const response = await chatAPI.sendMessage(otherPartyId, data);
      set((state) => ({
        currentMessages: [...state.currentMessages, response.data.message],
      }));
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Delete message
  deleteMessage: async (messageId) => {
    try {
      await chatAPI.deleteMessage(messageId);
      set((state) => ({
        currentMessages: state.currentMessages.filter((msg) => msg._id !== messageId),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await chatAPI.getUnreadMessageCount();
      set({ unreadCount: response.data.count });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Add message (for socket events)
  addMessage: (message) => {
    set((state) => ({
      currentMessages: [...state.currentMessages, message],
    }));
  },

  // Update conversation (for socket events)
  updateConversation: (conversation) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv._id === conversation._id ? conversation : conv
      ),
    }));
  },

  // Clear current messages
  clearCurrentMessages: () => set({ currentMessages: [], currentConversationId: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));
