/**
 * @fileoverview Socket.io connection management for real-time features.
 */

import { create } from 'zustand'
import { io } from 'socket.io-client'

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (token) => {
    if (get().socket?.connected) return
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      withCredentials: true,
      transports: ['websocket'],
    })
    socket.on('connect', () => set({ isConnected: true }))
    socket.on('disconnect', () => set({ isConnected: false }))
    set({ socket })
  },

  disconnect: () => {
    get().socket?.disconnect()
    set({ socket: null, isConnected: false })
  },

  emit: (event, data) => get().socket?.emit(event, data),

  on: (event, handler) => {
    const { socket } = get()
    socket?.on(event, handler)
    return () => socket?.off(event, handler)
  }
}))

export default useSocketStore
