import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '../../theme';

const Card = ({
  children,
  style,
  shadow = true,
  padding = true,
  ...props
}) => {
  const cardStyles = [
    styles.card,
    shadow && styles.shadow,
    padding && styles.padding,
    style,
  ];

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  shadow: {
    ...theme.shadows.md,
  },
  padding: {
    padding: theme.spacing.lg,
  },
});

export default Card;
