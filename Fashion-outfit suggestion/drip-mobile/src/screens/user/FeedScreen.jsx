import React, { useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Video } from 'expo-av'
import { getAIFeed, trackInteraction } from '../../api/ai.api'
import { toggleLike, toggleBookmark } from '../../api/social.api'
import { colors, typography } from '../../theme'
import { timeAgo, formatPrice } from '../../utils/format'
import Toast from 'react-native-toast-message'

const { height, width } = Dimensions.get('window')

const FeedScreen = () => {
  const navigation = useNavigation()
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current
  const viewToken = useRef(null)
  const videoRefs = useRef({})

  const loadFeed = async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    try {
      const response = await getAIFeed({ page: pageNum, limit: 10 })
      const newOutfits = response.data.data.outfits
      if (pageNum === 1) {
        setOutfits(newOutfits)
      } else {
        setOutfits(prev => [...prev, ...newOutfits])
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load feed',
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  React.useEffect(() => {
    loadFeed()
  }, [])

  const handleViewableItemsChanged = useCallback(({ viewableItems, changed }) => {
    // Pause videos that are no longer visible
    changed.forEach(item => {
      if (!item.isViewable && videoRefs.current[item.key]) {
        videoRefs.current[item.key].pauseAsync()
      }
    })

    // Play video for the visible item and track interaction
    if (viewableItems && viewableItems.length > 0) {
      const visibleItem = viewableItems[0]
      if (visibleItem.isViewable && visibleItem.item) {
        // Fire-and-forget trackInteraction
        trackInteraction(visibleItem.item._id, 'view').catch(err => {
          console.warn('Track interaction failed:', err)
        })
        
        // Play the visible video
        if (videoRefs.current[visibleItem.key]) {
          videoRefs.current[visibleItem.key].playAsync()
        }
      }
    }
  }, [])

  const handleLike = async (outfitId, isLiked) => {
    // Optimistic update
    setOutfits(prev => prev.map(outfit => 
      outfit._id === outfitId 
        ? { ...outfit, isLiked: !isLiked, likesCount: isLiked ? outfit.likesCount - 1 : outfit.likesCount + 1 }
        : outfit
    ))
    
    try {
      await toggleLike(outfitId)
    } catch (error) {
      // Revert on error
      setOutfits(prev => prev.map(outfit => 
        outfit._id === outfitId 
          ? { ...outfit, isLiked: isLiked, likesCount: isLiked ? outfit.likesCount + 1 : outfit.likesCount - 1 }
          : outfit
      ))
      Toast.show({
        type: 'error',
        text1: 'Failed to update like',
      })
    }
  }

  const handleBookmark = async (outfitId, isBookmarked) => {
    // Optimistic update
    setOutfits(prev => prev.map(outfit => 
      outfit._id === outfitId 
        ? { ...outfit, isBookmarked: !isBookmarked, bookmarksCount: isBookmarked ? outfit.bookmarksCount - 1 : outfit.bookmarksCount + 1 }
        : outfit
    ))
    
    try {
      await toggleBookmark(outfitId)
    } catch (error) {
      // Revert on error
      setOutfits(prev => prev.map(outfit => 
        outfit._id === outfitId 
          ? { ...outfit, isBookmarked: isBookmarked, bookmarksCount: isBookmarked ? outfit.bookmarksCount + 1 : outfit.bookmarksCount - 1 }
          : outfit
      ))
      Toast.show({
        type: 'error',
        text1: 'Failed to update bookmark',
      })
    }
  }

  const handleDoubleTap = (outfit) => {
    if (!outfit.isLiked) {
      handleLike(outfit._id, false)
    }
  }

  const handleOutfitPress = (outfit) => {
    navigation.navigate('OutfitDetail', { outfitId: outfit._id })
  }

  const handlePartnerPress = (partner) => {
    navigation.navigate('PartnerPublic', { partnerId: partner._id })
  }

  const renderItem = ({ item }) => (
    <ReelCard
      outfit={item}
      videoRef={ref => {
        if (ref) {
          videoRefs.current[item._id] = ref
        }
      }}
      onDoubleTap={() => handleDoubleTap(item)}
      onPress={() => handleOutfitPress(item)}
      onPartnerPress={() => handlePartnerPress(item.partner)}
      onLike={() => handleLike(item._id, item.isLiked)}
      onBookmark={() => handleBookmark(item._id, item.isBookmarked)}
      onViewable={handleViewableItemsChanged}
    />
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={outfits}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={handleViewableItemsChanged}
        onEndReached={() => {
          if (!loading && !loadingMore) {
            setPage(prev => {
              const nextPage = prev + 1
              loadFeed(nextPage)
              return nextPage
            })
          }
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => loadingMore ? (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={colors.brand} />
          </View>
        ) : null}
      />
    </View>
  )
}

const ReelCard = ({ outfit, videoRef: externalVideoRef, onDoubleTap, onPress, onPartnerPress, onLike, onBookmark, onViewable }) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)

  // Sync external ref with internal ref
  React.useEffect(() => {
    if (externalVideoRef) {
      externalVideoRef(videoRef.current)
    }
  }, [externalVideoRef])

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pauseAsync()
      } else {
        videoRef.current.playAsync()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        activeOpacity={1}
        style={styles.videoContainer}
        onPress={togglePlayPause}
        onLongPress={onDoubleTap}
        delayLongPress={300}
      >
        {outfit.video?.url ? (
          <Video
            ref={videoRef}
            source={{ uri: outfit.video.url }}
            style={styles.video}
            shouldPlay={false}
            isLooping
            isMuted
            resizeMode="cover"
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded) {
                setIsPlaying(status.isPlaying)
              }
            }}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No video</Text>
          </View>
        )}
        
        {!isPlaying && (
          <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
            <Text style={styles.playIcon}>▶️</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <View style={styles.overlay}>
        <TouchableOpacity style={styles.partnerRow} onPress={onPartnerPress}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {outfit.partner?.brandName?.charAt(0) || '?'}
            </Text>
          </View>
          <Text style={styles.partnerName}>{outfit.partner?.brandName}</Text>
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={2}>{outfit.title}</Text>

        <View style={styles.tagsContainer}>
          {outfit.tags?.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceRow}>
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

        <TouchableOpacity style={styles.shopButton} onPress={onPress}>
          <Text style={styles.shopButtonText}>Shop Now</Text>
        </TouchableOpacity>

        {outfit.relevanceScore && (
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>🤖 AI: {outfit.relevanceScore.toFixed(1)}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Text style={[styles.actionIcon, outfit.isLiked && styles.actionIconActive]}>
            {outfit.isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={styles.actionCount}>{outfit.likesCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onBookmark}>
          <Text style={[styles.actionIcon, outfit.isBookmarked && styles.actionIconActive]}>
            {outfit.isBookmarked ? '🔖' : '📑'}
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

        <TouchableOpacity style={styles.actionButton} onPress={onPartnerPress}>
          <View style={styles.smallAvatar}>
            <Text style={styles.smallAvatarText}>
              {outfit.partner?.brandName?.charAt(0) || '?'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  card: {
    width,
    height,
    backgroundColor: colors.dark,
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.darkCard,
  },
  placeholderText: {
    ...typography.body1,
    color: colors.textMuted,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 24,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 60,
    padding: 16,
    paddingBottom: 32,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  partnerName: {
    ...typography.body1,
    color: colors.textInverse,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.textInverse,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(233, 30, 99, 0.2)',
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    ...typography.price,
    color: colors.textInverse,
    marginRight: 8,
  },
  originalPrice: {
    ...typography.body2,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginRight: 8,
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
  shopButton: {
    backgroundColor: colors.brand,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  shopButtonText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '600',
  },
  aiBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  aiBadgeText: {
    ...typography.caption,
    color: colors.info,
  },
  actions: {
    position: 'absolute',
    right: 8,
    bottom: 100,
    gap: 16,
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
    color: colors.textInverse,
  },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallAvatarText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
})

export default FeedScreen
