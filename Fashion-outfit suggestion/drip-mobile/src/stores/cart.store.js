import { create } from 'zustand';
import { cartAPI } from '../api';

export const useCartStore = create((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  // Get cart
  getCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartAPI.getCart();
      set({ cart: response.data.cart, isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load cart',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Add to cart
  addToCart: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartAPI.addToCart(data);
      set({ cart: response.data.cart, isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to add to cart',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Update cart item
  updateCartItem: async (itemId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartAPI.updateCartItem(itemId, data);
      set({ cart: response.data.cart, isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update cart item',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Remove from cart
  removeFromCart: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartAPI.removeFromCart(itemId);
      set({ cart: response.data.cart, isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to remove from cart',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Clear cart
  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartAPI.clearCart();
      set({ cart: response.data.cart, isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to clear cart',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Get cart item count
  getCartItemCount: () => {
    const { cart } = get();
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Get cart total
  getCartTotal: () => {
    const { cart } = get();
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
