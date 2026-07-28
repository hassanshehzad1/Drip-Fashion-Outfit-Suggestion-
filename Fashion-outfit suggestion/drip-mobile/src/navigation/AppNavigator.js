import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import useAuthStore from '../stores/auth.store'
import useSocketStore from '../stores/socket.store'
import AuthStack from './AuthNavigator'
import UserNavigator from './TabNavigator'
import PartnerNavigator from './PartnerTabNavigator'
import AdminNavigator from './AdminNavigator'
import SplashScreen from '../screens/auth/SplashScreen'

const RootNavigator = () => {
  const { role, isLoading, initialize } = useAuthStore()
  const { connect, disconnect } = useSocketStore()

  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    // Connect socket when user is authenticated
    if (role && role !== null) {
      connect()
    }
    // Disconnect socket when user logs out
    return () => {
      if (role === null) {
        disconnect()
      }
    }
  }, [role, connect, disconnect])

  if (isLoading) return <SplashScreen />

  return (
    <NavigationContainer>
      {role === null     && <AuthStack />}
      {role === 'user'   && <UserNavigator />}
      {role === 'partner'&& <PartnerNavigator />}
      {role === 'admin'  && <AdminNavigator />}
    </NavigationContainer>
  )
}

export default RootNavigator
