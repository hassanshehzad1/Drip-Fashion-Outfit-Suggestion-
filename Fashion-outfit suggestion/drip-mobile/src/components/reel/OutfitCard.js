import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatCompact } from '../../utils/format'
import { colors, typography } from '../../theme'
import { timeAgo } from '../../utils/format'

const OutfitCard = ({
  outfit,
  onLike,
  onBookmark,
  onComment,
  onShare,
  isLiked,
  isBookmarked,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.thumbnail}>
        <Text style={styles.thumbnailPlaceholder}>📷</Text>
      </View>
      
      <View style={styles.overlay}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {outfit.partner?.brandName?.charAt(0) || '?'}
            </Text>
          </View>
          <View style={styles.partnerInfo}>
            <Text style={styles.partnerName}>{outfit.partner?.brandName}</Text>
            <Text style={styles.time}>{timeAgo(outfit.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onLike}>
            <Text style={[styles.actionIcon, isLiked && styles.actionIconActive]}>
              {isLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.actionText}>{outfit.likesCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onComment}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>{outfit.commentsCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onBookmark}>
            <Text style={[styles.actionIcon, isBookmarked && styles.actionIconActive]}>
              {isBookmarked ? '🔖' : '📑'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Text style={styles.actionIcon}>↗️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.title} numberOfLines={2}>{outfit.title}</Text>
          <View style={styles.tags}>
            {outfit.tags?.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCompact(outfit.price)}</Text>
            {outfit.originalPrice && (
              <Text style={styles.originalPrice}>{formatCompact(outfit.originalPrice)}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: colors.darkCard,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholder: {
    fontSize: 48,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...typography.body2,
    color: colors.textInverse,
    fontWeight: '600',
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    ...typography.body1,
    color: colors.textInverse,
    fontWeight: '600',
  },
  time: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actions: {
    alignItems: 'flex-end',
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  actionIconActive: {
    transform: [{ scale: 1.2 }],
  },
  actionText: {
    ...typography.caption,
    color: colors.textInverse,
  },
  footer: {
    gap: 8,
  },
  title: {
    ...typography.body1,
    color: colors.textInverse,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(233, 30, 99, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    ...typography.caption,
    color: colors.brand,
  },
  priceContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    ...typography.price,
    color: colors.textInverse,
  },
  originalPrice: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'line-through',
  },
})

export default OutfitCard
