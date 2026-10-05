import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { DonationItem } from '../types/types';
import { theme } from '../styles/theme';

export interface ItemTypeSummary {
  itemType: string;
  totalQuantity: number;
  count: number;
  formattedText: string;
}

export interface DonationsSummaryData {
  totalDonations: number;
  totalQuantity: number;
  byType: ItemTypeSummary[];
}

export interface DonationSummaryProps {
  donations: DonationItem[];
}

/**
 * Normaliza o nome do tipo para exibição elegante com inicial maiúscula.
 */
export function formatarNomeTipo(tipo?: string): string {
  const trimmed = (tipo || '').trim();
  if (!trimmed) return 'Outros';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Formata o texto de resumo de acordo com a especificação:
 * Exemplo: "Roupa: 15 unidades em 3 doações"
 */
export function formatarResumoItem(itemType: string, totalQuantity: number, count: number): string {
  const unidadeText = totalQuantity === 1 ? 'unidade' : 'unidades';
  const doacaoText = count === 1 ? 'doação' : 'doações';
  return `${itemType}: ${totalQuantity} ${unidadeText} em ${count} ${doacaoText}`;
}

/**
 * Calcula os totais de doações e quantidades agrupadas por tipo de item a partir do array.
 * Os tipos são ordenados decrescentemente da maior quantidade total somada para a menor.
 * 
 * Critérios atendidos:
 * - Calculado dinamicamente a partir do array de doações, sem salvar separadamente.
 * - Tipos ordenados da maior quantidade para a menor.
 * - Insensível a diferenças de caixa (ex: "roupa" e "Roupa" agrupam juntos).
 * - Suporta array vazio sem quebrar a tela.
 */
export function calcularResumoDoacoes(donations: DonationItem[]): DonationsSummaryData {
  if (!Array.isArray(donations) || donations.length === 0) {
    return {
      totalDonations: 0,
      totalQuantity: 0,
      byType: [],
    };
  }

  const totalDonations = donations.length;
  let totalQuantity = 0;
  const map = new Map<string, { displayName: string; totalQuantity: number; count: number }>();

  for (const donation of donations) {
    const rawType = donation?.itemType?.trim() || 'Outros';
    const key = rawType.toLowerCase();
    const displayName = formatarNomeTipo(rawType);

    const numQty =
      typeof donation?.quantity === 'number'
        ? donation.quantity
        : parseInt(String(donation?.quantity), 10);
    const qty = !isNaN(numQty) && numQty > 0 ? numQty : 0;

    totalQuantity += qty;

    const existing = map.get(key);
    if (existing) {
      existing.totalQuantity += qty;
      existing.count += 1;
    } else {
      map.set(key, {
        displayName,
        totalQuantity: qty,
        count: 1,
      });
    }
  }

  // Ordena os tipos da maior quantidade somada para a menor
  const byType: ItemTypeSummary[] = Array.from(map.values())
    .map((item) => ({
      itemType: item.displayName,
      totalQuantity: item.totalQuantity,
      count: item.count,
      formattedText: formatarResumoItem(item.displayName, item.totalQuantity, item.count),
    }))
    .sort((a, b) => {
      // 1º Critério: Maior quantidade somada
      if (b.totalQuantity !== a.totalQuantity) {
        return b.totalQuantity - a.totalQuantity;
      }
      // 2º Critério: Maior número de doações
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      // 3º Critério: Ordem alfabética
      return a.itemType.localeCompare(b.itemType, 'pt-BR');
    });

  return {
    totalDonations,
    totalQuantity,
    byType,
  };
}

export const DonationSummary: React.FC<DonationSummaryProps> = ({ donations }) => {
  // Cálculo puro e derivado a cada renderização a partir do array de doações
  const summary = useMemo(() => calcularResumoDoacoes(donations), [donations]);
  const { totalDonations, totalQuantity, byType } = summary;

  // Estado adequado sem quebrar a tela quando não há doações
  if (totalDonations === 0) {
    return (
      <View
        style={styles.card}
        testID="donations-summary-card"
        accessibilityRole="summary"
        accessibilityLabel="Resumo de doações: Nenhuma doação registrada ainda."
      >
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <Text style={styles.icon}>📊</Text>
            <Text style={styles.title}>Resumo de doações</Text>
          </View>
          <View style={styles.badgeZero}>
            <Text style={styles.badgeZeroText} testID="summary-total-donations">
              0 doações
            </Text>
          </View>
        </View>

        <View style={styles.emptyContainer} testID="summary-empty-state">
          <Text style={styles.emptyText}>Nenhuma doação registrada ainda.</Text>
          <Text style={styles.emptySubtext}>
            O resumo por tipo de item será calculado automaticamente assim que forem cadastradas doações.
          </Text>
        </View>
      </View>
    );
  }

  // Conteúdo da lista de tipos de itens
  const renderTypesList = () => (
    <View style={styles.typesList}>
      {byType.map((item, index) => (
        <View
          key={item.itemType}
          style={[
            styles.typeRow,
            index === byType.length - 1 && styles.lastTypeRow,
          ]}
          testID={`summary-item-${item.itemType.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <View style={styles.bulletPoint}>
            <Text style={styles.bulletText}>•</Text>
          </View>
          <View style={styles.typeTextContainer}>
            <Text
              style={styles.typeFormattedText}
              testID={`summary-text-${item.itemType.toLowerCase().replace(/\s+/g, '-')}`}
              accessibilityLabel={item.formattedText}
            >
              <Text style={styles.typeBold}>{item.itemType}</Text>: {item.totalQuantity} {item.totalQuantity === 1 ? 'unidade' : 'unidades'} em {item.count} {item.count === 1 ? 'doação' : 'doações'}
            </Text>
          </View>
          <View style={styles.quantityTag}>
            <Text style={styles.quantityTagText}>{item.totalQuantity} un.</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View
      style={styles.card}
      testID="donations-summary-card"
      accessibilityRole="summary"
      accessibilityLabel={`Resumo de doações: ${totalDonations} ${totalDonations === 1 ? 'doação' : 'doações'}, total de ${totalQuantity} ${totalQuantity === 1 ? 'unidade' : 'unidades'}.`}
    >
      {/* Topo do resumo com título e badges de total */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>📊</Text>
          <Text style={styles.title}>Resumo de doações</Text>
        </View>
        <View style={styles.badgesGroup}>
          <View style={styles.badgePrimary}>
            <Text style={styles.badgePrimaryText} testID="summary-total-donations">
              {totalDonations} {totalDonations === 1 ? 'doação' : 'doações'}
            </Text>
          </View>
          <View style={styles.badgeSecondary}>
            <Text style={styles.badgeSecondaryText} testID="summary-total-quantity">
              {totalQuantity} {totalQuantity === 1 ? 'unidade' : 'unidades'}
            </Text>
          </View>
        </View>
      </View>

      {/* Legenda explicativa de ordenação */}
      <View style={styles.sectionDivider} />
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionSubtitle}>Quantidade somada por tipo de item:</Text>
      </View>

      {/* Se houver mais de 4 tipos, permite rolagem interna suave sem estourar altura */}
      {byType.length > 4 ? (
        <ScrollView
          style={styles.scrollContainer}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          {renderTypesList()}
        </ScrollView>
      ) : (
        renderTypesList()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#D1FAE5', // Suave contorno verde esmeralda
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.light,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  icon: {
    fontSize: 18,
    marginRight: theme.spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.3,
  },
  badgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgePrimary: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.round,
  },
  badgePrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  badgeSecondary: {
    backgroundColor: theme.colors.secondaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.round,
  },
  badgeSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.secondaryText,
  },
  badgeZero: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.round,
  },
  badgeZeroText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  sectionHeaderRow: {
    marginTop: 2,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  scrollContainer: {
    maxHeight: 150,
  },
  typesList: {
    paddingTop: 2,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  lastTypeRow: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  bulletPoint: {
    width: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: {
    fontSize: 14,
    color: theme.colors.primaryDark,
    fontWeight: 'bold',
  },
  typeTextContainer: {
    flex: 1,
    marginRight: theme.spacing.xs,
  },
  typeFormattedText: {
    fontSize: 14,
    color: theme.colors.textMain,
    lineHeight: 19,
  },
  typeBold: {
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  quantityTag: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  quantityTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  emptySubtext: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 16,
  },
});

export default DonationSummary;
