/**
 * @fileoverview User orders page to view order history and track deliveries.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import { getMyOrders } from '../api/order.api'
import { formatPrice } from '../utils/formatPrice'
import { formatTimeAgo } from '../utils/timeAgo'
import { parseApiError } from '../utils/parseApiError'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'

const statusConfig = {
  pending: { label: 'Pending', color: 'warning', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'primary', icon: Package },
  processing: { label: 'Processing', color: 'purple', icon: Package },
  shipped: { label: 'Shipped', color: 'info', icon: Truck },
  delivered: { label: 'Delivered', color: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'danger', icon: XCircle }
}

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' }
]

const Orders = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-orders', activeTab],
    queryFn: async () => {
      const params = { limit: 50 }
      if (activeTab !== 'all') {
        params.status = activeTab
      }
      const response = await getMyOrders(params)
      console.log('Orders API response:', response.data)
      return response.data.data.orders
    }
  })

  const orders = data || []

  // Show error toast if API fails
  if (error) {
    const { message } = parseApiError(error)
    toast.error(message)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h1>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-brand text-white'
                  : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-2">No orders yet</p>
            <p className="text-sm text-gray-400 mb-4">Start shopping to see your orders here</p>
            <Link to="/explore">
              <button className="px-6 py-2 bg-brand text-white rounded-xl font-medium">
                Explore Outfits
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = statusConfig[order.status] || statusConfig.pending
              const StatusIcon = status.icon

              return (
                <div
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-200 dark:border-gray-800 cursor-pointer hover:border-brand transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{order.orderNumber}</span>
                        <Badge variant={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1 inline" />
                          {status.label}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-500 mb-2">
                        {order.partner?.brandName || 'Unknown Brand'}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <span>{formatTimeAgo(order.createdAt)}</span>
                        <span>•</span>
                        <span>{order.items?.length || 0} items</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-brand text-lg">{formatPrice(order.totalAmount)}</p>
                      <ChevronRight className="w-5 h-5 text-gray-400 mt-2 ml-auto" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

export default Orders
