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
import { getMyOrders } from '../../api/order.api'
import { colors, typography } from '../../theme'
import { formatCompact, timeAgo } from '../../utils/format'
import Toast from 'react-native-toast-message'

const OrdersScreen = () => {
  const navigation = useNavigation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const loadOrders = async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await getMyOrders(params)
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

  useEffect(() => {
    loadOrders()
  }, [filter])

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetail', { orderId: order._id })
  }

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

  const filters = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.orderDate}>{timeAgo(item.createdAt)}</Text>
      
      <View style={styles.orderItems}>
        <Text style={styles.itemsCount}>{item.items?.length || 0} items</Text>
        <Text style={styles.orderTotal}>{formatCompact(item.totalAmount)}</Text>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.partnerName}>
          {item.items?.[0]?.outfit?.partner?.brandName || 'Multiple brands'}
        </Text>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
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
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Feed')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
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
  orderItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemsCount: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  orderTotal: {
    ...typography.price,
    color: colors.brand,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  partnerName: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  viewDetails: {
    ...typography.caption,
    color: colors.brand,
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
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: colors.brand,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  shopButtonText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '600',
  },
})

export default OrdersScreen
