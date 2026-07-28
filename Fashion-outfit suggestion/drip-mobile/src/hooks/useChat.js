import { useChatStore } from '../stores';

export const useChat = () => {
  const {
    conversations,
    currentMessages,
    currentConversationId,
    unreadCount,
    isLoading,
    error,
    pagination,
    getConversations,
    getMessages,
    sendMessage,
    deleteMessage,
    getUnreadCount,
    addMessage,
    updateConversation,
    clearCurrentMessages,
    clearError,
  } = useChatStore();

  return {
    conversations,
    currentMessages,
    currentConversationId,
    unreadCount,
    isLoading,
    error,
    pagination,
    getConversations,
    getMessages,
    sendMessage,
    deleteMessage,
    getUnreadCount,
    addMessage,
    updateConversation,
    clearCurrentMessages,
    clearError,
  };
};
