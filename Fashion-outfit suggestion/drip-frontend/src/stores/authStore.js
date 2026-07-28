/**
 * @fileoverview Authentication state management with Zustand.
 * Handles user, partner, and admin authentication states.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      partner: null,
      role: null,
      _hasHydrated: false,

      setUser: (user, accessToken) => {
        localStorage.setItem('accessToken', accessToken)
        set({ user, role: 'user', partner: null })
      },
      setPartner: (partner, accessToken) => {
        localStorage.setItem('accessToken', accessToken)
        set({ partner, role: 'partner', user: null })
      },
      setAdmin: (admin, accessToken) => {
        localStorage.setItem('accessToken', accessToken)
        set({ user: admin, role: 'admin', partner: null })
      },
      updateUser: (u) => set({ user: u }),
      updatePartner: (p) => set({ partner: p }),
      logout: () => {
        localStorage.removeItem('accessToken')
        set({ user: null, partner: null, role: null })
      },
      isAuthenticated: () => !!(get().role && localStorage.getItem('accessToken')),
      isUser: () => get().role === 'user',
      isPartner: () => get().role === 'partner',
      isAdmin: () => get().role === 'admin',
      currentEntity: () => get().user || get().partner,
    }),
    {
      name: 'drip-auth',
      partialize: (s) => ({ user: s.user, partner: s.partner, role: s.role }),
      onRehydrateStorage: () => (state) => {
        state._hasHydrated = true
      },
    }
  )
)

export default useAuthStore
