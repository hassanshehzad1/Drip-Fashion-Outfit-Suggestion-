import React from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, typography } from '../../theme'

const Avatar = ({
  source,
  size = 'medium',
  name,
  style,
}) => {
  const sizeStyles = {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  }

  const avatarSize = sizeStyles[size] || sizeStyles.medium
  const fontSize = avatarSize * 0.4

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <View
      style={[
        styles.container,
        { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
        style,
      ]}
    >
      {source ? (
        <Image
          source={{ uri: source }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : name ? (
        <Text style={[styles.initials, { fontSize }]}>
          {getInitials(name)}
        </Text>
      ) : (
        <Ionicons
          name="person"
          size={fontSize}
          color={colors.textMuted}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
})

export default Avatar
