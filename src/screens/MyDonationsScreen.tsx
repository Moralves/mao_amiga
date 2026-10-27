import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
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
import { listarDoacoes } from '../services/doacoesStorage';
import { DonationCard } from '../components/DonationCard';
import { DonationSummary } from '../components/DonationSummary';
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

export const MyDonationsScreen: React.FC<MyDonationsScreenProps> = ({
  navigation,
  onBack,
  onGoToCadastro,
  onSelectDonation,
}) => {
  const [donations, setDonations] = useState<Doacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const carregarDoacoes = useCallback(async () => {
    try {
      setError(false);
      const lista = await listarDoacoes();
      const ordenadas = [...lista].sort(
        (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
      );
      setDonations(ordenadas);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarDoacoes();

    if (navigation?.addListener) {
      const unsubscribe = navigation.addListener('focus', carregarDoacoes);
      return unsubscribe;
    }
  }, [carregarDoacoes, navigation]);

  const handleRefresh = () => {
    setRefreshing(true);
    carregarDoacoes();
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

  // Filtra as doações pelo tipo de item enquanto o usuário digita
  const filteredDonations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return donations;
    }
    return donations.filter((donation) =>
      (donation.tipoItem || '').toLowerCase().includes(query)
    );
  }, [donations, searchQuery]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBg} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
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
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Minhas doações</Text>
            <Text style={styles.subtitle}>
              Histórico completo de doações salvas neste dispositivo.
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme.colors.primaryDark}
                accessibilityLabel="Carregando doações"
              />
            </View>
          ) : error ? (
            <View style={styles.messageBox}>
              <Text style={styles.message}>
                Não foi possível carregar o histórico de doações.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setLoading(true);
                  carregarDoacoes();
                }}
                style={styles.primaryButton}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredDonations}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              ListHeaderComponent={
                <View style={styles.listHeaderContainer}>
                  {/* Painel de Resumo Dinâmico */}
                  <DonationSummary donations={donations} />

                  {/* Campo de Busca por Tipo */}
                  {donations.length > 0 && (
                    <View style={styles.searchSection}>
                      <Text style={styles.searchSectionLabel}>Buscar por tipo de item</Text>
                      <View style={styles.searchBar}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                          style={styles.searchInput}
                          placeholder="Ex: roupa, alimento, cobertor..."
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
                  )}
                </View>
              }
              renderItem={({ item }) => (
                <DonationCard
                  donation={item}
                  pointName={item.pontoDestino}
                  onPress={() => handleSelectDonation(item)}
                />
              )}
              ListEmptyComponent={
                donations.length === 0 ? (
                  <View style={styles.emptyContainer} testID="empty-donations-view">
                    <Text style={styles.emptyIcon}>📦</Text>
                    <Text style={styles.emptyTitle}>Nenhuma doação cadastrada</Text>
                    <Text style={styles.emptyText}>
                      Você ainda não registrou doações. Suas contribuições salvas aparecerão aqui.
                    </Text>
                    <TouchableOpacity
                      onPress={handleGoToCadastro}
                      style={styles.primaryButton}
                      accessibilityRole="button"
                      accessibilityLabel="Registrar primeira doação"
                    >
                      <Text style={styles.primaryButtonText}>Registrar uma doação</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.emptyFilterContainer}>
                    <Text style={styles.emptyFilterIcon}>🔎</Text>
                    <Text style={styles.emptyFilterTitle}>Nenhuma doação encontrada</Text>
                    <Text style={styles.emptyFilterText}>
                      Nenhuma doação com o tipo &quot;{searchQuery}&quot; foi localizada.
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSearchQuery('')}
                      style={styles.clearFilterButton}
                      accessibilityRole="button"
                    >
                      <Text style={styles.clearFilterButtonText}>Limpar busca</Text>
                    </TouchableOpacity>
                  </View>
                )
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
  content: {
    flex: 1,
    width: theme.layout.contentWidth,
    maxWidth: theme.layout.contentMaxWidth,
    alignSelf: 'center',
  },
  titleSection: {
    paddingVertical: theme.spacing.md,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
  },
  listHeaderContainer: {
    marginBottom: theme.spacing.md,
  },
  searchSection: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  searchSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
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
    height: 44,
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
  primaryButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
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
    marginTop: theme.spacing.xl,
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
  emptyFilterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyFilterIcon: {
    fontSize: 36,
    marginBottom: theme.spacing.xs,
  },
  emptyFilterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  emptyFilterText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  clearFilterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.sm,
  },
  clearFilterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  messageBox: {
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  message: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
