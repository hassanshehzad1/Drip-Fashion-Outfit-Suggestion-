import { create } from 'zustand'
import { io } from 'socket.io-client'
import * as SecureStore from 'expo-secure-store'

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000'

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  connect: async () => {
    if (get().socket?.connected) return
    const token = await SecureStore.getItemAsync('accessToken')
    if (!token) return

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      set({ isConnected: true })
    })

    socket.on('disconnect', () => {
      set({ isConnected: false })
    })

    socket.on('connect_error', (err) => {
      console.warn('Socket connect error:', err.message)
    })

    set({ socket })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ socket: null, isConnected: false })
    }
  },

  emit: (event, data) => {
    get().socket?.emit(event, data)
  },

  // Returns unsubscribe function
  on: (event, handler) => {
    const { socket } = get()
    socket?.on(event, handler)
    return () => socket?.off(event, handler)
  },
}))

export default useSocketStore
