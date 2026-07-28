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
import { loginPartner } from '../../api/partner.api'
import useAuthStore from '../../stores/auth.store'
import { parseApiError } from '../../utils/parseApiError'
import { colors, typography } from '../../theme'
import Toast from 'react-native-toast-message'

const PartnerLoginScreen = () => {
  const navigation = useNavigation()
  const { setPartner } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleLogin = async () => {
    setErrors({})
    setLoading(true)

    try {
      const response = await loginPartner({ email, password })
      const { partner, accessToken, refreshToken } = response.data.data
      await setPartner(partner, accessToken, refreshToken)
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
      })
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

  const handleRegister = () => {
    navigation.navigate('PartnerRegister')
  }

  const handleUserLogin = () => {
    navigation.navigate('Login')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏪 drip</Text>
          <Text style={styles.welcome}>Brand Portal</Text>
          <Text style={styles.subtitle}>Manage your fashion business</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="brand@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.link}>
              Register your brand <Text style={styles.linkText}>→</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleUserLogin}>
            <Text style={styles.link}>
              User login <Text style={styles.linkText}>→</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rateLimitNotice}>
          <Text style={styles.rateLimitText}>
            5 attempts per 15 minutes
          </Text>
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
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.brand,
    marginBottom: 8,
  },
  welcome: {
    ...typography.h3,
    color: colors.textInverse,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textMuted,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
  },
  eyeText: {
    fontSize: 20,
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
  footer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  link: {
    ...typography.body2,
    color: colors.textMuted,
    marginBottom: 12,
  },
  linkText: {
    color: colors.brand,
    fontWeight: '600',
  },
  rateLimitNotice: {
    alignItems: 'center',
  },
  rateLimitText: {
    ...typography.caption,
    color: colors.textMuted,
  },
})

export default PartnerLoginScreen
