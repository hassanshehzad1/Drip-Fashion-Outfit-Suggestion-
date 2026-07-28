import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Constants from 'expo-constants';
import { useNotificationStore, useChatStore } from '../stores';
import { getToken, getRefreshToken } from '../api';

const SOCKET_URL = Constants.expoConfig?.extra?.socketUrl || process.env.SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef(null);
  const { addNotification } = useNotificationStore();
  const { addMessage, updateConversation } = useChatStore();

  useEffect(() => {
    const connectSocket = async () => {
      const token = await getToken();
      if (!token) return;

      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      // Listen for new notifications
      socketRef.current.on('notification', (notification) => {
        addNotification(notification);
      });

      // Listen for new messages
      socketRef.current.on('new_message', (data) => {
        addMessage(data.message);
        updateConversation(data.conversation);
      });

      // Listen for typing indicators
      socketRef.current.on('user_typing', (data) => {
        // Handle typing indicator
        console.log('User typing:', data);
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
      });
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const emitTyping = (conversationId, receiverRoom, isTyping) => {
    if (socketRef.current) {
      socketRef.current.emit(isTyping ? 'typing' : 'stop_typing', {
        conversationId,
        receiverRoom,
      });
    }
  };

  const joinConversation = (conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_conversation', conversationId);
    }
  };

  const joinOutfitRoom = (outfitId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_outfit_room', outfitId);
    }
  };

  const leaveOutfitRoom = (outfitId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_outfit_room', outfitId);
    }
  };

  return {
    socket: socketRef.current,
    emitTyping,
    joinConversation,
    leaveConversation,
    joinOutfitRoom,
    leaveOutfitRoom,
  };
};
