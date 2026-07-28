import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { getMe, updateProfile, logoutUser } from '../../api/auth.api'
import { getLikedOutfits, getBookmarkedOutfits } from '../../api/social.api'
import { getMyOrders } from '../../api/order.api'
import { getStyleAnalysis } from '../../api/ai.api'
import useAuthStore from '../../stores/auth.store'
import { uploadAvatar } from '../../api/upload.api'
import { colors, typography } from '../../theme'
import { formatCompact } from '../../utils/format'
import Toast from 'react-native-toast-message'

const ProfileScreen = () => {
  const navigation = useNavigation()
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('Saved')
  const [likedOutfits, setLikedOutfits] = useState([])
  const [bookmarkedOutfits, setBookmarkedOutfits] = useState([])
  const [orders, setOrders] = useState([])
  const [styleAnalysis, setStyleAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadProfileData = async () => {
    try {
      const response = await getMe()
      useAuthStore.getState().updateUser(response.data.data.user)
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const loadLikedOutfits = async () => {
    try {
      const response = await getLikedOutfits()
      setLikedOutfits(response.data.data.outfits || [])
    } catch (error) {
      console.error('Failed to load liked outfits:', error)
    }
  }

  const loadBookmarkedOutfits = async () => {
    try {
      const response = await getBookmarkedOutfits()
      setBookmarkedOutfits(response.data.data.outfits || [])
    } catch (error) {
      console.error('Failed to load bookmarked outfits:', error)
    }
  }

  const loadOrders = async () => {
    try {
      const response = await getMyOrders()
      setOrders(response.data.data.orders || [])
    } catch (error) {
      console.error('Failed to load orders:', error)
    }
  }

  const loadStyleAnalysis = async () => {
    try {
      const response = await getStyleAnalysis()
      setStyleAnalysis(response.data.data.analysis)
    } catch (error) {
      console.error('Failed to load style analysis:', error)
    }
  }

  useEffect(() => {
    loadProfileData()
    loadStyleAnalysis()
  }, [])

  useEffect(() => {
    if (activeTab === 'Liked') {
      loadLikedOutfits()
    } else if (activeTab === 'Saved') {
      loadBookmarkedOutfits()
    } else if (activeTab === 'Orders') {
      loadOrders()
    }
  }, [activeTab])

  const handleAvatarPress = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled) {
        setLoading(true)
        const uploadResponse = await uploadAvatar(result.assets[0].uri)
        await updateProfile({ avatar: uploadResponse.data.data.url })
        await loadProfileData()
        Toast.show({
          type: 'success',
          text1: 'Avatar updated!',
        })
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update avatar',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutUser()
              await logout()
            } catch (error) {
              console.error('Logout error:', error)
            }
          },
        },
      ]
    )
  }

  const handleSettings = () => {
    navigation.navigate('Settings')
  }

  const handleNotifications = () => {
    navigation.navigate('Notifications')
  }

  const handleOrders = () => {
    navigation.navigate('Orders')
  }

  const renderOutfitItem = ({ item }) => (
    <View style={styles.outfitItem}>
      <View style={styles.outfitImage}>
        <Text style={styles.outfitImagePlaceholder}>📷</Text>
      </View>
      <Text style={styles.outfitTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.outfitPrice}>PKR {formatCompact(item.price)}</Text>
    </View>
  )

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      <Text style={styles.orderTotal}>PKR {formatCompact(item.totalAmount)}</Text>
    </TouchableOpacity>
  )

  const getStatusColor = (status) => {
    const colors = {
      pending: colors.warning,
      confirmed: colors.info,
      processing: colors.info,
      shipped: colors.brand,
      delivered: colors.success,
      cancelled: colors.danger,
    }
    return colors[status] || colors.textSecondary
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarPress} disabled={loading}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || '?'}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statItem} onPress={handleOrders}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem} onPress={() => setActiveTab('Liked')}>
          <Text style={styles.statValue}>{likedOutfits.length}</Text>
          <Text style={styles.statLabel}>Liked</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem} onPress={() => setActiveTab('Saved')}>
          <Text style={styles.statValue}>{bookmarkedOutfits.length}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </TouchableOpacity>
      </View>

      {styleAnalysis && (
        <View style={styles.styleCard}>
          <Text style={styles.cardTitle}>Your Style Analysis</Text>
          <View style={styles.analysisRow}>
            <Text style={styles.analysisLabel}>Engagement Score:</Text>
            <Text style={styles.analysisValue}>
              {styleAnalysis.activitySummary?.engagementScore || 0}
            </Text>
          </View>
          <View style={styles.topCategories}>
            <Text style={styles.categoriesTitle}>Top Categories:</Text>
            {styleAnalysis.topCategories?.slice(0, 3).map((cat, index) => (
              <View key={index} style={styles.categoryItem}>
                <Text style={styles.categoryName}>{cat.category}</Text>
                <View style={styles.categoryBar}>
                  <View 
                    style={[styles.categoryFill, { width: `${cat.score}%` }]} 
                  />
                </View>
                <Text style={styles.categoryScore}>{cat.score.toFixed(0)}%</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.tabs}>
        {['Saved', 'Liked', 'Orders'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabContent}>
        {activeTab === 'Saved' && (
          <View style={styles.outfitGrid}>
            {bookmarkedOutfits.map((item) => (
              <View key={item._id}>{renderOutfitItem({ item })}</View>
            ))}
          </View>
        )}
        {activeTab === 'Liked' && (
          <View style={styles.outfitGrid}>
            {likedOutfits.map((item) => (
              <View key={item._id}>{renderOutfitItem({ item })}</View>
            ))}
          </View>
        )}
        {activeTab === 'Orders' && (
          <View>
            {orders.map((item) => (
              <View key={item._id}>{renderOrderItem({ item })}</View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={handleNotifications}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>Notifications</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Settings</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  avatarPlaceholder: {
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h2,
    color: colors.textInverse,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  styleCard: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analysisLabel: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  analysisValue: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  topCategories: {
    marginTop: 8,
  },
  categoriesTitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    ...typography.body2,
    color: colors.textPrimary,
    width: 100,
  },
  categoryBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  categoryFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: 4,
  },
  categoryScore: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 40,
    textAlign: 'right',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.brand,
  },
  tabText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.brand,
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
    minHeight: 200,
  },
  outfitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  outfitItem: {
    width: '50%',
    paddingHorizontal: 8,
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
  orderItem: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
  orderDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  orderTotal: {
    ...typography.body1,
    color: colors.brand,
    fontWeight: '600',
  },
  menuSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuText: {
    ...typography.body1,
    color: colors.textPrimary,
    flex: 1,
  },
  logoutText: {
    color: colors.danger,
  },
  menuArrow: {
    ...typography.body2,
    color: colors.textSecondary,
  },
})

export default ProfileScreen
