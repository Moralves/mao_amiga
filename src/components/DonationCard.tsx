import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DonationItem } from '../types/types';
import { mockCollectionPoints } from '../data/mockPoints';
import { theme } from '../styles/theme';

export interface DonationCardProps {
  item?: DonationItem;
  donation?: DonationItem;
  pointName?: string;
}

const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString('pt-BR');
  } catch {
    return isoString;
  }
};

export const DonationCard = React.memo<DonationCardProps>(function DonationCard({
  item,
  donation,
  pointName,
}) {
  const data = item ?? donation;
  if (!data) return null;

  const destinationName =
    pointName ||
    mockCollectionPoints.find((point) => point.id === data.pointId)?.name ||
    'Ponto de coleta';

  const formattedDate = formatDate(data.criadoEm);

  return (
    <View style={styles.card} testID={`donation-card-${data.id}`}>
      <View style={styles.headerRow}>
        <Text style={styles.itemTitle}>{data.itemType}</Text>
        <View style={styles.quantityBadge}>
          <Text style={styles.quantityBadgeText}>
            {data.quantity} {data.quantity === 1 ? 'item' : 'itens'}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Tipo:</Text>
        <Text style={styles.infoValue}>{data.itemType}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Quantidade:</Text>
        <Text style={styles.infoValue}>{data.quantity}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Ponto de destino:</Text>
        <Text style={styles.infoValue}>{destinationName}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Data:</Text>
        <Text style={styles.infoValue}>{formattedDate}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.light,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: theme.spacing.xs,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMain,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  quantityBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
  },
  quantityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    width: 130,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.textMain,
    flex: 1,
    fontWeight: '500',
  },
});

export const DonationItemCard = DonationCard;
export default DonationCard;

