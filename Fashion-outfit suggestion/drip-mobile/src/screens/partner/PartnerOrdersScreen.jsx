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
import { getPartnerOrders, updateOrderStatus, getOrder } from '../../api/order.api'
import { colors, typography } from '../../theme'
import { formatCompact, timeAgo } from '../../utils/format'
import Toast from 'react-native-toast-message'

const PartnerOrdersScreen = () => {
  const navigation = useNavigation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const loadOrders = async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await getPartnerOrders(params)
      setOrders(response.data.data.orders || [])
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load orders',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      await loadOrders()
      Toast.show({
        type: 'success',
        text1: `Order ${newStatus}`,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update order',
      })
    }
  }

  useEffect(() => {
    loadOrders()
  }, [filter])

  const filters = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

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

  const getNextStatus = (currentStatus) => {
    const transitions = {
      pending: 'confirmed',
      confirmed: 'processing',
      processing: 'shipped',
      shipped: 'delivered',
    }
    return transitions[currentStatus]
  }

  const canAdvance = (status) => {
    return ['pending', 'confirmed', 'processing', 'shipped'].includes(status)
  }

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.orderDate}>{timeAgo(item.createdAt)}</Text>
      
      <View style={styles.orderInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Items:</Text>
          <Text style={styles.infoValue}>{item.items?.length || 0}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Total:</Text>
          <Text style={styles.infoValue}>{formatCompact(item.totalAmount)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Customer:</Text>
          <Text style={styles.infoValue}>{item.user?.name || 'N/A'}</Text>
        </View>
      </View>

      {canAdvance(item.status) && (
        <TouchableOpacity
          style={styles.advanceButton}
          onPress={() => handleStatusUpdate(item._id, getNextStatus(item.status))}
        >
          <Text style={styles.advanceButtonText}>
            Mark as {getNextStatus(item.status)}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
      >
        <Text style={styles.detailsButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Partner Orders</Text>
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
      ) : orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No orders yet</Text>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
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
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
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
    textTransform: 'capitalize',
  },
  orderDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  orderInfo: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    ...typography.body2,
    color: colors.textSecondary,
    width: 80,
  },
  infoValue: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  advanceButton: {
    backgroundColor: colors.brand,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  advanceButtonText: {
    ...typography.body2,
    color: colors.textInverse,
    fontWeight: '600',
  },
  detailsButton: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailsButtonText: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
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
  },
})

export default PartnerOrdersScreen
