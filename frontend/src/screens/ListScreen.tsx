import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ponto } from '../types/ponto';
import { buscarPagina } from '../services/pontosService';
import { PointCard } from '../components/PointCard';
import { theme } from '../styles/theme';

export interface ListScreenCustomProps {
  onSelectPoint?: (point: Ponto) => void;
  onOpenMyDonations?: () => void;
}

export type ListScreenProps = Partial<NativeStackScreenProps<RootStackParamList, 'List'>> &
  ListScreenCustomProps;

const TAMANHO_PAGINA = 10;

export const ListScreen: React.FC<ListScreenProps> = ({
  navigation,
  onSelectPoint,
  onOpenMyDonations,
}) => {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const carregandoRef = useRef(false);
  const paginasCarregadasRef = useRef<Set<number>>(new Set());
  const requisicaoIdRef = useRef(0);

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
        const resposta = await buscarPagina(termoBusca, paginaAlvo, TAMANHO_PAGINA);
        if (reqId !== requisicaoIdRef.current) {
          return;
        }

        paginasCarregadasRef.current.add(paginaAlvo);
        setPage(resposta.page.number);
        setTotalPages(resposta.page.totalPages);

        if (substituir) {
          setPontos(resposta.content || []);
        } else {
          setPontos((anteriores) => {
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
        const msg = err instanceof Error ? err.message : 'Erro ao conectar com a API';
        setErrorMessage(
          `Não foi possível carregar os pontos de coleta (${msg}). Verifique se a API Spring Boot está ligada.`
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

  // A cada alteração no campo de busca, filtra pela API voltando sempre para a primeira página (page = 0)
  useEffect(() => {
    carregarPagina(0, searchQuery, true);
  }, [searchQuery, carregarPagina]);

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

  const handleSelectPoint = (point: Ponto) => {
    if (onSelectPoint) {
      onSelectPoint(point);
    }
    if (navigation?.navigate) {
      navigation.navigate('Detail', { id: point.id });
    }
  };

  const handleOpenMyDonations = () => {
    if (onOpenMyDonations) {
      onOpenMyDonations();
    }
    if (navigation?.navigate) {
      navigation.navigate('MyDonations');
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerTitles}>
              <Text style={styles.logoTitle}>Mão Amiga</Text>
              <Text style={styles.logoSubtitle}>Encontre pontos de coleta e distribuição</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenMyDonations}
              style={styles.myDonationsButton}
              accessibilityRole="button"
              accessibilityLabel="Minhas doações"
            >
              <Text style={styles.myDonationsButtonText}>Minhas doações</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Campo de busca filtrando pela API */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquise por nome ou bairro..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Estado: Carregando primeira página, Erro (API desligada) ou Lista com Rolagem Infinita */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primaryDark} />
            <Text style={styles.loadingText}>Carregando pontos da API...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Não foi possível carregar os pontos</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => carregarPagina(0, searchQuery, true)}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={pontos}
            keyExtractor={(item) => item.id}
            style={styles.pointsList}
            renderItem={({ item }) => (
              <PointCard point={item} onPress={() => handleSelectPoint(item)} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={theme.colors.primaryDark} />
                  <Text style={styles.footerLoaderText}>Carregando mais pontos...</Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>Nenhum ponto encontrado</Text>
                <Text style={styles.emptySubtitle}>
                  Não encontramos pontos correspondentes à sua busca.
                </Text>
                {searchQuery !== '' && (
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => setSearchQuery('')}
                  >
                    <Text style={styles.resetButtonText}>Limpar busca</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    width: theme.layout.contentWidth,
    maxWidth: theme.layout.contentMaxWidth,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  headerTitles: {
    flex: 1,
    minWidth: 180,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.primaryDark,
    letterSpacing: -0.5,
  },
  logoSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  myDonationsButton: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
  },
  myDonationsButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  searchContainer: {
    width: theme.layout.contentWidth,
    maxWidth: theme.layout.contentMaxWidth,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    ...theme.shadows.light,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: theme.colors.textMain,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  clearButtonText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  pointsList: {
    width: '100%',
  },
  listContent: {
    width: theme.layout.contentWidth,
    maxWidth: theme.layout.contentMaxWidth,
    alignSelf: 'center',
    paddingBottom: theme.spacing.xl,
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    maxWidth: 400,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: 17,
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
  resetButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
  },
  resetButtonText: {
    fontSize: 13,
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
});
