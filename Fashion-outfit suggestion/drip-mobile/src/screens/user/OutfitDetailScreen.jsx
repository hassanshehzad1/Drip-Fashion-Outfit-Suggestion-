import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Video } from 'expo-av'
import { getOutfit, getSocialStatus } from '../../api/outfit.api'
import { toggleLike, toggleBookmark, addComment, getComments } from '../../api/social.api'
import { addToCart } from '../../api/cart.api'
import { toggleFollow } from '../../api/social.api'
import { colors, typography } from '../../theme'
import { formatPrice, timeAgo } from '../../utils/format'
import Toast from 'react-native-toast-message'

const { width, height } = Dimensions.get('window')

const OutfitDetailScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { outfitId } = route.params
  const [outfit, setOutfit] = useState(null)
  const [comments, setComments] = useState([])
  const [socialStatus, setSocialStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  const loadOutfit = async () => {
    setLoading(true)
    try {
      const response = await getOutfit(outfitId)
      setOutfit(response.data.data.outfit)
      setIsLiked(response.data.data.isLiked || false)
      setIsBookmarked(response.data.data.isBookmarked || false)
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load outfit',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const response = await getComments(outfitId)
      setComments(response.data.data.comments || [])
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const loadSocialStatus = async () => {
    try {
      const response = await getSocialStatus(outfitId)
      setSocialStatus(response.data.data)
    } catch (error) {
      console.error('Failed to load social status:', error)
    }
  }

  useEffect(() => {
    loadOutfit()
    loadComments()
    loadSocialStatus()
  }, [outfitId])

  const handleLike = async () => {
    try {
      await toggleLike(outfitId)
      setIsLiked(!isLiked)
      setOutfit(prev => ({
        ...prev,
        likesCount: isLiked ? prev.likesCount - 1 : prev.likesCount + 1
      }))
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update like',
      })
    }
  }

  const handleBookmark = async () => {
    try {
      await toggleBookmark(outfitId)
      setIsBookmarked(!isBookmarked)
      setOutfit(prev => ({
        ...prev,
        bookmarksCount: isBookmarked ? prev.bookmarksCount - 1 : prev.bookmarksCount + 1
      }))
      Toast.show({
        type: 'success',
        text1: isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update bookmark',
      })
    }
  }

  const handleFollow = async () => {
    try {
      await toggleFollow(outfit.partner._id)
      setIsFollowing(!isFollowing)
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update follow',
      })
    }
  }

  const handleAddToCart = async () => {
    try {
      await addToCart({
        outfitId,
        size: outfit.sizes?.[0] || 'M',
        quantity: 1,
      })
      Toast.show({
        type: 'success',
        text1: 'Added to cart!',
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to add to cart',
      })
    }
  }

  const handleBuyNow = () => {
    navigation.navigate('Cart')
  }

  const handleComment = async () => {
    if (!commentText.trim()) return
    try {
      await addComment(outfitId, commentText)
      setCommentText('')
      loadComments()
      Toast.show({
        type: 'success',
        text1: 'Comment added!',
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to add comment',
      })
    }
  }

  const handlePartnerPress = () => {
    navigation.navigate('PartnerPublic', { partnerId: outfit.partner._id })
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    )
  }

  if (!outfit) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Outfit not found</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.mediaContainer}>
          {outfit.video?.url ? (
            <Video
              source={{ uri: outfit.video.url }}
              style={styles.video}
              shouldPlay
              isLooping
              isMuted
              resizeMode="cover"
            />
          ) : outfit.images?.[0]?.url ? (
            <Image source={{ uri: outfit.images[0].url }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>No media</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={styles.partnerRow} onPress={handlePartnerPress}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {outfit.partner?.brandName?.charAt(0) || '?'}
              </Text>
            </View>
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerName}>{outfit.partner?.brandName}</Text>
              <Text style={styles.partnerMeta}>
                {outfit.partner?.followersCount || 0} followers
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followButtonActive]}
              onPress={handleFollow}
            >
              <Text style={[
                styles.followButtonText,
                isFollowing && styles.followButtonTextActive,
              ]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <Text style={styles.title}>{outfit.title}</Text>

          <View style={styles.tagsContainer}>
            {outfit.tags?.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.description}>{outfit.description}</Text>

          <View style={styles.priceSection}>
            <Text style={styles.price}>{formatPrice(outfit.price)}</Text>
            {outfit.originalPrice && (
              <Text style={styles.originalPrice}>{formatPrice(outfit.originalPrice)}</Text>
            )}
            {outfit.discountPercentage && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{outfit.discountPercentage}% OFF</Text>
              </View>
            )}
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{outfit.category}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sizes:</Text>
              <Text style={styles.detailValue}>{outfit.sizes?.join(', ') || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Stock:</Text>
              <Text style={[
                styles.detailValue,
                outfit.stock > 0 ? styles.inStock : styles.outOfStock,
              ]}>
                {outfit.stock > 0 ? `${outfit.stock} available` : 'Out of stock'}
              </Text>
            </View>
          </View>

          <View style={styles.actionsSection}>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <Text style={[styles.actionIcon, isLiked && styles.actionIconActive]}>
                  {isLiked ? '❤️' : '🤍'}
                </Text>
                <Text style={styles.actionCount}>{outfit.likesCount || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
                <Text style={[styles.actionIcon, isBookmarked && styles.actionIconActive]}>
                  {isBookmarked ? '🔖' : '📑'}
                </Text>
                <Text style={styles.actionCount}>{outfit.bookmarksCount || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionCount}>{outfit.commentsCount || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>↗️</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
            {comments.map((comment) => (
              <View key={comment._id} style={styles.commentItem}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>
                    {comment.user?.name?.charAt(0) || '?'}
                  </Text>
                </View>
                <View style={styles.commentContent}>
                  <Text style={styles.commentUser}>{comment.user?.name}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  <Text style={styles.commentTime}>{timeAgo(comment.createdAt)}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.commentInputSection}>
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity
                style={styles.commentSendButton}
                onPress={handleComment}
                disabled={!commentText.trim()}
              >
                <Text style={[
                  styles.commentSendText,
                  !commentText.trim() && styles.commentSendTextDisabled,
                ]}>
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          disabled={outfit.stock === 0}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyNowButton}
          onPress={handleBuyNow}
          disabled={outfit.stock === 0}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  scrollContainer: {
    flex: 1,
  },
  mediaContainer: {
    width,
    aspectRatio: 3 / 4,
    backgroundColor: colors.surface,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.body1,
    color: colors.textMuted,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...typography.body1,
    color: colors.textInverse,
    fontWeight: '600',
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  partnerMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  followButtonActive: {
    backgroundColor: colors.brand,
  },
  followButtonText: {
    ...typography.body2,
    color: colors.brand,
    fontWeight: '600',
  },
  followButtonTextActive: {
    color: colors.textInverse,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: colors.brand50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    ...typography.caption,
    color: colors.brand,
  },
  description: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  price: {
    ...typography.price,
    color: colors.brand,
    marginRight: 12,
  },
  originalPrice: {
    ...typography.body2,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  inStock: {
    color: colors.success,
  },
  outOfStock: {
    color: colors.danger,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  actionIconActive: {
    transform: [{ scale: 1.2 }],
  },
  actionCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  commentsSection: {
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  commentTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  commentInputSection: {
    marginBottom: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentInput: {
    flex: 1,
    ...typography.body2,
    color: colors.textPrimary,
  },
  commentSendButton: {
    paddingHorizontal: 12,
  },
  commentSendText: {
    ...typography.body2,
    color: colors.brand,
    fontWeight: '600',
  },
  commentSendTextDisabled: {
    color: colors.textMuted,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addToCartText: {
    ...typography.button,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: colors.brand,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyNowText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '600',
  },
})

export default OutfitDetailScreen
