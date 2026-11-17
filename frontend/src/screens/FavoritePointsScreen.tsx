import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ponto } from '../types/ponto';
import { ApiError } from '../services/api';
import { buscarPorId } from '../services/pontosService';
import { listarFavoritos, removerFavorito } from '../services/favoritosStorage';
import { PointCard } from '../components/PointCard';
import { theme } from '../styles/theme';

export type FavoritePointsScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'FavoritePoints'>
>;

export const FavoritePointsScreen: React.FC<FavoritePointsScreenProps> = ({
  navigation,
}) => {
  const [pontosFavoritos, setPontosFavoritos] = useState<Ponto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const carregarFavoritos = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const ids = await listarFavoritos();
      if (ids.length === 0) {
        setPontosFavoritos([]);
        setLoading(false);
        return;
      }

      const promessas = ids.map(async (id) => {
        try {
          return await buscarPorId(id);
        } catch (err) {
          // Ponto excluído no servidor (404) fica de fora sem quebrar a tela
          if (err instanceof ApiError && err.status === 404) {
            return null;
          }
          throw err;
        }
      });

      const resultados = await Promise.all(promessas);
      const encontrados = resultados.filter((item): item is Ponto => item !== null);
      setPontosFavoritos(encontrados);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha na comunicação com a API';
      setErrorMessage(
        `Não foi possível carregar seus pontos favoritos (${msg}). Verifique se a API está ligada.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarFavoritos();
  }, [carregarFavoritos]);

  useEffect(() => {
    if (!navigation?.addListener) return;
    const unsubscribe = navigation.addListener('focus', () => {
      carregarFavoritos();
    });
    return unsubscribe;
  }, [navigation, carregarFavoritos]);

  // Botão de desmarcar na própria tela "Meus pontos", que tira o ponto na hora e atualiza o AsyncStorage
  const handleDesmarcarFavorito = async (point: Ponto) => {
    setPontosFavoritos((atuais) => atuais.filter((item) => item.id !== point.id));
    await removerFavorito(point.id);
  };

  const handleSelectPoint = (point: Ponto) => {
    if (navigation?.navigate) {
      navigation.navigate('Detail', { id: point.id });
    }
  };

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBg} />

      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus pontos</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Meus pontos</Text>
          <Text style={styles.subtitle}>
            Pontos favoritados neste aparelho e consultados pelo ID na API.
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primaryDark} />
            <Text style={styles.loadingText}>Carregando pontos favoritos...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Erro ao carregar favoritos</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={carregarFavoritos}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={pontosFavoritos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <PointCard
                point={item}
                isFavorite={true}
                onToggleFavorite={handleDesmarcarFavorito}
                onPress={() => handleSelectPoint(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>♡</Text>
                <Text style={styles.emptyTitle}>Nenhum ponto favorito</Text>
                <Text style={styles.emptySubtitle}>
                  Toque no coração (♡) em qualquer ponto da lista para salvá-lo aqui.
                </Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleBack}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>Ver lista de pontos</Text>
                </TouchableOpacity>
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
    marginRight: theme.spacing.md,
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
  listContent: {
    paddingBottom: theme.spacing.xxl,
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
  errorText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyIcon: {
    fontSize: 48,
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
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
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
