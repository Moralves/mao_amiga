import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listarDoacoes } from '../data/doacoesStorage';
import { mockCollectionPoints } from '../data/mockPoints';
import { DonationCard } from '../components/DonationCard';
import { theme } from '../styles/theme';
import { DonationItem } from '../types/types';

interface MyDonationsScreenProps {
  onBack: () => void;
  onGoToCadastro: () => void;
}

export const MyDonationsScreen: React.FC<MyDonationsScreenProps> = ({
  onBack,
  onGoToCadastro,
}) => {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
  }, [carregarDoacoes]);

  const handleRefresh = () => {
    setRefreshing(true);
    carregarDoacoes();
  };

  const getPointName = (pointId: string): string => {
    const point = mockCollectionPoints.find((p) => p.id === pointId);
    return point ? point.name : 'Ponto de coleta';
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBg} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
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
            data={donations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DonationCard item={item} pointName={getPointName(item.pointId)} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primaryDark]}
                tintColor={theme.colors.primaryDark}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>Nenhuma doação registrada</Text>
                <Text style={styles.emptySubtitle}>
                  Você ainda não possui doações registradas neste dispositivo. Faça uma doação e ajude a comunidade!
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onGoToCadastro}
                  accessibilityRole="button"
                  accessibilityLabel="Cadastrar doação"
                  style={styles.emptyButton}
                >
                  <Text style={styles.emptyButtonText}>Cadastrar doação</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {!loading && !error && donations.length > 0 && (
          <View style={styles.footerContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onGoToCadastro}
              accessibilityRole="button"
              accessibilityLabel="Cadastrar nova doação"
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>+ Cadastrar nova doação</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    width: theme.layout.contentWidth,
    maxWidth: theme.layout.contentMaxWidth,
    alignSelf: 'center',
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  titleSection: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  emptyButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.light,
  },
  emptyButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  messageBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  message: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  footerContainer: {
    paddingVertical: theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.borderRadius.md,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.light,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MyDonationsScreen;
