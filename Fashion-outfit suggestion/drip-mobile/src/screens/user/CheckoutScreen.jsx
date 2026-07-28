import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { getCart } from '../../api/cart.api'
import { checkout } from '../../api/order.api'
import { colors, typography } from '../../theme'
import { formatPrice } from '../../utils/format'
import Toast from 'react-native-toast-message'

const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
})

const CheckoutScreen = () => {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('stripe')

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      province: '',
      postalCode: '',
    }
  })

  const loadCart = async () => {
    try {
      const response = await getCart()
      setCart(response.data.data.cart)
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load cart',
      })
    }
  }

  const handleCheckout = async (data) => {
    setLoading(true)
    try {
      const response = await checkout({
        deliveryAddress: data,
        paymentMethod,
      })
      
      if (paymentMethod === 'stripe' && response.data.data.clientSecret) {
        // TODO: Handle Stripe payment
        navigation.navigate('OrderConfirm', { 
          orderId: response.data.data.orderId,
          paymentMethod: 'stripe',
        })
      } else {
        navigation.navigate('OrderConfirm', { 
          orderId: response.data.data.orderId,
          paymentMethod: 'cod',
        })
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Checkout failed',
      })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadCart()
  }, [])

  const items = cart?.items || []
  const total = cart?.totalAmount || 0

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name *</Text>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  placeholder="Your full name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}
              </>
            )}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone *</Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="Your phone number"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="phone-pad"
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
              </>
            )}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Address Line 1 *</Text>
          <Controller
            control={control}
            name="addressLine1"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  style={[styles.input, errors.addressLine1 && styles.inputError]}
                  placeholder="Street address"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.addressLine1 && <Text style={styles.errorText}>{errors.addressLine1.message}</Text>}
              </>
            )}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Address Line 2</Text>
          <Controller
            control={control}
            name="addressLine2"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Apartment, suite, etc."
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>City *</Text>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    style={[styles.input, errors.city && styles.inputError]}
                    placeholder="City"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  {errors.city && <Text style={styles.errorText}>{errors.city.message}</Text>}
                </>
              )}
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Province *</Text>
            <Controller
              control={control}
              name="province"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    style={[styles.input, errors.province && styles.inputError]}
                    placeholder="Province"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  {errors.province && <Text style={styles.errorText}>{errors.province.message}</Text>}
                </>
              )}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Postal Code *</Text>
          <Controller
            control={control}
            name="postalCode"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  style={[styles.input, errors.postalCode && styles.inputError]}
                  placeholder="Postal code"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.postalCode && <Text style={styles.errorText}>{errors.postalCode.message}</Text>}
              </>
            )}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <TouchableOpacity
          style={[styles.paymentOption, paymentMethod === 'stripe' && styles.paymentOptionActive]}
          onPress={() => setPaymentMethod('stripe')}
        >
          <View style={styles.radioCircle}>
            {paymentMethod === 'stripe' && <View style={styles.radioDot} />}
          </View>
          <Text style={styles.paymentLabel}>Card (Stripe)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionActive]}
          onPress={() => setPaymentMethod('cod')}
        >
          <View style={styles.radioCircle}>
            {paymentMethod === 'cod' && <View style={styles.radioDot} />}
          </View>
          <Text style={styles.paymentLabel}>Cash on Delivery</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        
        {items.map((item) => (
          <View key={item._id} style={styles.summaryItem}>
            <Text style={styles.summaryItemName} numberOfLines={1}>
              {item.outfit?.title} x{item.quantity}
            </Text>
            <Text style={styles.summaryItemPrice}>
              {formatPrice(item.priceAtAdd * item.quantity)}
            </Text>
          </View>
        ))}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatPrice(total)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <Text style={styles.summaryValue}>Calculated at checkout</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.checkoutButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit(handleCheckout)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={styles.checkoutButtonText}>
            Place Order - {formatPrice(total)}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentOptionActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brand50,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand,
  },
  paymentLabel: {
    ...typography.body1,
    color: colors.textPrimary,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryItemName: {
    ...typography.body2,
    color: colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  summaryItemPrice: {
    ...typography.body2,
    color: colors.textPrimary,
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
  checkoutButton: {
    backgroundColor: colors.brand,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '600',
  },
})

export default CheckoutScreen
