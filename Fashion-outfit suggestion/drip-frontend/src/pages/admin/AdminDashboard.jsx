/**
 * @fileoverview Admin Dashboard with Analytics, Users, Partners, Outfits, Orders, Admins tabs
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard, Users, Store, Shirt, ShoppingCart, Shield,
  Search, Ban, CheckCircle, XCircle, Eye, Trash2, Plus,
  TrendingUp, DollarSign, Package, UserCheck, AlertCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useAdminStore } from '../../stores/adminStore'
import { parseApiError } from '../../utils/parseApiError'
import { formatPrice } from '../../utils/formatPrice'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'

const TABS = [
  { key: 'analytics', label: 'Analytics', icon: LayoutDashboard },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'partners', label: 'Partners', icon: Store },
  { key: 'outfits', label: 'Outfits', icon: Shirt },
  { key: 'orders', label: 'Orders', icon: ShoppingCart },
  { key: 'admins', label: 'Admins', icon: Shield }
]

// ============ ANALYTICS TAB ============
const AnalyticsTab = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics')
      return response.data.data
    }
  })

  if (isLoading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>

  const stats = data || {}

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.overview?.totalUsers} color="blue" />
        <StatCard icon={UserCheck} label="Active Users" value={stats.overview?.activeUsers} color="green" />
        <StatCard icon={Store} label="Total Partners" value={stats.overview?.totalPartners} color="purple" />
        <StatCard icon={CheckCircle} label="Approved Partners" value={stats.overview?.approvedPartners} color="success" />
        <StatCard icon={Shirt} label="Total Outfits" value={stats.overview?.totalOutfits} color="pink" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats.overview?.totalOrders} color="warning" />
        <StatCard icon={DollarSign} label="Total Revenue" value={formatPrice(stats.overview?.totalRevenue)} color="brand" />
      </div>

      {/* This Month Stats */}
      <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold mb-4">This Month</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-dark-surface rounded-lg">
            <p className="text-2xl font-bold text-brand">{stats.thisMonth?.newUsers || 0}</p>
            <p className="text-sm text-gray-500">New Users</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-dark-surface rounded-lg">
            <p className="text-2xl font-bold text-purple-500">{stats.thisMonth?.newPartners || 0}</p>
            <p className="text-sm text-gray-500">New Partners</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-dark-surface rounded-lg">
            <p className="text-2xl font-bold text-warning">{stats.thisMonth?.orders || 0}</p>
            <p className="text-sm text-gray-500">Orders</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-dark-surface rounded-lg">
            <p className="text-2xl font-bold text-green-500">{formatPrice(stats.thisMonth?.revenue || 0)}</p>
            <p className="text-sm text-gray-500">Revenue</p>
          </div>
        </div>
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Outfits */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4">Top Outfits</h3>
          <div className="space-y-3">
            {stats.topOutfits?.length > 0 ? (
              stats.topOutfits.map((outfit, i) => (
                <div key={outfit._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-surface rounded-lg">
                  <span className="w-6 h-6 flex items-center justify-center bg-brand text-white text-xs font-bold rounded-full">{i + 1}</span>
                  <img src={outfit.video?.thumbnailUrl} alt={outfit.title} className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{outfit.title}</p>
                    <p className="text-xs text-gray-500">{outfit.likesCount || 0} likes • {outfit.viewsCount || 0} views</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No outfits found</p>
            )}
          </div>
        </div>

        {/* Top Partners */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4">Top Partners</h3>
          <div className="space-y-3">
            {stats.topPartners?.length > 0 ? (
              stats.topPartners.map((partner, i) => (
                <div key={partner._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-surface rounded-lg">
                  <span className="w-6 h-6 flex items-center justify-center bg-brand text-white text-xs font-bold rounded-full">{i + 1}</span>
                  <Avatar
                    src={partner.logo?.url}
                    name={partner.brandName}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{partner.brandName}</p>
                    <p className="text-xs text-gray-500">{partner.followersCount || 0} followers</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No partners found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`bg-${color}-50 dark:bg-${color}-900/10 rounded-xl p-4 border border-${color}-200 dark:border-${color}-800`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg bg-${color}-100 dark:bg-${color}-900/20 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 text-${color}-500`} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value || 0}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  </div>
)

// ============ USERS TAB ============
const UsersTab = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, isActiveFilter, page],
    queryFn: async () => {
      const params = { page, limit: 10 }
      if (search) params.q = search
      if (isActiveFilter) params.isActive = isActiveFilter
      const response = await api.get('/admin/users', { params })
      return response.data.data
    }
  })

  const banMutation = useMutation({
    mutationFn: (userId) => api.patch(`/admin/users/${userId}/ban`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User banned')
    },
    onError: (error) => toast.error(parseApiError(error).message)
  })

  const unbanMutation = useMutation({
    mutationFn: (userId) => api.patch(`/admin/users/${userId}/unban`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User unbanned')
    },
    onError: (error) => toast.error(parseApiError(error).message)
  })

  const users = data?.users || []
  const pagination = data?.pagination

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={isActiveFilter}
          onChange={(e) => setIsActiveFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card"
        >
          <option value="">All Users</option>
          <option value="true">Active</option>
          <option value="false">Banned</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-surface">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Orders</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-dark-surface">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatar}
                          name={user.name}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Active' : 'Banned'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{user.ordersCount || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {user.isActive ? (
                        <button
                          onClick={() => banMutation.mutate(user._id)}
                          disabled={banMutation.isPending}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => unbanMutation.mutate(user._id)}
                          disabled={unbanMutation.isPending}
                          className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ============ PARTNERS TAB ============
const PartnersTab = () => {
  const queryClient = useQueryClient()
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingPartner, setRejectingPartner] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: async () => {
      // Show pending first by default
      const response = await api.get('/admin/partners', { params: { isApproved: false } })
      return response.data.data.partners
    }
  })

  const approveMutation = useMutation({
    mutationFn: (partnerId) => api.patch(`/admin/partners/${partnerId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] })
      toast.success('Partner approved')
    },
    onError: (error) => toast.error(parseApiError(error).message)
  })

  const rejectMutation = useMutation({
    mutationFn: ({ partnerId, reason }) => api.patch(`/admin/partners/${partnerId}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] })
      toast.success('Partner rejected')
      setShowRejectModal(false)
      setRejectingPartner(null)
      setRejectReason('')
    },
    onError: (error) => toast.error(parseApiError(error).message)
  })

  const banMutation = useMutation({
    mutationFn: (partnerId) => api.patch(`/admin/partners/${partnerId}/ban`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] })
      toast.success('Partner banned')
    },
    onError: (error) => toast.error(parseApiError(error).message)
  })

  const unbanMutation = useMutation({
    mutationFn: (partnerId) => api.patch(`/admin/partners/${partnerId}/unban`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] })
      toast.success('Partner unbanned')
    },
    onError: (error) => toast.error(parseApiError(error).message)
  })

  const partners = data || []

  const handleReject = (partner) => {
    setRejectingPartner(partner)
    setShowRejectModal(true)
  }

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason')
      return
    }
    rejectMutation.mutate({ partnerId: rejectingPartner._id, reason: rejectReason })
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-surface">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Partner</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Outfits</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {partners.map(partner => (
                <tr key={partner._id} className="hover:bg-gray-50 dark:hover:bg-dark-surface">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={partner.logo}
                        name={partner.brandName}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium">{partner.brandName}</p>
                        <p className="text-sm text-gray-500">{partner.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {partner.isApproved ? (
                      <Badge variant={partner.isActive ? 'success' : 'danger'}>
                        {partner.isActive ? 'Approved' : 'Banned'}
                      </Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">{partner.outfitsCount || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {!partner.isApproved ? (
                        <>
                          <button
                            onClick={() => approveMutation.mutate(partner._id)}
                            disabled={approveMutation.isPending}
                            className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(partner)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      ) : partner.isActive ? (
                        <button
                          onClick={() => banMutation.mutate(partner._id)}
                          disabled={banMutation.isPending}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => unbanMutation.mutate(partner._id)}
                          disabled={unbanMutation.isPending}
                          className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Partner"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Please provide a reason for rejecting {rejectingPartner?.brandName}</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card min-h-[100px]"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
            <Button onClick={confirmReject} disabled={rejectMutation.isPending}>
              {rejectMutation.isPending ? <Spinner size="sm" /> : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ============ OUTFITS TAB ============
const OutfitsTab = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-outfits'],
    queryFn: async () => {
      const response = await api.get('/admin/outfits')
      return response.data.data.outfits
    }
  })

  const removeMutation = useMutation({
    mutationFn: (outfitId) => api.delete(`/admin/outfits/${outfitId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-outfits'] })
      toast.success('Outfit removed')
    },
    onError: (error) => toast.error(parseApiError(error).message)
  })

  const outfits = data || []

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-surface">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Outfit</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Partner</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Engagement</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {outfits.map(outfit => (
                <tr key={outfit._id} className="hover:bg-gray-50 dark:hover:bg-dark-surface">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={outfit.thumbnailUrl} alt={outfit.title} className="w-12 h-12 rounded object-cover" />
                      <p className="font-medium">{outfit.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{outfit.partner?.brandName}</td>
                  <td className="px-4 py-3 text-sm">
                    {outfit.likesCount} likes • {outfit.viewsCount} views
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeMutation.mutate(outfit._id)}
                      disabled={removeMutation.isPending}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ============ ORDERS TAB ============
const OrdersTab = () => {
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, paymentFilter, page],
    queryFn: async () => {
      const params = { page, limit: 10 }
      if (statusFilter) params.status = statusFilter
      if (paymentFilter) params.paymentStatus = paymentFilter
      const response = await api.get('/admin/orders', { params })
      return response.data.data
    }
  })

  const { data: orderDetail } = useQuery({
    queryKey: ['admin-order', selectedOrder],
    queryFn: async () => {
      if (!selectedOrder) return null
      const response = await api.get(`/admin/orders/${selectedOrder}`)
      return response.data.data.order
    },
    enabled: !!selectedOrder
  })

  const orders = data?.orders || []
  const pagination = data?.pagination

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card"
        >
          <option value="">All Payment</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-surface">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Order</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-dark-surface">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.user?.name}</p>
                      <p className="text-sm text-gray-500">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-brand">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(order._id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order ${orderDetail?.orderNumber}`}
      >
        {orderDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-dark-surface rounded-lg">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">{orderDetail.status}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-dark-surface rounded-lg">
                <p className="text-sm text-gray-500">Payment</p>
                <p className="font-medium capitalize">{orderDetail.paymentStatus}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Customer</h4>
              <p className="text-sm">{orderDetail.user?.name}</p>
              <p className="text-sm text-gray-500">{orderDetail.user?.email}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Items</h4>
              <div className="space-y-2">
                {orderDetail.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-dark-surface rounded-lg">
                    <img src={item.outfitSnapshot?.thumbnailUrl} alt={item.outfitSnapshot?.title} className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.outfitSnapshot?.title}</p>
                      <p className="text-xs text-gray-500">Size: {item.size} × {item.quantity}</p>
                    </div>
                    <span className="font-medium">{formatPrice(item.priceAtAdd * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-brand">{formatPrice(orderDetail.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ============ ADMINS TAB ============
const AdminsTab = () => {
  const admin = useAdminStore(state => state.admin)
  const isSuperAdmin = admin?.role === 'superadmin'

  const [showAddModal, setShowAddModal] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'admin' })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-admins'],
    queryFn: async () => {
      const response = await api.get('/admin/admins')
      return response.data.data.admins
    },
    enabled: isSuperAdmin
  })

  const addMutation = useMutation({
    mutationFn: (data) => api.post('/admin/admins', data),
    onSuccess: () => {
      toast.success('Admin added')
      setShowAddModal(false)
      setNewAdmin({ name: '', email: '', password: '', role: 'admin' })
    },
    onError: (error) => toast.error(parseApiError(error).message)
  })

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Only superadmins can manage admins</p>
      </div>
    )
  }

  const admins = data || []

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Admin
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-surface">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Admin</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {admins.map(a => (
                <tr key={a._id} className="hover:bg-gray-50 dark:hover:bg-dark-surface">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-medium">
                        {a.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{a.name}</p>
                        <p className="text-sm text-gray-500">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={a.role === 'superadmin' ? 'danger' : 'primary'}>
                      {a.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={a.isActive ? 'success' : 'danger'}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Admin Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Admin"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={newAdmin.name}
            onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
            placeholder="John Doe"
          />
          <Input
            label="Email"
            type="email"
            value={newAdmin.email}
            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
            placeholder="admin@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={newAdmin.password}
            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
            placeholder="••••••••"
          />
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={newAdmin.role}
              onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button
              onClick={() => addMutation.mutate(newAdmin)}
              disabled={addMutation.isPending || !newAdmin.name || !newAdmin.email || !newAdmin.password}
            >
              {addMutation.isPending ? <Spinner size="sm" /> : 'Add Admin'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ============ MAIN DASHBOARD ============
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics')
  const admin = useAdminStore(state => state.admin)
  const logout = useAdminStore(state => state.logout)

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      {/* Header */}
      <header className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">{admin?.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand text-white'
                    : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'partners' && <PartnersTab />}
        {activeTab === 'outfits' && <OutfitsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'admins' && <AdminsTab />}
      </div>
    </div>
  )
}

export default AdminDashboard
