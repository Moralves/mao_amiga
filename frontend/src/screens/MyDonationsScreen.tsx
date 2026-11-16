import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Doacao } from '../types/doacao';
import { listarPagina } from '../services/doacoesService';
import { DonationCard } from '../components/DonationCard';
import { theme } from '../styles/theme';

export interface MyDonationsScreenCustomProps {
  onBack?: () => void;
  onGoToCadastro?: () => void;
  onSelectDonation?: (donation: Doacao) => void;
}

export type MyDonationsScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'MyDonations'>
> &
  MyDonationsScreenCustomProps;

const TAMANHO_PAGINA = 10;

export const MyDonationsScreen: React.FC<MyDonationsScreenProps> = ({
  navigation,
  onBack,
  onGoToCadastro,
  onSelectDonation,
}) => {
  const [donations, setDonations] = useState<Doacao[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const carregandoRef = useRef(false);
  const paginasCarregadasRef = useRef<Set<number>>(new Set());
  const requisicaoIdRef = useRef(0);
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  const carregarPagina = useCallback(
    async (paginaAlvo: number, termoBusca: string, substituir: boolean) => {
      if (!substituir) {
        if (carregandoRef.current || paginasCarregadasRef.current.has(paginaAlvo)) {
          return;
        }
      }

      const reqId = ++requisicaoIdRef.current;
      carregandoRef.current = true;

      if (substituir) {
        paginasCarregadasRef.current.clear();
        setLoading(true);
        setLoadingMore(false);
        setErrorMessage(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const resposta = await listarPagina(termoBusca, paginaAlvo, TAMANHO_PAGINA);
        if (reqId !== requisicaoIdRef.current) {
          return;
        }

        paginasCarregadasRef.current.add(paginaAlvo);
        setPage(resposta.page.number);
        setTotalPages(resposta.page.totalPages);

        if (substituir) {
          setDonations(resposta.content || []);
        } else {
          setDonations((anteriores) => {
            const idsExistentes = new Set(anteriores.map((item) => item.id));
            const novosItens = (resposta.content || []).filter(
              (item) => !idsExistentes.has(item.id)
            );
            return [...anteriores, ...novosItens];
          });
        }
      } catch (err) {
        if (reqId !== requisicaoIdRef.current) {
          return;
        }
        const msg = err instanceof Error ? err.message : 'Falha de conexão com a API';
        setErrorMessage(
          `Não foi possível carregar o histórico de doações (${msg}). Verifique se a API Spring Boot está ligada.`
        );
      } finally {
        if (reqId === requisicaoIdRef.current) {
          carregandoRef.current = false;
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    []
  );

  // Filtra pelo tipo de item na API sempre voltando para a primeira página
  useEffect(() => {
    carregarPagina(0, searchQuery, true);
  }, [searchQuery, carregarPagina]);

  // Recarrega ao voltar da tela de cadastro para exibir a doação nova no topo do histórico
  useEffect(() => {
    if (!navigation?.addListener) return;
    const unsubscribe = navigation.addListener('focus', () => {
      carregarPagina(0, searchQueryRef.current, true);
    });
    return unsubscribe;
  }, [navigation, carregarPagina]);

  const handleLoadMore = () => {
    if (loading || loadingMore || errorMessage) {
      return;
    }
    const proximaPagina = page + 1;
    if (proximaPagina >= totalPages) {
      return;
    }
    if (paginasCarregadasRef.current.has(proximaPagina)) {
      return;
    }
    carregarPagina(proximaPagina, searchQuery, false);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleGoToCadastro = () => {
    if (onGoToCadastro) {
      onGoToCadastro();
    } else if (navigation?.navigate) {
      navigation.navigate('Donation', { returnScreen: 'MyDonations' });
    }
  };

  const handleSelectDonation = (donation: Doacao) => {
    if (onSelectDonation) {
      onSelectDonation(donation);
    } else if (navigation?.navigate) {
      navigation.navigate('DonationDetail', {
        doacao: donation,
        returnScreen: 'MyDonations',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBg} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Minhas doações</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGoToCadastro}
            style={styles.newDonationHeaderButton}
            accessibilityRole="button"
          >
            <Text style={styles.newDonationHeaderText}>+ Nova doação</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Histórico de doações</Text>
            <Text style={styles.subtitle}>
              Registros consultados diretamente da API (da mais recente para a mais antiga).
            </Text>
          </View>

          {/* Filtro por tipo de item feito pela API */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Filtrar por tipo de item (ex.: cesta, arroz, roupa)..."
                placeholderTextColor={theme.colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Buscar doações por tipo"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchButton}
                  accessibilityRole="button"
                  accessibilityLabel="Limpar busca"
                >
                  <Text style={styles.clearSearchText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Estados: Carregando, Erro (API desligada) e Lista com Estado Vazio */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme.colors.primaryDark}
                accessibilityLabel="Carregando doações"
              />
              <Text style={styles.loadingText}>Carregando doações da API...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorTitle}>Erro ao conectar na API</Text>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
              <TouchableOpacity
                onPress={() => carregarPagina(0, searchQuery, true)}
                style={styles.primaryButton}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={donations}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              renderItem={({ item }) => (
                <DonationCard
                  donation={item}
                  pointName={item.pontoDestino}
                  onPress={() => handleSelectDonation(item)}
                />
              )}
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color={theme.colors.primaryDark} />
                    <Text style={styles.footerLoaderText}>Carregando mais doações...</Text>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer} testID="empty-donations-view">
                  <Text style={styles.emptyIcon}>📦</Text>
                  <Text style={styles.emptyTitle}>Nenhuma doação encontrada</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery.trim()
                      ? `Nenhuma doação do tipo "${searchQuery}" foi encontrada na API.`
                      : 'Ainda não há doações registradas no servidor.'}
                  </Text>
                  <TouchableOpacity
                    onPress={handleGoToCadastro}
                    style={styles.primaryButton}
                    accessibilityRole="button"
                  >
                    <Text style={styles.primaryButtonText}>Registrar uma doação</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  newDonationHeaderButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  newDonationHeaderText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    width: theme.layout.contentWidth,
    maxWidth: theme.layout.contentMaxWidth,
    alignSelf: 'center',
  },
  titleSection: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textMain,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  searchSection: {
    marginBottom: theme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.light,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: theme.colors.textMain,
  },
  clearSearchButton: {
    padding: theme.spacing.xs,
  },
  clearSearchText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorIcon: {
    fontSize: 44,
    marginBottom: theme.spacing.sm,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.xs,
  },
  errorMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  footerLoaderText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  primaryButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
});
