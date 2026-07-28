/**
 * @fileoverview Shopping cart page.
 */

import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCart, updateCartItem, removeCartItem, clearCart } from '../api/cart.api'
import useCartStore from '../stores/cartStore'
import { formatPrice } from '../utils/formatPrice'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'

const Cart = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setCart } = useCartStore()

  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await getCart()
      return response.data.data.cart
    }
  })

  useEffect(() => {
    if (data) {
      setCart(data)
    }
  }, [data, setCart])

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => updateCartItem(itemId, quantity),
    onSuccess: (response) => {
      setCart(response.data.data.cart)
      queryClient.setQueryData(['cart'], response.data.data.cart)
    }
  })

  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: (response) => {
      setCart(response.data.data.cart)
      queryClient.setQueryData(['cart'], response.data.data.cart)
      toast.success('Item removed')
    }
  })

  const cart = data
  const items = cart?.items || []

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet."
          action={
            <Link to="/feed">
              <Button>Browse Feed</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-dark-card rounded-xl p-4 flex gap-4"
              >
                <img
                  src={item.outfit?.video?.thumbnailUrl || item.outfitSnapshot?.thumbnailUrl}
                  alt={item.outfitSnapshot?.title}
                  className="w-24 h-24 rounded-lg object-cover bg-gray-100"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {item.outfitSnapshot?.title}
                  </h3>
                  <p className="text-sm text-gray-500">{item.outfitSnapshot?.partnerName}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-dark-surface rounded text-xs">
                      Size: {item.size}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateMutation.mutate({ itemId: item._id, quantity: Math.max(1, item.quantity - 1) })}
                        disabled={item.quantity <= 1 || updateMutation.isPending}
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-surface flex items-center justify-center disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateMutation.mutate({ itemId: item._id, quantity: Math.min(10, item.quantity + 1) })}
                        disabled={item.quantity >= 10 || updateMutation.isPending}
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-surface flex items-center justify-center disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-brand">
                        {formatPrice(item.priceAtAdd * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeMutation.mutate(item._id)}
                        disabled={removeMutation.isPending}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => clearCart().then(() => { queryClient.invalidateQueries(['cart']); toast.success('Cart cleared') })}
              className="text-sm text-red-500 hover:underline"
            >
              Clear all items
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 h-fit">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>{formatPrice(cart?.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery</span>
                <span className="text-green-500">Free</span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-brand">{formatPrice(cart?.totalAmount || 0)}</span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/checkout')}
              className="w-full"
              size="lg"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Link
              to="/feed"
              className="block text-center mt-4 text-sm text-brand hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
