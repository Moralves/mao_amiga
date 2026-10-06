import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { excluirDoacao } from '../data/doacoesStorage';
import { mockCollectionPoints } from '../data/mockPoints';
import { theme } from '../styles/theme';
import { DonationItem } from '../types/types';

/**
 * Parâmetros esperados pela rota (route.params)
 * Suporta tanto o objeto 'donation' empacotado quanto parâmetros diretos
 */
export interface DonationDetailRouteParams {
  donation?: DonationItem;
  doacao?: DonationItem;
  id?: string;
  itemType?: string;
  quantity?: number;
  pointId?: string;
  criadoEm?: string;
  [key: string]: unknown;
}

export interface DonationDetailScreenProps {
  route?: {
    params?: DonationDetailRouteParams;
  };
  navigation?: {
    goBack?: () => void;
    navigate?: (screen: string, params?: unknown) => void;
  };
  donation?: DonationItem;
  onBack?: () => void;
  onDeleteSuccess?: () => void;
}

/**
 * Converte a data ISO em formato legível brasileiro: "DD/MM/AAAA às HH:mm"
 * Exemplo didático de formatação sem dependências externas.
 */
export const formatarDataLegivel = (isoString?: string): string => {
  if (!isoString) return 'Data não informada';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
  } catch {
    return isoString;
  }
};

/**
 * Tela de Detalhes da Doação
 * 
 * Critérios atendidos:
 * 1. Recebe a doação por route.params e mostra todos os campos, incluindo a data formatada de forma legível.
 * 2. O botão de excluir pede confirmação via Alert.alert (com as opções Cancelar e Excluir).
 * 3. Cancelar não apaga nada.
 * 4. Confirmar apaga a doação do AsyncStorage (excluirDoacao(id)), volta ao histórico e a doação some da lista.
 */
