/**
 * @fileoverview Checkout page with delivery address and payment (Stripe/COD).
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Truck, MapPin, ShoppingBag, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQuery, useMutation } from '@tanstack/react-query'
import { checkoutOrder } from '../api/order.api'
import { getCart } from '../api/cart.api'
import { z } from 'zod'
import { parseApiError } from '../utils/parseApiError'
import { formatPrice } from '../utils/formatPrice'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

const pakistanProvinces = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Jammu and Kashmir',
  'Islamabad Capital Territory'
]

const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string().min(1, 'Postal code is required')
})

const CheckoutForm = () => {
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [clientSecret, setClientSecret] = useState('')
  const [showStripeForm, setShowStripeForm] = useState(false)

  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await getCart()
      return response.data.data.cart
    }
  })

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      province: '',
      postalCode: ''
    }
  })

  const checkoutMutation = useMutation({
    mutationFn: checkoutOrder,
    onSuccess: (response) => {
      const data = response.data.data

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!')
        navigate('/order-confirm', { state: { order: data.order } })
      } else if (paymentMethod === 'stripe' && data.clientSecret) {
        setClientSecret(data.clientSecret)
        setShowStripeForm(true)
      }
    },
    onError: (error) => {
      const { message, fieldErrors } = parseApiError(error)

      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, msg]) => {
          setError(field, { message: msg })
        })
      } else {
        toast.error(message)
      }
    }
  })

  const handleStripePayment = async () => {
    if (!stripe || !elements) return

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: checkoutMutation.variables?.deliveryAddress?.fullName,
          phone: checkoutMutation.variables?.deliveryAddress?.phone
        }
      }
    })

    if (error) {
      toast.error(error.message)
    } else if (paymentIntent.status === 'succeeded') {
      toast.success('Payment successful!')
      navigate('/order-confirm', { state: { order: checkoutMutation.variables } })
    }
  }

  const onSubmit = (data) => {
    console.log('Form submitted with data:', data)
    console.log('Payment method:', paymentMethod)

    const payload = {
      deliveryAddress: data,
      paymentMethod
    }
    console.log('Sending payload:', payload)
    checkoutMutation.mutate(payload)
  }

  const onError = (formErrors) => {
    console.log('Form validation errors:', formErrors)
    toast.error('Please fill in all required fields')
  }

  const cart = cartData
  const cartItems = cart?.items || []

  // Calculate totals from items if summary is not available
  const subtotal = cart?.summary?.subtotal || cartItems.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0)
  const deliveryFee = cart?.summary?.deliveryFee || 0
  const discount = cart?.summary?.discount || 0
  const cartTotal = cart?.summary?.total || (subtotal + deliveryFee - discount)

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-4">Add some outfits to proceed to checkout</p>
          <Button onClick={() => navigate('/explore')}>Explore Outfits</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Delivery Address Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-brand" />
                <h2 className="text-lg font-semibold">Delivery Address</h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
                {/* General Form Errors */}
                {Object.keys(errors).length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700 dark:text-red-300">
                      <p className="font-medium">Please fix the following errors:</p>
                      <ul className="mt-1 list-disc list-inside">
                        {Object.entries(errors).map(([field, error]) => (
                          <li key={field}>{error.message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    placeholder="Enter your full name"
                    error={errors.fullName?.message}
                    {...register('fullName')}
                  />
                  <Input
                    label="Phone Number *"
                    placeholder="+92 XXX XXXXXXX"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>

                <Input
                  label="Address Line 1 *"
                  placeholder="House/Building number, Street"
                  error={errors.addressLine1?.message}
                  {...register('addressLine1')}
                />

                <Input
                  label="Address Line 2 (Optional)"
                  placeholder="Area, Landmark (optional)"
                  error={errors.addressLine2?.message}
                  {...register('addressLine2')}
                />

                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    label="City *"
                    placeholder="e.g. Lahore"
                    error={errors.city?.message}
                    {...register('city')}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Province *
                    </label>
                    <select
                      {...register('province')}
                      className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 bg-white dark:bg-dark-surface focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
                    >
                      <option value="">Select Province</option>
                      {pakistanProvinces.map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                    {errors.province && (
                      <p className="mt-1 text-sm text-red-500">{errors.province.message}</p>
                    )}
                  </div>
                  <Input
                    label="Postal Code *"
                    placeholder="e.g. 54000"
                    error={errors.postalCode?.message}
                    {...register('postalCode')}
                  />
                </div>

                {/* Payment Method */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-brand" />
                    <h2 className="text-lg font-semibold">Payment Method</h2>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('cod')
                        setShowStripeForm(false)
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        paymentMethod === 'cod'
                          ? 'border-brand bg-brand/5'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="w-6 h-6" />
                        <div>
                          <p className="font-semibold">Cash on Delivery</p>
                          <p className="text-sm text-gray-500">Pay when you receive</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('stripe')
                        setShowStripeForm(false)
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        paymentMethod === 'stripe'
                          ? 'border-brand bg-brand/5'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6" />
                        <div>
                          <p className="font-semibold">Card Payment</p>
                          <p className="text-sm text-gray-500">Pay securely with Stripe</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Stripe Card Element */}
                {showStripeForm && paymentMethod === 'stripe' && (
                  <div className="bg-gray-50 dark:bg-dark-surface rounded-xl p-4">
                    <label className="block text-sm font-medium mb-2">Card Details</label>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-dark-card">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#424770',
                              '::placeholder': { color: '#aab7c4' }
                            }
                          }
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleStripePayment}
                      className="w-full mt-4"
                      loading={checkoutMutation.isPending}
                      disabled={!stripe}
                    >
                      Pay {formatPrice(cartTotal)}
                    </Button>
                  </div>
                )}

                {/* Submit Button for COD */}
                {!showStripeForm && paymentMethod === 'cod' && (
                  <Button
                    type="submit"
                    className="w-full"
                    loading={checkoutMutation.isPending}
                  >
                    <Truck className="w-5 h-5 mr-2" />
                    Place Order - {formatPrice(cartTotal)}
                  </Button>
                )}

                {/* Submit Button for Stripe (to get client secret) */}
                {!showStripeForm && paymentMethod === 'stripe' && (
                  <Button
                    type="submit"
                    className="w-full"
                    loading={checkoutMutation.isPending}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceed to Payment - {formatPrice(cartTotal)}
                  </Button>
                )}
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800 sticky top-20">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item._id} className="flex gap-3">
                    <img
                      src={item.outfitSnapshot?.thumbnailUrl}
                      alt={item.outfitSnapshot?.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.outfitSnapshot?.title}</p>
                      <p className="text-xs text-gray-500">
                        Size: {item.size} × {item.quantity}
                      </p>
                      <p className="font-medium text-brand text-sm">
                        {formatPrice(item.priceAtAdd * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Free'}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-green-500">-{formatPrice(discount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-brand">{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}

export default Checkout
