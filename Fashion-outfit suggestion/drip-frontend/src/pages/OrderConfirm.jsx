/**
 * @fileoverview Order confirmation page shown after successful order placement.
 */

import { useLocation, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, ShoppingBag, Truck, MapPin, CreditCard, ChevronRight } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'
import Button from '../components/ui/Button'

const OrderConfirm = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const order = location.state?.order

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">No Order Found</h1>
          <p className="text-gray-500 mb-4">Your order information is not available.</p>
          <Button onClick={() => navigate('/orders')}>View My Orders</Button>
        </div>
      </div>
    )
  }

  const isCod = order.paymentMethod === 'cod'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-500">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-semibold text-lg">{order.orderNumber}</p>
            </div>
            <Link to={`/orders/${order._id}`}>
              <Button variant="outline" size="sm">
                View Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5 text-brand" />
              <span className="font-medium">Estimated Delivery</span>
            </div>
            <p className="text-gray-500 text-sm pl-7">
              3-5 business days
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
          <h2 className="font-semibold mb-4">Order Summary</h2>

          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <img
                  src={item.outfitSnapshot?.thumbnailUrl}
                  alt={item.outfitSnapshot?.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.outfitSnapshot?.title}</p>
                  <p className="text-sm text-gray-500">
                    Size: {item.size} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium">{formatPrice(item.priceAtAdd * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(order.subtotal || order.totalAmount)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span>{formatPrice(order.deliveryFee)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-500">-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-800">
              <span>Total</span>
              <span className="text-brand">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-brand" />
            <h2 className="font-semibold">Delivery Address</h2>
          </div>
          <div className="text-sm">
            <p className="font-medium text-base">{order.deliveryAddress?.fullName}</p>
            <p className="text-gray-500 mt-1">{order.deliveryAddress?.phone}</p>
            <p className="mt-2">{order.deliveryAddress?.addressLine1}</p>
            {order.deliveryAddress?.addressLine2 && (
              <p>{order.deliveryAddress.addressLine2}</p>
            )}
            <p className="mt-1">
              {order.deliveryAddress?.city}, {order.deliveryAddress?.province} {order.deliveryAddress?.postalCode}
            </p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-brand" />
            <h2 className="font-semibold">Payment Information</h2>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">
                {isCod ? 'Cash on Delivery' : 'Card Payment'}
              </p>
              <p className="text-sm text-gray-500">
                {isCod ? 'Pay when you receive' : 'Paid via Stripe'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              order.paymentStatus === 'paid'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {order.paymentStatus === 'paid' ? 'Paid' : isCod ? 'Pay on Delivery' : 'Pending'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/orders')}
          >
            View My Orders
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigate('/explore')}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirm
