/**
 * @fileoverview Notification and chat unread count state management.
 */

import { create } from 'zustand'

const useNotificationStore = create((set) => ({
  unreadCount: 0,
  chatUnreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: n }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  decrementUnread: (n = 1) => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - n) })),
  setChatUnread: (n) => set({ chatUnreadCount: n }),
  incrementChatUnread: () => set((s) => ({ chatUnreadCount: s.chatUnreadCount + 1 })),
  resetChatUnread: () => set({ chatUnreadCount: 0 }),
}))

export default useNotificationStore
