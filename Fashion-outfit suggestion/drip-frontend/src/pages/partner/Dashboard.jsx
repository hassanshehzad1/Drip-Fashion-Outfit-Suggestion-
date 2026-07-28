/**
 * @fileoverview Partner dashboard home page with stats and overview.
 */

import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { TrendingUp, Package, Users, DollarSign, ShoppingBag, ArrowUpRight } from 'lucide-react'
import { getPartnerStats, getPartnerOrders } from '../../api/order.api'
import { getMyOutfits } from '../../api/outfit.api'
import useAuthStore from '../../stores/authStore'
import { formatPrice } from '../../utils/formatPrice'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

const StatCard = ({ title, value, icon: Icon, trend, color = 'brand' }) => {
  const colors = {
    brand: 'bg-brand/10 text-brand',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-4 text-sm text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  )
}

const Dashboard = () => {
  const { partner } = useAuthStore()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['partner-stats'],
    queryFn: async () => {
      const response = await getPartnerStats()
      return response.data.data.stats
    }
  })

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['partner-orders', 'pending'],
    queryFn: async () => {
      const response = await getPartnerOrders({ status: 'pending', limit: 5 })
      return response.data.data.orders
    }
  })

  const { data: outfitsData, isLoading: outfitsLoading } = useQuery({
    queryKey: ['my-outfits', 'recent'],
    queryFn: async () => {
      const response = await getMyOutfits({ limit: 4 })
      return {
        outfits: response.data.data.outfits,
        total: response.data.pagination?.total || response.data.data.outfits?.length || 0
      }
    }
  })

  if (statsLoading || ordersLoading || outfitsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {partner?.brandName}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/upload">
            <Button>+ Upload Outfit</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          value={stats?.totalSales || 0}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          title="Revenue"
          value={formatPrice(stats?.totalRevenue || 0)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Followers"
          value={partner?.followersCount?.toLocaleString() || 0}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Outfits"
          value={outfitsData?.total || 0}
          icon={Package}
        />
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold">Pending Orders</h2>
            <Link to="/dashboard/orders" className="text-sm text-brand hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {orders?.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No pending orders
              </div>
            ) : (
              orders?.slice(0, 5).map(order => (
                <div key={order._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.items?.length} items</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold">{formatPrice(order.totalAmount)}</span>
                    <Badge variant="warning">{order.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/dashboard/upload"
              className="p-4 rounded-xl bg-brand/5 hover:bg-brand/10 border border-brand/20 transition-colors"
            >
              <Package className="w-6 h-6 text-brand mb-2" />
              <p className="font-medium">Upload Outfit</p>
              <p className="text-sm text-gray-500">Add new items</p>
            </Link>
            <Link
              to="/dashboard/orders"
              className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 transition-colors"
            >
              <ShoppingBag className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-medium">View Orders</p>
              <p className="text-sm text-gray-500">Manage orders</p>
            </Link>
            <Link
              to="/dashboard/outfits"
              className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 transition-colors"
            >
              <ArrowUpRight className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-medium">My Outfits</p>
              <p className="text-sm text-gray-500">Manage listings</p>
            </Link>
            <Link
              to="/dashboard/profile"
              className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 transition-colors"
            >
              <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-medium">Analytics</p>
              <p className="text-sm text-gray-500">View insights</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Outfits */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Outfits</h2>
          <Link to="/dashboard/outfits" className="text-sm text-brand hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {outfitsData?.outfits?.map(outfit => (
            <Link
              key={outfit._id}
              to={`/outfit/${outfit._id}`}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-card"
            >
              <img
                src={outfit.video?.thumbnailUrl || outfit.images?.[0]?.url}
                alt={outfit.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-white font-medium text-sm truncate">{outfit.title}</p>
                <p className="text-white/80 text-xs">{formatPrice(outfit.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
