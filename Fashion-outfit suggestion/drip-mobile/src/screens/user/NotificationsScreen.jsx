import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../api/notification.api'
import { colors, typography } from '../../theme'
import { timeAgo } from '../../utils/format'
import Toast from 'react-native-toast-message'

const NotificationsScreen = () => {
  const navigation = useNavigation()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const response = await getNotifications()
      setNotifications(response.data.data.notifications || [])
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load notifications',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId)
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      Toast.show({
        type: 'success',
        text1: 'All marked as read',
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to mark all as read',
      })
    }
  }

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to delete notification',
      })
    }
  }

  const handleNotificationPress = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id)
    }

    // Navigate based on notification type
    if (notification.type === 'like' || notification.type === 'comment') {
      navigation.navigate('OutfitDetail', { outfitId: notification.outfitId })
    } else if (notification.type === 'follow') {
      navigation.navigate('PartnerPublic', { partnerId: notification.partnerId })
    } else if (notification.type === 'order') {
      navigation.navigate('OrderDetail', { orderId: notification.orderId })
    } else if (notification.type === 'chat') {
      navigation.navigate('ChatDetail', {
        otherPartyId: notification.otherPartyId,
        otherPartyModel: notification.otherPartyModel,
      })
    }
  }

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.notificationUnread]}
      onPress={() => handleNotificationPress(item)}
      onLongPress={() => handleDelete(item._id)}
    >
      <View style={styles.notificationIcon}>
        <Text style={styles.iconText}>{getNotificationIcon(item.type)}</Text>
      </View>
      
      <View style={styles.notificationContent}>
        <Text style={[
          styles.notificationTitle,
          !item.isRead && styles.notificationTitleUnread,
        ]}>
          {item.title}
        </Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>{timeAgo(item.createdAt)}</Text>
      </View>

      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  )

  const getNotificationIcon = (type) => {
    const icons = {
      like: '❤️',
      comment: '💬',
      follow: '👤',
      order: '📦',
      chat: '💭',
      system: '🔔',
    }
    return icons[type] || '🔔'
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>No notifications</Text>
          <Text style={styles.emptySubtext}>
            We'll notify you about important updates
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  markAllText: {
    ...typography.body2,
    color: colors.brand,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  notificationUnread: {
    backgroundColor: colors.brand50,
    borderColor: colors.brand,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationTitleUnread: {
    color: colors.brand,
  },
  notificationMessage: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  notificationTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.body2,
    color: colors.textMuted,
    textAlign: 'center',
  },
})

export default NotificationsScreen
