import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors, typography } from '../../theme'
import { timeAgo } from '../../utils/format'

const NotificationItem = ({
  notification,
  onPress,
  style,
}) => {
  const getIcon = (type) => {
    const icons = {
      like: '❤️',
      comment: '💬',
      follow: '👤',
      bookmark: '🔖',
      order: '📦',
      chat: '💭',
      system: '🔔',
    }
    return icons[type] || '🔔'
  }

  const getIconColor = (type) => {
    const colorsMap = {
      like: colors.brand,
      comment: colors.info,
      follow: colors.success,
      bookmark: colors.warning,
      order: colors.brand,
      chat: colors.info,
    }
    return colorsMap[type] || colors.textSecondary
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.isRead && styles.unread,
        style,
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconColor(notification.type) }]}>
        <Text style={styles.iconText}>{getIcon(notification.type)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.time}>{timeAgo(notification.createdAt)}</Text>
      </View>

      {!notification.isRead && <View style={styles.dot} />}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    gap: 12,
  },
  unread: {
    backgroundColor: colors.brand50,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  message: {
    ...typography.body1,
    color: colors.textPrimary,
  },
  time: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
})

export default NotificationItem
