import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { getOrder, cancelOrder } from '../../api/order.api'
import { colors, typography } from '../../theme'
import { formatPrice, timeAgo } from '../../utils/format'
import Toast from 'react-native-toast-message'

const OrderDetailScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { orderId } = route.params
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadOrder = async () => {
    setLoading(true)
    try {
      const response = await getOrder(orderId)
      setOrder(response.data.data.order)
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load order',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(orderId, { reason: 'Customer requested' })
              await loadOrder()
              Toast.show({
                type: 'success',
                text1: 'Order cancelled',
              })
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Failed to cancel order',
              })
            }
          },
        },
      ]
    )
  }

  useEffect(() => {
    loadOrder()
  }, [orderId])

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

  const canCancel = order?.status === 'pending' || order?.status === 'confirmed'

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    )
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Order Number</Text>
          <Text style={styles.infoValue}>{order.orderNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>{timeAgo(order.createdAt)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment Method</Text>
          <Text style={styles.infoValue}>
            {order.paymentMethod === 'stripe' ? 'Card' : 'Cash on Delivery'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total</Text>
          <Text style={styles.infoValue}>{formatPrice(order.totalAmount)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        
        <Text style={styles.addressName}>{order.deliveryAddress?.fullName}</Text>
        <Text style={styles.addressPhone}>{order.deliveryAddress?.phone}</Text>
        <Text style={styles.addressLine}>{order.deliveryAddress?.addressLine1}</Text>
        {order.deliveryAddress?.addressLine2 && (
          <Text style={styles.addressLine}>{order.deliveryAddress.addressLine2}</Text>
        )}
        <Text style={styles.addressCity}>
          {order.deliveryAddress?.city}, {order.deliveryAddress?.province}
        </Text>
        <Text style={styles.addressPostal}>{order.deliveryAddress?.postalCode}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items ({order.items?.length})</Text>
        
        {order.items?.map((item) => (
          <View key={item._id} style={styles.itemCard}>
            <View style={styles.itemImage}>
              <Text style={styles.itemImagePlaceholder}>📷</Text>
            </View>
            
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.outfit?.title}
              </Text>
              <Text style={styles.itemPartner}>
                {item.outfit?.partner?.brandName}
              </Text>
              <Text style={styles.itemMeta}>
                Size: {item.size} × {item.quantity}
              </Text>
            </View>

            <Text style={styles.itemPrice}>
              {formatPrice(item.price * item.quantity)}
            </Text>
          </View>
        ))}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatPrice(order.totalAmount)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <Text style={styles.summaryValue}>Included</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(order.totalAmount)}</Text>
        </View>
      </View>

      {canCancel && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel Order</Text>
        </TouchableOpacity>
      )}
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    ...typography.body2,
    color: colors.textInverse,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  addressName: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressPhone: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  addressLine: {
    ...typography.body2,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  addressCity: {
    ...typography.body2,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  addressPostal: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  itemImage: {
    width: 60,
    height: 80,
    backgroundColor: colors.surface,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemImagePlaceholder: {
    fontSize: 20,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPartner: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  itemMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  itemPrice: {
    ...typography.body1,
    color: colors.brand,
    fontWeight: '600',
    marginLeft: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.body2,
    color: colors.textPrimary,
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  totalValue: {
    ...typography.price,
    color: colors.brand,
  },
  cancelButton: {
    backgroundColor: colors.danger,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
    marginTop: 24,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '600',
  },
})

export default OrderDetailScreen
