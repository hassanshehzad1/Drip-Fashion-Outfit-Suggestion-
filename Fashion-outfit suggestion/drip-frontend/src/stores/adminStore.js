/**
 * @fileoverview Admin state management using Zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAdminStore = create(
  persist(
    (set) => ({
      // State
      admin: null,
      accessToken: null,
      isAuthenticated: false,
      _hasHydrated: false,

      // Actions
      setAdmin: (admin, accessToken) => {
        set({ admin, accessToken, isAuthenticated: true, _hasHydrated: true })
      },

      logout: () => {
        set({ admin: null, accessToken: null, isAuthenticated: false })
      },

      updateAdmin: (updates) => {
        set((state) => ({
          admin: state.admin ? { ...state.admin, ...updates } : null
        }))
      }
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        admin: state.admin,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        state._hasHydrated = true
      },
    }
  )
)
