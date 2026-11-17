import React from 'react';
import { StyleSheet, Text, View, Pressable, TouchableOpacity } from 'react-native';
import { Ponto } from '../types/ponto';
import { theme } from '../styles/theme';

interface PointCardProps {
  point: Ponto;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (point: Ponto) => void;
}

export const PointCard: React.FC<PointCardProps> = ({
  point,
  onPress,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const getTipoStyles = (tipo: string) => {
    const t = tipo.toLowerCase();
    if (t.includes('coleta')) {
      return {
        bg: theme.colors.primaryLight,
        text: theme.colors.primaryText,
      };
    }
    if (t.includes('distribui')) {
      return {
        bg: '#FEF3C7',
        text: '#92400E',
      };
    }
    return {
      bg: theme.colors.secondaryLight,
      text: theme.colors.secondaryText,
    };
  };

  const tipoStyle = getTipoStyles(point.tipo || '');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes do ponto ${point.nome}`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{point.nome}</Text>
          <View style={[styles.badge, { backgroundColor: tipoStyle.bg }]}>
            <Text style={[styles.badgeText, { color: tipoStyle.text }]}>
              {point.tipo}
            </Text>
          </View>
        </View>

        {onToggleFavorite && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onToggleFavorite(point)}
            style={styles.favoriteButton}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite
                ? `Desmarcar ${point.nome} dos favoritos`
                : `Favoritar ${point.nome}`
            }
          >
            <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.bairroText}>📍 {point.bairro}</Text>

      <Text style={styles.addressText} numberOfLines={2}>
        {point.endereco}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.hoursText} numberOfLines={1}>
          🕒 {point.horario}
        </Text>
        <Text style={styles.arrowIcon}>Ver detalhes →</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
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
    backgroundColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginRight: theme.spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMain,
    flex: 1,
    flexShrink: 1,
    marginRight: theme.spacing.sm,
  },
  badge: {
    flexShrink: 0,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  favoriteButton: {
    minWidth: 44,
    minHeight: 44,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.xs,
    marginTop: -6,
  },
  favoriteIcon: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  favoriteIconActive: {
    color: '#EF4444',
  },
  bairroText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.xs,
  },
  addressText: {
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
  hoursText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  arrowIcon: {
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    textAlign: 'right',
  },
});
