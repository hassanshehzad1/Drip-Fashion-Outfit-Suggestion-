/**
 * @fileoverview Partner orders page with status-based tabs.
 * Orders are organized by status and move between pages as status changes.
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, ChevronRight, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPartnerOrders, updateOrderStatus } from '../../api/order.api'
import { formatPrice } from '../../utils/formatPrice'
import { formatTimeAgo } from '../../utils/timeAgo'
import { parseApiError } from '../../utils/parseApiError'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

const statusPages = [
  { key: 'pending', label: 'Pending', color: 'warning', icon: Clock, next: 'confirmed' },
  { key: 'confirmed', label: 'Confirmed', color: 'info', icon: Package, next: 'processing' },
  { key: 'processing', label: 'Processing', color: 'primary', icon: Package, next: 'shipped' },
  { key: 'shipped', label: 'Shipped', color: 'purple', icon: Truck, next: 'delivered' },
  { key: 'delivered', label: 'Delivered', color: 'success', icon: CheckCircle, next: null },
  { key: 'cancelled', label: 'Cancelled', color: 'danger', icon: XCircle, next: null }
]

const PartnerOrders = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['partner-orders', activeTab],
    queryFn: async () => {
      const response = await getPartnerOrders({ status: activeTab })
      return response.data.data.orders
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['partner-orders'], type: 'all' })
      toast.success('Order status updated')
      setSelectedOrder(null)
    },
    onError: (error) => {
      toast.error(parseApiError(error).message)
    }
  })

  const orders = data || []

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus })
  }

  const currentPage = statusPages.find(p => p.key === activeTab)
  const PageIcon = currentPage?.icon || Package

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Orders</h1>

      {/* Status Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
        {statusPages.map(page => {
          const Icon = page.icon
          const isActive = activeTab === page.key
          return (
            <button
              key={page.key}
              onClick={() => setActiveTab(page.key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? `bg-${page.color}-100 dark:bg-${page.color}-900/20 text-${page.color}-700 dark:text-${page.color}-300 border-2 border-${page.color}-300`
                  : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{page.label}</span>
            </button>
          )
        })}
      </div>

      {/* Page Header */}
      <div className={`bg-${currentPage.color}-50 dark:bg-${currentPage.color}-900/10 rounded-xl p-4 mb-6 border border-${currentPage.color}-200 dark:border-${currentPage.color}-800`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-${currentPage.color}-100 dark:bg-${currentPage.color}-900/20 flex items-center justify-center`}>
            <PageIcon className={`w-6 h-6 text-${currentPage.color}-500`} />
          </div>
          <div>
            <h2 className={`font-bold text-${currentPage.color}-700 dark:text-${currentPage.color}-300`}>
              {currentPage.label} Orders
            </h2>
            <p className="text-sm text-gray-500">
              {orders.length} order{orders.length !== 1 ? 's' : ''} in this stage
            </p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-surface border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Order</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {orders.map(order => {
                  const pageConfig = statusPages.find(p => p.key === activeTab)
                  const canMoveNext = pageConfig?.next && order.status === activeTab

                  return (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-dark-surface">
                      <td className="px-4 py-3">
                        <span className="font-medium">{order.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{order.deliveryAddress?.fullName}</p>
                          <p className="text-sm text-gray-500">{order.deliveryAddress?.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{order.items?.length} items</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-brand">{formatPrice(order.totalAmount)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={pageConfig?.color || 'primary'}>
                          <pageConfig.icon className="w-3 h-3 mr-1 inline" />
                          {pageConfig?.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatTimeAgo(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canMoveNext && (
                            <button
                              onClick={() => handleStatusChange(order._id, pageConfig.next)}
                              disabled={updateStatusMutation.isPending}
                              className="flex items-center gap-1 px-3 py-1.5 bg-brand text-white text-sm rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50"
                            >
                              Move to {statusPages.find(p => p.key === pageConfig.next)?.label}
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order ${selectedOrder?.orderNumber}`}
      >
        {selectedOrder && (() => {
          const CurrentIcon = currentPage?.icon || Package
          return (
          <div className="space-y-4">
            {/* Status & Action */}
            <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">Current Status</label>
              <div className="flex items-center justify-between">
                <Badge variant={currentPage?.color || 'primary'}>
                  <CurrentIcon className="w-3 h-3 mr-1 inline" />
                  {currentPage?.label}
                </Badge>

                {currentPage?.next ? (
                  <Button
                    onClick={() => handleStatusChange(selectedOrder._id, currentPage.next)}
                    disabled={updateStatusMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    Move to {statusPages.find(p => p.key === currentPage.next)?.label}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <span className="text-sm text-gray-500">Final status</span>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h4 className="font-medium mb-2">Customer</h4>
              <p className="text-sm">{selectedOrder.deliveryAddress?.fullName}</p>
              <p className="text-sm text-gray-500">{selectedOrder.deliveryAddress?.phone}</p>
            </div>

            {/* Address */}
            <div>
              <h4 className="font-medium mb-2">Delivery Address</h4>
              <p className="text-sm">{selectedOrder.deliveryAddress?.addressLine1}</p>
              {selectedOrder.deliveryAddress?.addressLine2 && (
                <p className="text-sm">{selectedOrder.deliveryAddress.addressLine2}</p>
              )}
              <p className="text-sm">{selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.province}</p>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-medium mb-2">Items</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, i) => {
                  const price = item.priceAtAdd || item.outfitSnapshot?.price || 0
                  const qty = item.quantity || 1
                  return (
                    <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-dark-surface rounded-lg">
                      <img
                        src={item.outfitSnapshot?.thumbnailUrl || '/placeholder-outfit.png'}
                        alt={item.outfitSnapshot?.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.outfitSnapshot?.title || 'Unknown Item'}</p>
                        <p className="text-xs text-gray-500">Size: {item.size} × {qty}</p>
                      </div>
                      <span className="font-medium">{formatPrice(price * qty)}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-brand">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => setSelectedOrder(null)}>
              Close
            </Button>
          </div>
          )
        })()}
      </Modal>
    </div>
  )
}

export default PartnerOrders
