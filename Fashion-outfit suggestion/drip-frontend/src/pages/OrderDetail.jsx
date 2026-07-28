/**
 * @fileoverview Order detail page with timeline and full order information.
 */

import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, MapPin, CreditCard, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getOrder, cancelOrder } from '../api/order.api'
import { formatPrice } from '../utils/formatPrice'
import { formatTimeAgo } from '../utils/timeAgo'
import { parseApiError } from '../utils/parseApiError'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'

const statusConfig = {
  pending: { label: 'Pending', color: 'warning', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'primary', icon: Package },
  processing: { label: 'Processing', color: 'purple', icon: Package },
  shipped: { label: 'Shipped', color: 'info', icon: Truck },
  delivered: { label: 'Delivered', color: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'danger', icon: XCircle }
}

const timelineSteps = [
  { key: 'pending', label: 'Placed', description: 'Order placed successfully' },
  { key: 'confirmed', label: 'Confirmed', description: 'Order confirmed by partner' },
  { key: 'processing', label: 'Processing', description: 'Preparing your order' },
  { key: 'shipped', label: 'Shipped', description: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered', description: 'Order delivered' }
]

const OrderDetail = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await getOrder(orderId)
      return response.data.data.order
    }
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(orderId, cancelReason),
    onSuccess: () => {
      toast.success('Order cancelled successfully')
      setShowCancelModal(false)
      queryClient.invalidateQueries(['order', orderId])
      queryClient.invalidateQueries(['my-orders'])
    },
    onError: (error) => {
      toast.error(parseApiError(error).message)
    }
  })

  const order = data

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Order not found</p>
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        </div>
      </div>
    )
  }

  const status = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = status.icon

  // Find current step index
  const currentStepIndex = timelineSteps.findIndex(step => step.key === order.status)
  const isCancelled = order.status === 'cancelled'
  const canCancel = ['pending', 'confirmed'].includes(order.status)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Details</h1>
            <p className="text-sm text-gray-500">{order.orderNumber}</p>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`bg-${status.color}-50 dark:bg-${status.color}-900/10 rounded-xl p-4 mb-6 border border-${status.color}-200 dark:border-${status.color}-800`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-${status.color}-100 dark:bg-${status.color}-900/20 flex items-center justify-center`}>
              <StatusIcon className={`w-6 h-6 text-${status.color}-500`} />
            </div>
            <div>
              <p className={`font-semibold text-${status.color}-700 dark:text-${status.color}-300`}>
                {status.label}
              </p>
              <p className="text-sm text-gray-500">{formatTimeAgo(order.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {!isCancelled && (
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
            <h2 className="font-semibold mb-6">Order Timeline</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-6">
                {timelineSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex && currentStepIndex >= 0
                  const isCurrent = index === currentStepIndex

                  return (
                    <div key={step.key} className="relative flex items-start gap-4">
                      {/* Dot */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10 ${
                          isCompleted
                            ? isCurrent
                              ? 'bg-brand text-white'
                              : 'bg-green-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 pt-1">
                        <p className={`font-medium ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                          {step.label}
                        </p>
                        <p className="text-sm text-gray-500">{step.description}</p>
                        {isCurrent && order.statusUpdates?.[step.key] && (
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(order.statusUpdates[step.key])}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
          <h2 className="font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items?.map((item, i) => {
              const price = item.priceAtAdd || item.outfitSnapshot?.price || 0
              const qty = item.quantity || 1
              const total = price * qty

              return (
                <div key={i} className="flex items-center gap-4">
                  <img
                    src={item.outfitSnapshot?.thumbnailUrl || '/placeholder-outfit.png'}
                    alt={item.outfitSnapshot?.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <Link to={`/outfit/${item.outfitSnapshot?.outfitId || item.outfitId}`}>
                      <p className="font-medium hover:text-brand">{item.outfitSnapshot?.title || 'Unknown Item'}</p>
                    </Link>
                    <p className="text-sm text-gray-500">
                      Brand: {item.partnerSnapshot?.brandName || order.partner?.brandName || 'Unknown Brand'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Size: {item.size} × {qty}
                    </p>
                  </div>
                  <p className="font-bold text-brand">{formatPrice(total)}</p>
                </div>
              )
            })}
          </div>

          {/* Totals */}
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
              <p className="font-medium">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</p>
              <p className="text-sm text-gray-500">
                {order.paymentMethod === 'cod' ? 'Pay when you receive' : 'Paid via Stripe'}
              </p>
            </div>
            <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
              {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
            </Badge>
          </div>
        </div>

        {/* Cancel Button */}
        {canCancel && (
          <Button
            variant="outline"
            className="w-full border-red-300 text-red-500 hover:bg-red-50"
            onClick={() => setShowCancelModal(true)}
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Cancel Order
          </Button>
        )}

        {/* Cancel Reason Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Order"
        >
          <div className="space-y-4">
            <p className="text-gray-600">Please tell us why you want to cancel this order:</p>
            <Input
              as="textarea"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Changed my mind, ordered by mistake..."
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Order
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-300 text-red-500"
                onClick={() => cancelMutation.mutate()}
                loading={cancelMutation.isPending}
                disabled={!cancelReason.trim()}
              >
                Confirm Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default OrderDetail