export const DonationDetailScreen: React.FC<DonationDetailScreenProps> = ({
  route,
  navigation,
  donation: propDonation,
  onBack,
  onDeleteSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Extração segura da doação a partir de route.params ou props
  const params = route?.params;
  const donation: DonationItem | undefined =
    propDonation ??
    params?.donation ??
    params?.doacao ??
    (params?.id && params?.itemType ? (params as unknown as DonationItem) : undefined);

  // Busca as informações do ponto de coleta associado
  const collectionPoint = donation
    ? mockCollectionPoints.find((p) => p.id === donation.pointId)
    : undefined;

  const pointName = collectionPoint ? collectionPoint.name : 'Ponto de coleta';
  const pointAddress = collectionPoint ? collectionPoint.address : 'Endereço não disponível';
  const pointCategory = collectionPoint ? collectionPoint.category : 'Geral';

  // Manipulador de navegação de retorno
  const handleVoltar = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  /**
   * Executa a exclusão definitiva no AsyncStorage através da função do arquivo de acesso
   */
  const executarExclusao = async () => {
    if (!donation?.id || isDeleting) return;

    try {
      setIsDeleting(true);

      // Chamada da função centralizada de exclusão no AsyncStorage
      await excluirDoacao(donation.id);

      // Retorno ao histórico após exclusão concluída
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else if (navigation?.goBack) {
        navigation.goBack();
      } else if (onBack) {
        onBack();
      }
    } catch {
      setIsDeleting(false);
      Alert.alert('Erro', 'Não foi possível excluir esta doação. Tente novamente.');
    }
  };

  /**
   * Solicita confirmação de exclusão ao usuário via Alert.alert
   * Opções: Cancelar (não faz nada) e Excluir (apaga e volta ao histórico)
   */
  const handleConfirmarExclusao = () => {
    if (!donation?.id || isDeleting) return;

    // Diálogo nativo conforme especificação
    Alert.alert(
      'Excluir doação',
      'Tem certeza de que deseja excluir esta doação do histórico? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          // Cancelar não apaga nada
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: executarExclusao,
        },
      ]
    );

    // Suporte para execução no navegador Web (onde react-native-web possui Alert.alert sem UI nativa)
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      const confirmou = window.confirm(
        'Tem certeza de que deseja excluir esta doação do histórico? Esta ação não pode ser desfeita.'
      );
      if (confirmou) {
        executarExclusao();
      }
    }
  };

  // Estado caso nenhuma doação tenha sido fornecida nos parâmetros
  if (!donation) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBg} />
        <View style={styles.header}>
          <Pressable
            onPress={handleVoltar}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Detalhe da doação</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>Doação não encontrada</Text>
          <Text style={styles.emptySubtitle}>
            Não foi possível carregar os dados desta doação a partir dos parâmetros informados.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleVoltar}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Voltar ao histórico</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const dataFormatada = formatarDataLegivel(donation.criadoEm);

  return (
    <SafeAreaView style={styles.safeContainer} testID="donation-detail-screen">
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBg} />

      {/* Cabeçalho de Navegação */}
      <View style={styles.header}>
        <Pressable
          onPress={handleVoltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar ao histórico"
          style={styles.backButton}
          testID="button-back"
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Detalhe da doação</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Card de Destaque / Resumo Principal */}
          <View style={styles.heroCard}>
            <View style={styles.heroIconBadge}>
              <Text style={styles.heroIconText}>📦</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroTitle} testID="donation-field-itemType">
                {donation.itemType}
              </Text>
              <View style={styles.quantityPill}>
                <Text style={styles.quantityPillText} testID="donation-field-quantity">
                  {donation.quantity} {donation.quantity === 1 ? 'item doado' : 'itens doados'}
                </Text>
              </View>
            </View>
          </View>

          {/* Seção com Todos os Campos da Doação */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Informações da Doação</Text>

            {/* Campo 1: Tipo do Item */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo do item:</Text>
              <Text style={styles.detailValue}>{donation.itemType}</Text>
            </View>

            {/* Campo 2: Quantidade */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quantidade:</Text>
              <Text style={styles.detailValue}>{donation.quantity} unidades</Text>
            </View>

            {/* Campo 3: Ponto de Coleta de Destino */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ponto de destino:</Text>
              <Text style={styles.detailValue} testID="donation-field-point">
                {pointName}
              </Text>
            </View>

            {/* Campo 4: Categoria do Ponto */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Categoria:</Text>
              <Text style={styles.detailValue}>{pointCategory}</Text>
            </View>

            {/* Campo 5: Endereço do Ponto */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Endereço:</Text>
              <Text style={styles.detailValue}>{pointAddress}</Text>
            </View>

            {/* Campo 6: Data do Registro formatada de forma legível */}
            <View style={[styles.detailRow, styles.lastRow]}>
              <Text style={styles.detailLabel}>Data e horário:</Text>
              <Text style={styles.detailValue} testID="donation-field-date">
                {dataFormatada}
              </Text>
            </View>
          </View>


          {/* Área de Ações: Botão Excluir */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleConfirmarExclusao}
              disabled={isDeleting}
              accessibilityRole="button"
              accessibilityLabel="Excluir doação"
              style={[styles.deleteButton, isDeleting && styles.buttonDisabled]}
              testID="button-delete-donation"
            >
              {isDeleting ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={theme.colors.white} />
                  <Text style={styles.deleteButtonText}>Excluindo...</Text>
                </View>
              ) : (
                <Text style={styles.deleteButtonText}>🗑️ Excluir doação</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleVoltar}
              disabled={isDeleting}
              accessibilityRole="button"
              accessibilityLabel="Voltar ao histórico"
              style={styles.cancelSecondaryButton}
            >
              <Text style={styles.cancelSecondaryButtonText}>Voltar ao histórico</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingRight: theme.spacing.lg,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textMain,
    flexShrink: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xxxl,
  },
  content: {
    width: theme.layout.contentWidth,
    maxWidth: theme.layout.contentMaxWidth,
    alignSelf: 'center',
    paddingTop: theme.spacing.lg,
  },
  heroCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.light,
  },
  heroIconBadge: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  heroIconText: {
    fontSize: 28,
  },
  heroInfo: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  quantityPill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.round,
  },
  quantityPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  sectionCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.light,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    width: 140,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textMain,
    flex: 1,
  },

  actionsContainer: {
    gap: theme.spacing.md,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.light,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  deleteButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelSecondaryButton: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  cancelSecondaryButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  primaryButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export const DetalheDoacaoScreen = DonationDetailScreen;
export default DonationDetailScreen;
