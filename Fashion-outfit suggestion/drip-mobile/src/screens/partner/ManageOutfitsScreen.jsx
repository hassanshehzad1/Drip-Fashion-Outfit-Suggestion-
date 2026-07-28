import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { getMyOutfits, deleteOutfit, toggleFeatured, updateOutfit } from '../../api/outfit.api'
import { colors, typography } from '../../theme'
import { formatCompact } from '../../utils/format'
import Toast from 'react-native-toast-message'

const ManageOutfitsScreen = () => {
  const navigation = useNavigation()
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const loadOutfits = async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? { featured: filter === 'featured' } : {}
      const response = await getMyOutfits(params)
      setOutfits(response.data.data.outfits || [])
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load outfits',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (outfit) => {
    Alert.alert(
      'Delete Outfit',
      `Are you sure you want to delete "${outfit.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOutfit(outfit._id)
              await loadOutfits()
              Toast.show({
                type: 'success',
                text1: 'Outfit deleted',
              })
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Failed to delete outfit',
              })
            }
          },
        },
      ]
    )
  }

  const handleToggleFeatured = async (outfit) => {
    try {
      await toggleFeatured(outfit._id)
      setOutfits(prev => prev.map(o => 
        o._id === outfit._id ? { ...o, isFeatured: !o.isFeatured } : o
      ))
      Toast.show({
        type: 'success',
        text1: outfit.isFeatured ? 'Removed from featured' : 'Added to featured',
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update featured status',
      })
    }
  }

  const handleEdit = (outfit) => {
    navigation.navigate('EditOutfit', { outfitId: outfit._id })
  }

  useEffect(() => {
    loadOutfits()
  }, [filter])

  const filters = ['all', 'featured', 'regular']

  const renderOutfit = ({ item }) => (
    <View style={styles.outfitCard}>
      <View style={styles.outfitImage}>
        <Text style={styles.outfitImagePlaceholder}>📷</Text>
      </View>
      
      <View style={styles.outfitDetails}>
        <Text style={styles.outfitTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.outfitPrice}>{formatCompact(item.price)}</Text>
        
        <View style={styles.outfitMeta}>
          <Text style={styles.metaText}>Stock: {item.stock}</Text>
          <Text style={styles.metaText}>Likes: {item.likesCount || 0}</Text>
        </View>

        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>⭐ Featured</Text>
          </View>
        )}
      </View>

      <View style={styles.outfitActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleFeatured(item)}
        >
          <Text style={styles.actionIcon}>{item.isFeatured ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.actionIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Outfits</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Upload Outfit')}
        >
          <Text style={styles.addButtonText}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                filter === f && styles.filterChipActive,
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : outfits.length > 0 ? (
        <FlatList
          data={outfits}
          renderItem={renderOutfit}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👗</Text>
          <Text style={styles.emptyText}>No outfits yet</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => navigation.navigate('Upload Outfit')}
          >
            <Text style={styles.uploadButtonText}>Upload First Outfit</Text>
          </TouchableOpacity>
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
  addButton: {
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    ...typography.body2,
    color: colors.textInverse,
    fontWeight: '600',
  },
  filters: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  filterText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textInverse,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  outfitCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
   mb: 12,
  },
  outfitImage: {
    width: 80,
    height: 100,
    backgroundColor: colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  outfitImagePlaceholder: {
    fontSize: 24,
  },
  outfitDetails: {
    flex: 1,
  },
  outfitTitle: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  outfitPrice: {
    ...typography.body1,
    color: colors.brand,
    fontWeight: '600',
    marginBottom: 8,
  },
  outfitMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  featuredBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  featuredText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
  outfitActions: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
  },
  actionIcon: {
    fontSize: 20,
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
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: colors.brand,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  uploadButtonText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '600',
  },
})

export default ManageOutfitsScreen
