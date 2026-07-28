import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, { FadeIn, ScaleIn } from 'react-native-reanimated'

const SplashScreen = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigation handled by RootNavigator based on auth state
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeIn.duration(800)}
        style={styles.logoContainer}
      >
        <Animated.Text 
          entering={ScaleIn.duration(800)}
          style={styles.logo}
        >
          👗 drip
        </Animated.Text>
        <View style={styles.glow} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(233, 30, 99, 0.3)',
    filter: 'blur(40px)',
    zIndex: -1,
  },
})

export default SplashScreen
