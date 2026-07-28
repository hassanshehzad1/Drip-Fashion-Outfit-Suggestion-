import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { StripeProvider } from '@stripe/stripe-react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import RootNavigator from './src/navigation/AppNavigator'
import { colors } from './src/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'}>
        <RootNavigator />
        <StatusBar style="light" backgroundColor={colors.dark} />
        <Toast />
      </StripeProvider>
    </QueryClientProvider>
  )
}
