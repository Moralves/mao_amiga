import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ponto } from '../types/ponto';
import { theme } from '../styles/theme';

interface PointCardProps {
  point: Ponto;
  onPress: () => void;
}

export const PointCard: React.FC<PointCardProps> = ({ point, onPress }) => {
  const getTipoStyles = (tipo: string) => {
    const t = tipo.toUpperCase();
    if (t.includes('RECEBE')) {
      return {
        bg: theme.colors.secondaryLight,
        text: theme.colors.secondaryText,
      };
    }
    if (t.includes('DISTRIBUI')) {
      return {
        bg: '#FEF3C7',
        text: '#92400E',
      };
    }
    return {
      bg: theme.colors.primaryLight,
      text: theme.colors.primaryText,
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
        <Text style={styles.title}>
          {point.nome}
        </Text>
        <View style={[styles.badge, { backgroundColor: tipoStyle.bg }]}>
          <Text style={[styles.badgeText, { color: tipoStyle.text }]}>
            {point.tipo}
          </Text>
        </View>
      </View>

      <Text style={styles.bairroText}>
        📍 {point.bairro}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {point.descricao || point.itens}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.hoursText} numberOfLines={1}>
          🕒 {point.horarioFuncionamento}
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMain,
    flex: 1,
    flexShrink: 1,
    marginRight: theme.spacing.sm,
  },
  badge: {
    flexShrink: 1,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
  bairroText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.xs,
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
