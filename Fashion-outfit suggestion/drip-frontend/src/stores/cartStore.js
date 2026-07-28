/**
 * @fileoverview Shopping cart state management.
 */

import { create } from 'zustand'

const useCartStore = create((set) => ({
  items: [],
  totalAmount: 0,
  itemCount: 0,
  setCart: (cart) => set({
    items: cart?.items || [],
    totalAmount: cart?.totalAmount || 0,
    itemCount: (cart?.items || []).reduce((s, i) => s + i.quantity, 0)
  }),
  clearCart: () => set({ items: [], totalAmount: 0, itemCount: 0 }),
}))

export default useCartStore
