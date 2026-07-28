import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { colors, typography } from '../../theme'

const { width, height } = Dimensions.get('window')

const slides = [
  {
    id: '1',
    icon: '🎬',
    title: 'Discover Fashion Reels',
    description: 'TikTok-style scrolling through the latest fashion trends and outfit inspirations.',
  },
  {
    id: '2',
    icon: '🤖',
    title: 'AI Picks Your Style',
    description: 'Personalized feed based on your preferences and style profile.',
  },
  {
    id: '3',
    icon: '🛍️',
    title: 'Shop in One Tap',
    description: 'Checkout without leaving the app. Fast, secure, and convenient.',
  },
]

const OnboardingScreen = () => {
  const navigation = useNavigation()
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleGetStarted = () => {
    navigation.navigate('Login')
  }

  const handlePartner = () => {
    navigation.navigate('PartnerLogin')
  }

  const handleSkip = () => {
    navigation.navigate('Login')
  }

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width)
          setCurrentIndex(index)
        }}
        style={styles.carousel}
      />

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handlePartner}
        >
          <Text style={styles.secondaryButtonText}>I'm a Brand</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carousel: {
    flex: 1,
    width,
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.brand,
    width: 24,
  },
  buttons: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    width: '100%',
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  skipText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})

export default OnboardingScreen
