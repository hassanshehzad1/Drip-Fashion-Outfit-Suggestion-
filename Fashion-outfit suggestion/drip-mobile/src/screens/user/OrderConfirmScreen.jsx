import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { getOrder } from '../../api/order.api'
import { colors, typography } from '../../theme'
import { formatPrice } from '../../utils/format'
import Toast from 'react-native-toast-message'

const OrderConfirmScreen = () => {
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

  const handleViewOrders = () => {
    navigation.navigate('Orders')
  }

  const handleContinueShopping = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'UserTabs' }],
    })
  }

  useEffect(() => {
    loadOrder()
  }, [orderId])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>✅</Text>
        </View>
        
        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your order #{order?.orderNumber} has been placed successfully
        </Text>

        <View style={styles.orderCard}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Order Number</Text>
            <Text style={styles.orderValue}>{order?.orderNumber}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Total Amount</Text>
            <Text style={styles.orderValue}>{formatPrice(order?.totalAmount)}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Payment Method</Text>
            <Text style={styles.orderValue}>
              {order?.paymentMethod === 'stripe' ? 'Card' : 'Cash on Delivery'}
            </Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Estimated Delivery</Text>
            <Text style={styles.orderValue}>3-5 business days</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What's Next?</Text>
          <Text style={styles.infoText}>
            • You'll receive a confirmation email shortly
          </Text>
          <Text style={styles.infoText}>
            • Track your order status in the Orders section
          </Text>
          <Text style={styles.infoText}>
            • Our team will contact you for delivery confirmation
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewOrders}
        >
          <Text style={styles.primaryButtonText}>View Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleContinueShopping}
        >
          <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: 48,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderLabel: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  orderValue: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: colors.brand50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    ...typography.body1,
    color: colors.brand,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    ...typography.body2,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: colors.brand,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.textPrimary,
    fontWeight: '600',
  },
})

export default OrderConfirmScreen
