import { create } from 'zustand'
import { storage } from '../utils/storage'

const useAuthStore = create((set, get) => ({
  user: null,
  partner: null,
  role: null,       // 'user' | 'partner' | 'admin' | null
  isLoading: true,  // true during initial token check

  // Initialize from SecureStore on app start
  initialize: async () => {
    try {
      const role = await storage.get('userRole')
      const userStr = await storage.get('userData')
      if (role && userStr) {
        const userData = JSON.parse(userStr)
        if (role === 'user') {
          set({ user: userData, role: 'user' })
        } else if (role === 'partner') {
          set({ partner: userData, role: 'partner' })
        } else if (role === 'admin') {
          set({ user: userData, role: 'admin' })
        }
      }
    } catch (e) {
      console.warn('Auth init error:', e)
    } finally {
      set({ isLoading: false })
    }
  },

  setUser: async (user, accessToken, refreshToken) => {
    await storage.set('accessToken', accessToken)
    await storage.set('refreshToken', refreshToken)
    await storage.set('userRole', 'user')
    await storage.set('userData', JSON.stringify(user))
    set({ user, role: 'user', partner: null })
  },

  setPartner: async (partner, accessToken, refreshToken) => {
    await storage.set('accessToken', accessToken)
    await storage.set('refreshToken', refreshToken)
    await storage.set('userRole', 'partner')
    await storage.set('userData', JSON.stringify(partner))
    set({ partner, role: 'partner', user: null })
  },

  setAdmin: async (admin, accessToken, refreshToken) => {
    await storage.set('accessToken', accessToken)
    await storage.set('refreshToken', refreshToken)
    await storage.set('userRole', 'admin')
    await storage.set('userData', JSON.stringify(admin))
    set({ user: admin, role: 'admin', partner: null })
  },

  updateUser: async (updatedUser) => {
    await storage.set('userData', JSON.stringify(updatedUser))
    set({ user: updatedUser })
  },

  updatePartner: async (updatedPartner) => {
    await storage.set('userData', JSON.stringify(updatedPartner))
    set({ partner: updatedPartner })
  },

  logout: async () => {
    await storage.delete('accessToken')
    await storage.delete('refreshToken')
    await storage.delete('userRole')
    await storage.delete('userData')
    set({ user: null, partner: null, role: null })
  },

  // Getters
  isAuthenticated: () => !!get().role,
  isUser:    () => get().role === 'user',
  isPartner: () => get().role === 'partner',
  isAdmin:   () => get().role === 'admin',
  currentEntity: () => get().user || get().partner,
}))

export default useAuthStore
