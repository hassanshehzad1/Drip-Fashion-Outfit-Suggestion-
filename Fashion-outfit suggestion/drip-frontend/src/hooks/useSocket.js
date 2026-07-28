/**
 * @fileoverview Socket.io hook for real-time notifications and chat.
 */

import { useEffect } from 'react'
import useSocketStore from '../stores/socketStore'
import useAuthStore from '../stores/authStore'
import useNotificationStore from '../stores/notificationStore'
import { getChatUnreadCount } from '../api/chat.api'
import toast from 'react-hot-toast'

export const useSocket = () => {
  const { isAuthenticated } = useAuthStore()
  const { socket, connect, disconnect, on } = useSocketStore()
  const { incrementUnread, incrementChatUnread, setChatUnread } = useNotificationStore()

  useEffect(() => {
    if (!isAuthenticated()) {
      disconnect()
      return
    }

    const token = localStorage.getItem('accessToken')
    if (token) {
      connect(token)
    }

    return () => disconnect()
  }, [isAuthenticated, connect, disconnect])

  useEffect(() => {
    if (!socket) return

    // Fetch initial chat unread count when socket connects
    const fetchInitialUnreadCount = async () => {
      try {
        const response = await getChatUnreadCount()
        const count = response.data?.data?.unreadCount || 0
        setChatUnread(count)
      } catch (error) {
        console.error('Failed to fetch chat unread count:', error)
      }
    }

    fetchInitialUnreadCount()

    const cleanupNotification = on('new_notification', (data) => {
      incrementUnread()
      toast(data.title, { icon: '🔔' })
    })

    const cleanupMessage = on('new_message', () => {
      incrementChatUnread()
    })

    return () => {
      cleanupNotification?.()
      cleanupMessage?.()
    }
  }, [socket, on, incrementUnread, incrementChatUnread, setChatUnread])

  return { socket }
}
