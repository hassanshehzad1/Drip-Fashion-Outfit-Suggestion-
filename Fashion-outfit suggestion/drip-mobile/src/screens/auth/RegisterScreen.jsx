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
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { registerUser } from '../../api/auth.api'
import useAuthStore from '../../stores/auth.store'
import { parseApiError } from '../../utils/parseApiError'
import { colors, typography } from '../../theme'
import Toast from 'react-native-toast-message'

const RegisterScreen = () => {
  const navigation = useNavigation()
  const { setUser } = useAuthStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleRegister = async () => {
    setErrors({})
    setLoading(true)

    try {
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      })
      const { user, accessToken, refreshToken } = response.data.data
      await setUser(user, accessToken, refreshToken)
      Toast.show({
        type: 'success',
        text1: 'Account created!',
      })
      navigation.navigate('StyleQuiz')
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

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Create your account</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="Your full name"
          value={formData.name}
          onChangeText={(value) => updateField('name', value)}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="your@email.com"
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
    </View>
  )

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Add your phone</Text>
      <Text style={styles.stepDescription}>
        Optional - helps with order updates
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="+92 XXX XXXXXXX"
          value={formData.phone}
          onChangeText={(value) => updateField('phone', value)}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity onPress={handleNext}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  )

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Setting up your style...</Text>
      <Text style={styles.stepDescription}>
        We'll personalize your feed based on your preferences
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating account...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>👗 drip</Text>
          <View style={styles.progressContainer}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={[
                  styles.progressDot,
                  s <= step && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          )}
          
          {step === 1 && (
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.brand,
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderDark,
  },
  progressDotActive: {
    backgroundColor: colors.brand,
  },
  stepContent: {
    marginBottom: 32,
  },
  stepTitle: {
    ...typography.h3,
    color: colors.textInverse,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    ...typography.body2,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
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
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: 4,
  },
  skipText: {
    ...typography.body2,
    color: colors.brand,
    textAlign: 'center',
    marginTop: 16,
  },
  button: {
    backgroundColor: colors.brand,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    ...typography.body2,
    color: colors.textMuted,
  },
  nextButton: {
    padding: 8,
  },
  nextText: {
    ...typography.body2,
    color: colors.brand,
    fontWeight: '600',
  },
})

export default RegisterScreen
