import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Picker,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { registerPartner } from '../../api/partner.api'
import { parseApiError } from '../../utils/parseApiError'
import { colors, typography } from '../../theme'
import Toast from 'react-native-toast-message'

const PartnerRegisterScreen = () => {
  const navigation = useNavigation()
  const [formData, setFormData] = useState({
    brandName: '',
    email: '',
    password: '',
    confirmPassword: '',
    category: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)

  const categories = [
    'casual', 'formal', 'streetwear', 'sportswear', 'ethnic',
    'luxury', 'accessories', 'footwear', 'kids', 'other'
  ]

  const handleRegister = async () => {
    setErrors({})
    setLoading(true)

    try {
      await registerPartner(formData)
      setShowSuccess(true)
    } catch (error) {
      const parsed = parseApiError(error)
      setErrors(parsed.fieldErrors)
      Toast.show({
        type: 'error',
        text1: parsed.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: null }))
  }

  const handleLogin = () => {
    navigation.navigate('PartnerLogin')
  }

  if (showSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successMessage}>
            Your registration is under review. We'll approve within 24 hours.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏪 drip</Text>
          <Text style={styles.title}>Register your brand</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Brand Name</Text>
            <TextInput
              style={[styles.input, errors.brandName && styles.inputError]}
              placeholder="Your brand name"
              value={formData.brandName}
              onChangeText={(value) => updateField('brandName', value)}
            />
            {errors.brandName && <Text style={styles.errorText}>{errors.brandName}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="brand@email.com"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Min 8 characters"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <View style={[styles.picker, errors.category && styles.inputError]}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) => updateField('category', value)}
                style={styles.pickerItem}
              >
                <Picker.Item label="Select category" value="" />
                {categories.map(cat => (
                  <Picker.Item key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)} value={cat} />
                ))}
              </Picker>
            </View>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.link}>
            Already have an account? <Text style={styles.linkText}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  successTitle: {
    ...typography.h2,
    color: colors.textInverse,
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    ...typography.body1,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.brand,
    marginBottom: 8,
  },
  title: {
    ...typography.h3,
    color: colors.textInverse,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    ...typography.body2,
    color: colors.textMuted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.darkCard,
    color: colors.textInverse,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.danger,
  },
  picker: {
    backgroundColor: colors.darkCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  pickerItem: {
    color: colors.textInverse,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.brand,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '600',
  },
  link: {
    ...typography.body2,
    color: colors.textMuted,
    textAlign: 'center',
  },
  linkText: {
    color: colors.brand,
    fontWeight: '600',
  },
})

export default PartnerRegisterScreen
