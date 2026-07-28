/**
 * @fileoverview UI state management for modals, drawers, and theme.
 */

import { create } from 'zustand'

const useUIStore = create((set) => ({
  isDarkMode: false,
  isSearchOpen: false,
  activeModal: null,
  modalData: null,

  toggleDarkMode: () => set((state) => {
    const newMode = !state.isDarkMode
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return { isDarkMode: newMode }
  }),

  setDarkMode: (value) => set(() => {
    if (value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return { isDarkMode: value }
  }),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  openModal: (modalName, data = null) => set({ activeModal: modalName, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}))

export default useUIStore
