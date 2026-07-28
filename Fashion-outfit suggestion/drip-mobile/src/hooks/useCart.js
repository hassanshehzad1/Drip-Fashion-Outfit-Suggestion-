import { useCartStore } from '../stores';

export const useCart = () => {
  const {
    cart,
    isLoading,
    error,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartItemCount,
    getCartTotal,
    clearError,
  } = useCartStore();

  return {
    cart,
    isLoading,
    error,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartItemCount,
    getCartTotal,
    clearError,
  };
};
