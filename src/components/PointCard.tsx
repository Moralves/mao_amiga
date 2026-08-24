import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { CollectionPoint } from '../types/types';
import { theme } from '../styles/theme';

interface PointCardProps {
  point: CollectionPoint;
  onPress: () => void;
}

export const PointCard: React.FC<PointCardProps> = ({ point, onPress }) => {
  // Helper to render dynamic colors for each category type
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Eletrônicos':
        return {
          bg: theme.colors.secondaryLight,
          text: theme.colors.secondaryText,
        };
      case 'Recicláveis':
        return {
          bg: theme.colors.primaryLight,
          text: theme.colors.primaryText,
        };
      case 'Orgânicos':
        return {
          bg: '#FEF3C7', // Amber-100
          text: '#92400E', // Amber-800
        };
      case 'Vidros':
        return {
          bg: '#F3E8FF', // Purple-100
          text: '#6B21A8', // Purple-800
        };
      case 'Óleo Usado':
        return {
          bg: '#FFE4E6', // Rose-100
          text: '#9F1239', // Rose-800
        };
      default:
        return {
          bg: theme.colors.border,
          text: theme.colors.textSecondary,
        };
    }
  };

  const catStyle = getCategoryStyles(point.category);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={1}>
          {point.name}
        </Text>
        <View style={[styles.badge, { backgroundColor: catStyle.bg }]}>
          <Text style={[styles.badgeText, { color: catStyle.text }]}>
            {point.category}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {point.shortDescription}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.ratingContainer}>
          <Text style={styles.starIcon}>★</Text>
          <Text style={styles.ratingText}>{point.rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.arrowIcon}>Ver detalhes →</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.light,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
    backgroundColor: '#F1F5F9', // light gray visual feedback
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMain,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: theme.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: theme.colors.ratingActive,
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  arrowIcon: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
});
