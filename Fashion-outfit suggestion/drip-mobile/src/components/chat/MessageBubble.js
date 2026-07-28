import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography } from '../../theme'
import { timeAgo } from '../../utils/format'

const MessageBubble = ({
  message,
  isOwn,
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.own : styles.other,
        style,
      ]}
    >
      <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>
        {message.text}
      </Text>
      
      {message.outfit && (
        <View style={styles.outfitAttachment}>
          <Text style={styles.outfitIcon}>👗</Text>
          <Text style={styles.outfitText}>Outfit shared</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={[styles.time, isOwn && styles.timeOwn]}>
          {timeAgo(message.createdAt)}
        </Text>
        {isOwn && (
          <Text style={styles.readReceipt}>
            {message.isRead ? '✓✓' : '✓'}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    gap: 4,
  },
  own: {
    alignSelf: 'flex-end',
    backgroundColor: colors.brand,
    borderBottomRightRadius: 4,
  },
  other: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
  },
  text: {
    ...typography.body1,
  },
  ownText: {
    color: colors.textInverse,
  },
  otherText: {
    color: colors.textPrimary,
  },
  outfitAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  outfitIcon: {
    fontSize: 16,
  },
  outfitText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
  },
  timeOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  readReceipt: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
  },
})

export default MessageBubble
