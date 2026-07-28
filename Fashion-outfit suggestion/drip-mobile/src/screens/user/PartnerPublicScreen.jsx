import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { getPartnerPublic, getPartnerOutfits } from '../../api/partner.api'
import { toggleFollow, checkFollowStatus } from '../../api/social.api'
import { colors, typography } from '../../theme'
import { formatCompact } from '../../utils/format'
import Toast from 'react-native-toast-message'

const PartnerPublicScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { partnerId } = route.params
  const [partner, setPartner] = useState(null)
  const [outfits, setOutfits] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadPartner = async () => {
    setLoading(true)
    try {
      const response = await getPartnerPublic(partnerId)
      setPartner(response.data.data.partner)
      setIsFollowing(response.data.data.isFollowing || false)
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load partner',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadOutfits = async () => {
    try {
      const response = await getPartnerOutfits(partnerId)
      setOutfits(response.data.data.outfits || [])
    } catch (error) {
      console.error('Failed to load outfits:', error)
    }
  }

  const handleFollow = async () => {
    try {
      await toggleFollow(partnerId)
      setIsFollowing(!isFollowing)
      setPartner(prev => ({
        ...prev,
        followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
      }))
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update follow',
      })
    }
  }

  const handleOutfitPress = (outfit) => {
    navigation.navigate('OutfitDetail', { outfitId: outfit._id })
  }

  const renderOutfit = ({ item }) => (
    <TouchableOpacity
      style={styles.outfitCard}
      onPress={() => handleOutfitPress(item)}
    >
      <View style={styles.outfitImage}>
        <Text style={styles.outfitImagePlaceholder}>📷</Text>
      </View>
      <Text style={styles.outfitTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.outfitPrice}>PKR {formatCompact(item.price)}</Text>
    </TouchableOpacity>
  )

  useEffect(() => {
    loadPartner()
    loadOutfits()
  }, [partnerId])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    )
  }

  if (!partner) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Partner not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {partner.brandName?.charAt(0) || '?'}
          </Text>
        </View>
        
        <View style={styles.headerContent}>
          <Text style={styles.brandName}>{partner.brandName}</Text>
          <Text style={styles.category}>{partner.category}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCompact(partner.followersCount || 0)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCompact(partner.outfitsCount || 0)}</Text>
              <Text style={styles.statLabel}>Outfits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCompact(partner.likesCount || 0)}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
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
        
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => navigation.navigate('ChatDetail', {
            otherPartyId: partner._id,
            otherPartyModel: 'Partner',
            partnerName: partner.brandName,
          })}
        >
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </View>

      {partner.description && (
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{partner.description}</Text>
        </View>
      )}

      <View style={styles.outfitsSection}>
        <Text style={styles.sectionTitle}>Outfits ({outfits.length})</Text>
        {outfits.length > 0 ? (
          <FlatList
            data={outfits}
            renderItem={renderOutfit}
            keyExtractor={(item) => item._id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.outfitsGrid}
            columnWrapperStyle={styles.row}
          />
        ) : (
          <View style={styles.emptyOutfits}>
            <Text style={styles.emptyText}>No outfits yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
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
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    ...typography.h1,
    color: colors.textInverse,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
  },
  brandName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  category: {
    ...typography.body2,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  followButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.brand,
    alignItems: 'center',
  },
  followButtonActive: {
    backgroundColor: colors.brand,
  },
  followButtonText: {
    ...typography.button,
    color: colors.brand,
    fontWeight: '600',
  },
  followButtonTextActive: {
    color: colors.textInverse,
  },
  messageButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageButtonText: {
    ...typography.button,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  descriptionSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  outfitsSection: {
    padding: 16,
  },
  outfitsGrid: {
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  outfitCard: {
    width: '48%',
    marginBottom: 16,
  },
  outfitImage: {
    aspectRatio: 3 / 4,
    backgroundColor: colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  outfitImagePlaceholder: {
    fontSize: 32,
  },
  outfitTitle: {
    ...typography.body2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  outfitPrice: {
    ...typography.body2,
    color: colors.brand,
    fontWeight: '600',
  },
  emptyOutfits: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
})

export default PartnerPublicScreen
