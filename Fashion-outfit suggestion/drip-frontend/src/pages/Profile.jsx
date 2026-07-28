/**
 * @fileoverview User profile page with orders, likes, and bookmarks.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Settings, Heart, Bookmark, Package, Camera, LogOut, X, User, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { getMe, logoutUser, updateProfile } from '../api/auth.api'
import { profileUpdateSchema } from '../utils/validators'
import { getLikedOutfits, getBookmarkedOutfits } from '../api/social.api'
import { getMyOrders } from '../api/order.api'
import { getStyleAnalysis } from '../api/ai.api'
import useAuthStore from '../stores/authStore'
import { formatPrice } from '../utils/formatPrice'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'

const Profile = () => {
  const { user, logout, updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('saved')
  const [editing, setEditing] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || ''
    }
  })

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      const updatedUser = response.data.data.user
      updateUser(updatedUser)
      queryClient.invalidateQueries(['profile'])
      toast.success('Profile updated!')
      setEditing(false)
    },
    onError: () => {
      toast.error('Failed to update profile')
    }
  })

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await getMe()
      return response.data.data.user
    }
  })

  const { data: liked } = useQuery({
    queryKey: ['liked'],
    queryFn: async () => {
      const response = await getLikedOutfits()
      return response.data.data.outfits
    },
    enabled: activeTab === 'liked'
  })

  const { data: bookmarks } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const response = await getBookmarkedOutfits()
      return response.data.data.outfits
    },
    enabled: activeTab === 'saved'
  })

  const { data: orders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response = await getMyOrders()
      return response.data.data.orders
    },
    enabled: activeTab === 'orders'
  })

  const { data: analysis } = useQuery({
    queryKey: ['style-analysis'],
    queryFn: async () => {
      const response = await getStyleAnalysis()
      return response.data.data.analysis
    }
  })

  const handleLogout = async () => {
    try {
      await logoutUser()
    } finally {
      logout()
      toast.success('Logged out')
      window.location.href = '/'
    }
  }

  const currentUser = profile || user

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pb-20">
      {/* Profile Header */}
      <div className="bg-white dark:bg-dark-card">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar
                src={currentUser?.avatar}
                name={currentUser?.name}
                size="2xl"
              />
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{currentUser?.name}</h1>
              <p className="text-gray-500 dark:text-gray-400">{currentUser?.email}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                {currentUser?.stylePreferences?.map(pref => (
                  <Badge key={pref} variant="primary">{pref}</Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                <Settings className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center md:justify-start gap-8 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <p className="text-xl font-bold">{orders?.length || 0}</p>
              <p className="text-sm text-gray-500">Orders</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{liked?.length || 0}</p>
              <p className="text-sm text-gray-500">Likes</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{bookmarks?.length || 0}</p>
              <p className="text-sm text-gray-500">Saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-gradient-to-r from-brand/10 to-purple-500/10 rounded-xl p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-brand">✨</span> Your Style Analysis
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.topCategories?.map(cat => (
                <Badge key={cat.category} variant="default">
                  {cat.category} ({cat.score}%)
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 mb-6">
          {[
            { id: 'saved', label: 'Saved', icon: Bookmark },
            { id: 'liked', label: 'Liked', icon: Heart },
            { id: 'orders', label: 'Orders', icon: Package },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activeTab === 'saved' && bookmarks?.map(item => (
            <Link key={item._id} to={`/outfit/${item._id}`} className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
              <img src={item.video?.thumbnailUrl || item.images?.[0]?.url} alt={item.title} className="w-full h-full object-cover" />
            </Link>
          ))}
          {activeTab === 'liked' && liked?.map(item => (
            <Link key={item._id} to={`/outfit/${item._id}`} className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
              <img src={item.video?.thumbnailUrl || item.images?.[0]?.url} alt={item.title} className="w-full h-full object-cover" />
            </Link>
          ))}
          {activeTab === 'orders' && orders?.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`} className="bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p className="font-medium">{order.orderNumber}</p>
              <p className="text-sm text-gray-500">{order.items?.length} items</p>
              <p className="text-brand font-bold mt-2">{formatPrice(order.totalAmount)}</p>
              <Badge variant={order.status === 'delivered' ? 'success' : 'warning'} className="mt-2">
                {order.status}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editing}
        onClose={() => setEditing(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
          <Input
            label="Full Name"
            icon={User}
            placeholder="Your name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Phone (Optional)"
            icon={Phone}
            placeholder="+92 XXX XXXXXXX"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Profile
