import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ponto } from '../types/ponto';
import { ApiError } from '../services/api';
import { buscarPorId } from '../services/pontosService';
import { theme } from '../styles/theme';

export interface DetailScreenCustomProps {
  point?: Ponto | null;
  onBack?: () => void;
  onOpenDonation?: () => void;
  onOpenPointItems?: () => void;
}

export type DetailScreenProps = Partial<NativeStackScreenProps<RootStackParamList, 'Detail'>> &
  DetailScreenCustomProps;

export const DetailScreen: React.FC<DetailScreenProps> = ({
  route,
  navigation,
  point: initialPoint,
  onBack,
  onOpenDonation,
  onOpenPointItems,
}) => {
  const pontoId = route?.params?.id ?? initialPoint?.id;
  const [point, setPoint] = useState<Ponto | null>(initialPoint || null);
  const [loading, setLoading] = useState<boolean>(!!pontoId);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const carregarPonto = useCallback(async () => {
    if (!pontoId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setErrorMessage(null);
    try {
      const data = await buscarPorId(pontoId);
      setPoint(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        const msg = err instanceof Error ? err.message : 'Erro ao carregar detalhes';
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [pontoId]);

  useEffect(() => {
    carregarPonto();
  }, [carregarPonto]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleOpenDonation = () => {
    if (onOpenDonation) {
      onOpenDonation();
    } else if (navigation?.navigate && point) {
      navigation.navigate('Donation', { ponto: point, returnScreen: 'Detail' });
    }
  };

  const handleOpenPointItems = () => {
    if (onOpenPointItems) {
      onOpenPointItems();
    } else if (navigation?.navigate && point) {
      navigation.navigate('PointItems', { pontoId: point.id, pontoNome: point.nome });
    }
  };

  const handleRoute = () => {
    if (!point) return;
    const query = encodeURIComponent(point.endereco);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o aplicativo de mapas.');
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primaryDark} />
          <Text style={styles.loadingText}>Carregando detalhes do ponto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (notFound) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.notFoundIcon}>🔍</Text>
          <Text style={styles.notFoundTitle}>Ponto não encontrado</Text>
          <Text style={styles.notFoundSubtitle}>
            O ponto solicitado não existe ou foi removido (ponto não encontrado - 404).
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleBack} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Voltar para a lista</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage || !point) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.notFoundIcon}>⚠️</Text>
          <Text style={styles.notFoundTitle}>Erro ao buscar ponto</Text>
          <Text style={styles.notFoundSubtitle}>
            {errorMessage || 'Não foi possível carregar os dados.'}
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={carregarPonto}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBg} />

      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerCategory}>{point.tipo}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{point.nome}</Text>
          <Text style={styles.bairroSubtitle}>📍 {point.bairro}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Endereço</Text>
              <Text style={styles.infoValue}>{point.endereco}</Text>
            </View>
          </View>

          <View style={styles.infoRowSeparator} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⏰</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Horário de Funcionamento</Text>
              <Text style={styles.infoValue}>{point.horario}</Text>
            </View>
          </View>

          <View style={styles.infoRowSeparator} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🏷️</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Tipo do Ponto</Text>
              <Text style={styles.infoValue}>{point.tipo}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenPointItems}
            style={styles.secondaryButton}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Ver itens cadastrados neste ponto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenDonation}
            style={styles.primaryButton}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Cadastrar doação neste ponto</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={handleRoute} style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>Como Chegar (Mapas)</Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    paddingVertical: theme.spacing.xs,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  headerCategory: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  titleSection: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.xs,
  },
  bairroSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  infoCard: {
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.light,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: theme.colors.textMain,
    marginTop: 2,
    fontWeight: '500',
  },
  infoRowSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  actionContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
  },
  secondaryButtonText: {
    color: theme.colors.primaryDark,
    fontSize: 15,
    fontWeight: '700',
  },
  outlineButton: {
    backgroundColor: theme.colors.cardBg,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  outlineButtonText: {
    color: theme.colors.textMain,
    fontSize: 14,
    fontWeight: '600',
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
  },
  notFoundIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.sm,
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
    maxWidth: 300,
  },
});
