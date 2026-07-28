import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { getPartnerStats, getMyOutfits } from '../../api/outfit.api'
import { getPartnerOrders } from '../../api/order.api'
import { getPartnerMe } from '../../api/partner.api'
import { colors, typography } from '../../theme'
import { formatCompact } from '../../utils/format'
import Toast from 'react-native-toast-message'

const DashboardScreen = () => {
  const navigation = useNavigation()
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [recentOutfits, setRecentOutfits] = useState([])
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [statsRes, ordersRes, outfitsRes, partnerRes] = await Promise.all([
        getPartnerStats(),
        getPartnerOrders({ limit: 5 }),
        getMyOutfits({ limit: 5 }),
        getPartnerMe(),
      ])
      setStats(statsRes.data.data)
      setRecentOrders(ordersRes.data.data.orders || [])
      setRecentOutfits(outfitsRes.data.data.outfits || [])
      setPartner(partnerRes.data.data.partner)
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load dashboard',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{formatCompact(value)}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Welcome back, {partner?.brandName}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon="📦"
          color={colors.brand}
        />
        <StatCard
          title="Revenue"
          value={stats?.totalRevenue || 0}
          icon="💰"
          color={colors.success}
        />
        <StatCard
          title="Outfits"
          value={stats?.totalOutfits || 0}
          icon="👗"
          color={colors.info}
        />
        <StatCard
          title="Followers"
          value={partner?.followersCount || 0}
          icon="👤"
          color={colors.warning}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Partner Orders')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <Text style={styles.orderStatus}>{order.status}</Text>
              </View>
              <Text style={styles.orderAmount}>
                {formatCompact(order.totalAmount)}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Outfits</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Manage Outfits')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {recentOutfits.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentOutfits.map((outfit) => (
              <TouchableOpacity
                key={outfit._id}
                style={styles.outfitCard}
                onPress={() => navigation.navigate('Manage Outfits')}
              >
                <View style={styles.outfitImage}>
                  <Text style={styles.outfitImagePlaceholder}>📷</Text>
                </View>
                <Text style={styles.outfitTitle} numberOfLines={1}>
                  {outfit.title}
                </Text>
                <Text style={styles.outfitPrice}>
                  {formatCompact(outfit.price)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
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

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => navigation.navigate('Upload Outfit')}
      >
        <Text style={styles.uploadButtonText}>+ Upload New Outfit</Text>
      </TouchableOpacity>
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
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statTitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  viewAllText: {
    ...typography.body2,
    color: colors.brand,
    fontWeight: '600',
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderStatus: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  orderAmount: {
    ...typography.body1,
    color: colors.brand,
    fontWeight: '600',
  },
  outfitCard: {
    width: 140,
    marginRight: 12,
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
    fontSize: 24,
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
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: colors.brand,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
  },
  uploadButtonText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '600',
  },
})

export default DashboardScreen
