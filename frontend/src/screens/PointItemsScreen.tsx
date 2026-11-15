import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Doacao } from '../types/doacao';
import { Ponto } from '../types/ponto';
import { listarDoacoes } from '../services/doacoesStorage';
import { theme } from '../styles/theme';

export interface PointItemsScreenCustomProps {
  point?: Ponto | null;
  onBack?: () => void;
  onOpenDonation?: () => void;
  onSelectDonation?: (donation: Doacao) => void;
}

export type PointItemsScreenProps = Partial<
  NativeStackScreenProps<RootStackParamList, 'PointItems'>
> &
  PointItemsScreenCustomProps;

export const PointItemsScreen: React.FC<PointItemsScreenProps> = ({
  route,
  navigation,
  point,
  onBack,
  onOpenDonation,
  onSelectDonation,
}) => {
  const pontoId = route?.params?.pontoId ?? point?.id;
  const pontoNome = route?.params?.pontoNome ?? point?.nome ?? 'Ponto de Coleta';

  const [items, setItems] = useState<Doacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  const carregarItens = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const saved = await listarDoacoes();
      const filtrados = saved
        .filter(
          (item) =>
            item.pontoDestino === pontoNome ||
            (pontoId !== undefined && item.pontoDestino === String(pontoId))
        )
        .reverse();
      setItems(filtrados);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [pontoNome, pontoId]);

  useEffect(() => {
    carregarItens();
  }, [carregarItens, reloadCount]);

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
    } else if (navigation?.navigate) {
      navigation.navigate('Donation', {
        ponto: point ?? null,
        returnScreen: 'PointItems',
      });
    }
  };

  const handleSelectDonation = (donation: Doacao) => {
    if (onSelectDonation) {
      onSelectDonation(donation);
    } else if (navigation?.navigate) {
      navigation.navigate('DonationDetail', {
        doacao: donation,
        returnScreen: 'PointItems',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBg} />
      <View style={styles.header}>
        <Pressable onPress={handleBack} accessibilityRole="button" style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Itens do ponto</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Itens cadastrados</Text>
        <Text style={styles.subtitle}>{pontoNome}</Text>
        {loading ? (
          <ActivityIndicator
            color={theme.colors.primaryDark}
            accessibilityLabel="Carregando itens"
          />
        ) : error ? (
          <View style={styles.messageBox}>
            <Text style={styles.message}>
              Não foi possível carregar os itens salvos neste dispositivo.
            </Text>
            <Pressable
              onPress={() => setReloadCount((count) => count + 1)}
              accessibilityRole="button"
              style={styles.button}
            >
              <Text style={styles.buttonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelectDonation(item)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.itemCard, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.itemTitle}>{item.tipoItem}</Text>
                <Text style={styles.itemDetail}>Quantidade: {item.quantidade}</Text>
                <Text style={styles.itemDate}>
                  Cadastrado em {new Date(item.criadoEm).toLocaleString('pt-BR')}
                </Text>
                <Text style={styles.cardActionText}>
                  Toque para ver detalhes ou excluir →
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.messageBox}>
                <Text style={styles.message}>Nenhum item cadastrado neste ponto ainda.</Text>
              </View>
            }
          />
        )}
        {!loading && !error && (
          <Pressable onPress={handleOpenDonation} accessibilityRole="button" style={styles.button}>
            <Text style={styles.buttonText}>Cadastrar nova doação</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: { minHeight: 44, justifyContent: 'center', paddingRight: theme.spacing.lg },
  backText: { color: theme.colors.primaryDark, fontWeight: '700', fontSize: 15 },
  headerTitle: { color: theme.colors.textMain, fontWeight: '700', fontSize: 16 },
  content: {
    flex: 1,
    width: theme.layout.contentWidth,
    maxWidth: theme.layout.contentMaxWidth,
    alignSelf: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  title: { fontSize: 26, fontWeight: '800', color: theme.colors.textMain },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
  },
  listContent: { flexGrow: 1, paddingBottom: theme.spacing.lg },
  itemCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.light,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.sm,
  },
  itemDetail: { fontSize: 15, color: theme.colors.textSecondary },
  itemDate: { fontSize: 13, color: theme.colors.textMuted, marginTop: theme.spacing.sm },
  cardActionText: {
    fontSize: 12,
    color: theme.colors.primaryDark,
    marginTop: 6,
    fontWeight: '600',
  },
  messageBox: { alignItems: 'center', paddingVertical: theme.spacing.xxxl },
  message: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.borderRadius.md,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
