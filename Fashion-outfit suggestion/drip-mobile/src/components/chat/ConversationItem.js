import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils';
import { Avatar, Badge } from '../common';
import theme from '../../theme';

const ConversationItem = ({
  conversation,
  onPress,
  style,
}) => {
  const { otherParty, lastMessage, unreadCount } = conversation;
  const isPartner = conversation.type === 'partner';

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <Avatar
          source={otherParty?.avatar || otherParty?.logo}
          name={otherParty?.name || otherParty?.brandName}
          size="large"
        />
        {unreadCount > 0 && (
          <Badge variant="primary" size="small" style={styles.badge}>
            {unreadCount}
          </Badge>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>
            {otherParty?.name || otherParty?.brandName}
          </Text>
          <Text style={styles.time}>
            {lastMessage ? formatDate(lastMessage.createdAt) : ''}
          </Text>
        </View>
        <View style={styles.messageContainer}>
          <Text style={styles.message} numberOfLines={1}>
            {lastMessage?.text || 'No messages yet'}
          </Text>
          {isPartner && (
            <Badge variant="secondary" size="small">
              Partner
            </Badge>
          )}
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.gray[400]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  content: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  time: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});

export default ConversationItem;
