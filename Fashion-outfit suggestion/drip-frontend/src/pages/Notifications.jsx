/**
 * @fileoverview Notifications page for user alerts and updates.
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Heart, MessageCircle, Package, Bookmark, Check, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../api/notification.api'
import { formatTimeAgo } from '../utils/timeAgo'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'

const typeConfig = {
  like: { icon: Heart, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  comment: { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  follow: { icon: Bell, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  order: { icon: Package, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  bookmark: { icon: Bookmark, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  system: { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20' }
}

const Notifications = () => {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      const params = filter !== 'all' ? { type: filter } : {}
      const response = await getNotifications(params)
      return response.data.data.notifications
    }
  })

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    }
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      toast.success('All notifications marked as read')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    }
  })

  const notifications = data || []
  const unreadCount = notifications.filter(n => !n.isRead).length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-brand text-white text-sm font-medium rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllReadMutation.mutate()}>
              <Check className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'like', 'comment', 'order', 'system'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-brand text-white'
                  : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => {
              const config = typeConfig[notification.type] || typeConfig.system
              const Icon = config.icon

              return (
                <div
                  key={notification._id}
                  onClick={() => !notification.isRead && markReadMutation.mutate(notification._id)}
                  className={`flex items-start gap-3 p-4 bg-white dark:bg-dark-card rounded-xl border cursor-pointer transition-colors ${
                    notification.isRead
                      ? 'border-gray-200 dark:border-gray-800 opacity-70'
                      : 'border-brand bg-brand/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{notification.title}</span>{' '}
                      <span className="text-gray-600 dark:text-gray-400">{notification.message}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-brand rounded-full shrink-0 mt-2" />
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteMutation.mutate(notification._id)
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
