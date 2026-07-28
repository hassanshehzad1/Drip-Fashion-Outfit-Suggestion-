import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils';
import { Avatar } from '../common';
import theme from '../../theme';

const CommentItem = ({
  comment,
  onReply,
  onDelete,
  isOwner,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Avatar
        source={comment.user?.avatar}
        name={comment.user?.name}
        size="small"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username}>{comment.user?.name}</Text>
          <Text style={styles.time}>{formatDate(comment.createdAt)}</Text>
        </View>
        <Text style={styles.text}>{comment.text}</Text>
        
        {comment.replies?.length > 0 && (
          <TouchableOpacity style={styles.repliesButton}>
            <Text style={styles.repliesText}>
              View {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {(isOwner || comment.isOwner) && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(comment._id)}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  content: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  username: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  time: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  text: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.normal,
  },
  repliesButton: {
    marginTop: theme.spacing.xs,
  },
  repliesText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
});

export default CommentItem;
