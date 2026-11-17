import React, { useState, useEffect, useCallback } from 'react';
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Doacao } from '../types/doacao';
import { ApiError } from '../services/api';
import { buscarPorId, excluir } from '../services/doacoesService';
import { theme } from '../styles/theme';

export interface DonationDetailCustomProps {
  donation?: Doacao;
  onBack?: () => void;
  onDeleteSuccess?: () => void;
}

export type DonationDetailScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'DonationDetail'>
> &
  DonationDetailCustomProps;

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

export const DonationDetailScreen: React.FC<DonationDetailScreenProps> = ({
  route,
  navigation,
  donation: propDonation,
  onBack,
  onDeleteSuccess,
}) => {
  const doacaoId = route?.params?.id ?? propDonation?.id;
  const [donation, setDonation] = useState<Doacao | null>(propDonation || null);
  const [loading, setLoading] = useState<boolean>(!!doacaoId);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const carregarDoacao = useCallback(async () => {
    if (!doacaoId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setErrorMessage(null);
    try {
      const dados = await buscarPorId(doacaoId);
      setDonation(dados);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        const msg = err instanceof Error ? err.message : 'Erro ao carregar doação';
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [doacaoId]);

  useEffect(() => {
    carregarDoacao();
  }, [carregarDoacao]);

  // Recarrega os dados ao voltar da edição (PUT) para mostrar os valores novos mantendo id e data
  useEffect(() => {
    if (!navigation?.addListener) return;
    const unsubscribe = navigation.addListener('focus', () => {
      carregarDoacao();
    });
    return unsubscribe;
  }, [navigation, carregarDoacao]);

  const handleVoltar = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleEditar = () => {
    if (navigation?.navigate && donation) {
      navigation.navigate('Donation', {
        doacao: donation,
        returnScreen: 'DonationDetail',
      });
    }
  };

  const executarExclusao = async () => {
    if (!donation?.id || isDeleting) return;

    setActionError(null);
    setIsDeleting(true);
    try {
      await excluir(donation.id);

      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else if (navigation?.goBack) {
        navigation.goBack();
      } else if (onBack) {
        onBack();
      }
    } catch (err) {
      setIsDeleting(false);
      const msg = err instanceof Error ? err.message : 'Falha na comunicação com a API';
      const textoErro = `Não foi possível excluir esta doação (${msg}). Verifique se a API está ligada.`;
      setActionError(textoErro);
      Alert.alert('Erro ao excluir', textoErro);
    }
  };

  const handleConfirmarExclusao = () => {
    if (!donation?.id || isDeleting) return;

    Alert.alert(
      'Excluir doação',
      'Tem certeza de que deseja excluir esta doação do histórico?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: executarExclusao,
        },
      ]
    );

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      const confirmou = window.confirm(
        'Tem certeza de que deseja excluir esta doação do histórico?'
      );
      if (confirmou) {
        executarExclusao();
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBg} />
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primaryDark} />
          <Text style={styles.loadingText}>Carregando detalhes da doação...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (notFound) {
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
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Doação não encontrada</Text>
          <Text style={styles.emptySubtitle}>
            A doação solicitada não existe ou foi removida (doação não encontrada - 404).
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

  if (errorMessage || !donation) {
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
          <Text style={styles.emptyTitle}>Erro ao buscar doação</Text>
          <Text style={styles.emptySubtitle}>
            {errorMessage || 'Não foi possível carregar os dados desta doação.'}
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={carregarDoacao}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const dataFormatada = formatarDataLegivel(donation.criadoEm);

  return (
    <SafeAreaView style={styles.safeContainer} testID="donation-detail-screen">
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBg} />

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroIconBadge}>
              <Text style={styles.heroIconText}>📦</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroTitle} testID="donation-field-itemType">
                {donation.tipoItem}
              </Text>
              <View style={styles.quantityPill}>
                <Text style={styles.quantityPillText} testID="donation-field-quantity">
                  {donation.quantidade} {donation.quantidade === 1 ? 'item doado' : 'itens doados'}
                </Text>
              </View>
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Informações da Doação</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo do item:</Text>
              <Text style={styles.detailValue}>{donation.tipoItem}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quantidade:</Text>
              <Text style={styles.detailValue}>{donation.quantidade} unidades</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ponto de destino:</Text>
              <Text style={styles.detailValue} testID="donation-field-point">
                {donation.pontoDestino}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data e horário:</Text>
              <Text style={styles.detailValue} testID="donation-field-date">
                {dataFormatada}
              </Text>
            </View>

            <View style={[styles.detailRow, styles.lastRow]}>
              <Text style={styles.detailLabel}>Código do registro:</Text>
              <Text style={styles.detailCodeValue} testID="donation-field-id">
                {donation.id}
              </Text>
            </View>
          </View>

          {!!actionError && (
            <View style={styles.actionErrorBanner} accessibilityRole="alert">
              <Text style={styles.actionErrorText}>{actionError}</Text>
            </View>
          )}

          {/* Edit and Delete Actions */}
          <View style={styles.actionCard}>
            <Text style={styles.actionCardTitle}>Gerenciar Registro</Text>
            <Text style={styles.actionCardDescription}>
              Você pode atualizar os dados desta doação ou excluí-la permanentemente.
            </Text>

            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditar}
              accessibilityRole="button"
              accessibilityLabel="Editar doação"
            >
              <Text style={styles.editButtonText}>Editar doação</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleConfirmarExclusao}
              disabled={isDeleting}
              accessibilityRole="button"
              accessibilityLabel="Excluir doação"
              testID="button-delete-donation"
            >
              {isDeleting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>Excluir esta doação</Text>
              )}
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
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.md,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  content: {
    width: theme.layout.contentWidth,
    maxWidth: theme.layout.contentMaxWidth,
    alignSelf: 'center',
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  heroCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.light,
  },
  heroIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  heroIconText: {
    fontSize: 28,
  },
  heroInfo: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  quantityPill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
  },
  quantityPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  sectionCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    ...theme.shadows.light,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    alignItems: 'flex-start',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    width: 140,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textMain,
  },
  detailCodeValue: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actionErrorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  actionErrorText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '600',
  },
  actionCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.light,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  actionCardDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
  },
  editButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  primaryButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
