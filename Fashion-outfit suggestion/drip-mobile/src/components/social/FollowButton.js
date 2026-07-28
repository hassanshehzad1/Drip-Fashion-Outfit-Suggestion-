import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

const FollowButton = ({ isFollowing, onPress, variant = 'primary', style }) => {
  const buttonStyles = [
    styles.button,
    styles[variant],
    isFollowing && styles.following,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    isFollowing && styles.followingText,
  ];

  return (
    <View style={buttonStyles} onTouchEnd={onPress}>
      {isFollowing ? (
        <>
          <Ionicons name="checkmark" size={16} color={theme.colors.text} />
          <Text style={textStyles}>Following</Text>
        </>
      ) : (
        <>
          <Ionicons name="add" size={16} color={theme.colors.secondary} />
          <Text style={textStyles}>Follow</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.gray[200],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  following: {
    backgroundColor: theme.colors.gray[200],
  },
  text: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  primaryText: {
    color: theme.colors.secondary,
  },
  secondaryText: {
    color: theme.colors.primary,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  followingText: {
    color: theme.colors.text,
  },
});

export default FollowButton;
