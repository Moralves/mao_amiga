import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { listarPontos } from '../services/pontosService';
import { PointCard } from '../components/PointCard';
import { theme } from '../styles/theme';

export interface ListScreenCustomProps {
  onSelectPoint?: (point: Ponto) => void;
  onOpenMyDonations?: () => void;
}

export type ListScreenProps = Partial<NativeStackScreenProps<RootStackParamList, 'List'>> &
  ListScreenCustomProps;

const FILTROS_TIPO = ['Todos', 'RECEBE', 'DISTRIBUI', 'AMBOS'];

export const ListScreen: React.FC<ListScreenProps> = ({
  navigation,
  onSelectPoint,
  onOpenMyDonations,
}) => {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('Todos');

  const carregarPontos = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await listarPontos({
        tipo: selectedTipo === 'Todos' ? undefined : selectedTipo,
      });
      setPontos(response.content || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar pontos';
      setErrorMessage(
        `Não foi possível carregar os pontos da API (${msg}). Verifique se o servidor Spring Boot está ligado.`
      );
    } finally {
      setLoading(false);
    }
  }, [selectedTipo]);

  useEffect(() => {
    carregarPontos();
  }, [carregarPontos]);

  const handleSelectPoint = (point: Ponto) => {
    if (onSelectPoint) {
      onSelectPoint(point);
    }
    if (navigation?.navigate) {
      navigation.navigate('Detail', { pontoId: point.id, ponto: point });
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

  const filteredPoints = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return pontos.filter((point) => {
      const matchesSearch =
        query === '' ||
        point.nome.toLowerCase().includes(query) ||
        point.endereco.toLowerCase().includes(query) ||
        point.bairro.toLowerCase().includes(query) ||
        point.itens.toLowerCase().includes(query) ||
        point.tipo.toLowerCase().includes(query) ||
        (point.descricao && point.descricao.toLowerCase().includes(query));

      return matchesSearch;
    });
  }, [pontos, searchQuery]);

  const renderTipoFilter = ({ item }: { item: string }) => {
    const isSelected = selectedTipo === item;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setSelectedTipo(item)}
        style={[styles.categoryPill, isSelected && styles.categoryPillSelected]}
      >
        <Text
          style={[styles.categoryPillText, isSelected && styles.categoryPillTextSelected]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.container}>
        {/* App Header */}
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

        {/* Search input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquise por nome, bairro, alimento..."
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

        {/* Categories/Types horizontal filter */}
        <View style={styles.categoriesWrapper}>
          <FlatList
            data={FILTROS_TIPO}
            renderItem={renderTipoFilter}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Content State: Loading, Error, or List */}
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
              onPress={carregarPontos}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredPoints}
            keyExtractor={(item) => String(item.id)}
            style={styles.pointsList}
            renderItem={({ item }) => (
              <PointCard point={item} onPress={() => handleSelectPoint(item)} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>Nenhum ponto encontrado</Text>
                <Text style={styles.emptySubtitle}>
                  Tente ajustar os termos de pesquisa ou selecione outro tipo de filtro.
                </Text>
                {(searchQuery !== '' || selectedTipo !== 'Todos') && (
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedTipo('Todos');
                    }}
                  >
                    <Text style={styles.resetButtonText}>Limpar Filtros</Text>
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
  categoriesWrapper: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  categoriesList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.cardBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryPillSelected: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  categoryPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
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
