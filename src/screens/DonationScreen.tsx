import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
import { Ponto } from '../types/ponto';
import { listarPontos } from '../services/pontosService';
import { salvarDoacao } from '../services/doacoesStorage';
import { theme } from '../styles/theme';

export interface DonationScreenCustomProps {
  point?: Ponto | null;
  onBack?: () => void;
  onSaved?: () => void;
  onSelectPoint?: (point: Ponto) => void;
}

export type DonationScreenProps = Partial<NativeStackScreenProps<RootStackParamList, 'Donation'>> &
  DonationScreenCustomProps;

export const DonationScreen: React.FC<DonationScreenProps> = ({
  route,
  navigation,
  point: initialPoint,
  onBack,
  onSaved,
  onSelectPoint,
}) => {
  const pontoInicial = route?.params?.ponto ?? initialPoint ?? null;
  const [selectedPoint, setSelectedPoint] = useState<Ponto | null>(pontoInicial);
  const [availablePoints, setAvailablePoints] = useState<Ponto[]>([]);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [pointsError, setPointsError] = useState<string | null>(null);

  const [itemType, setItemType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [errors, setErrors] = useState({ itemType: '', quantity: '', point: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (pontoInicial) {
      setSelectedPoint(pontoInicial);
    }
  }, [pontoInicial]);

  // Carrega pontos da API para a seleção de destino
  const carregarPontosApi = useCallback(async () => {
    setLoadingPoints(true);
    setPointsError(null);
    try {
      const response = await listarPontos({ size: 50 });
      setAvailablePoints(response.content || []);
    } catch {
      setPointsError('Não foi possível obter a lista de pontos da API.');
    } finally {
      setLoadingPoints(false);
    }
  }, []);

  useEffect(() => {
    carregarPontosApi();
  }, [carregarPontosApi]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleQuantityChange = (value: string) => {
    setSaveError('');
    if (value !== '' && !/^[0-9]+$/.test(value)) {
      setErrors((current) => ({ ...current, quantity: 'Digite apenas números na quantidade.' }));
      return;
    }

    setQuantity(value);
    setErrors((current) => ({ ...current, quantity: '' }));
  };

  const handleSelectPointItem = (item: Ponto) => {
    setSelectedPoint(item);
    onSelectPoint?.(item);
    setErrors((current) => ({ ...current, point: '' }));
    setSaveError('');
    setModalVisible(false);
  };

  const handleSave = async () => {
    if (saving) return;
    const nextErrors = {
      itemType: itemType.trim() ? '' : 'Informe o tipo do item.',
      quantity: !quantity
        ? 'Informe a quantidade.'
        : Number(quantity) <= 0
        ? 'Informe uma quantidade maior que zero.'
        : '',
      point: selectedPoint ? '' : 'Selecione o ponto de destino.',
    };
    const isValid = !Object.values(nextErrors).some(Boolean);
    setErrors(nextErrors);
    if (!isValid) {
      if (!selectedPoint) {
        setModalVisible(true);
      }
      return;
    }

    if (!selectedPoint) return;

    Keyboard.dismiss();
    setSaveError('');
    setSaving(true);
    try {
      await salvarDoacao({
        tipoItem: itemType.trim(),
        quantidade: Number(quantity),
        pontoDestino: selectedPoint.nome,
      });

      if (onSaved) {
        onSaved();
      } else if (navigation?.navigate) {
        const returnScreen = route?.params?.returnScreen;
        if (returnScreen === 'MyDonations') {
          navigation.navigate('MyDonations');
        } else if (returnScreen === 'PointItems') {
          navigation.navigate('PointItems', {
            pontoId: selectedPoint.id,
            pontoNome: selectedPoint.nome,
          });
        } else {
          navigation.navigate('PointItems', {
            pontoId: selectedPoint.id,
            pontoNome: selectedPoint.nome,
          });
        }
      }
    } catch {
      setSaveError('Não foi possível salvar a doação neste dispositivo. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBg} />
      <SafeAreaView style={styles.screenContent}>
        <KeyboardAvoidingView
          style={styles.screenContent}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Pressable onPress={handleBack} accessibilityRole="button" style={styles.backButton}>
              <Text style={styles.backText}>← Voltar</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Nova doação</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <Text style={styles.title}>Registrar Doação</Text>
            <Text style={styles.subtitle}>
              Preencha os dados abaixo para registrar os mantimentos entregues:
            </Text>

            {/* Ponto de destino selector */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Ponto de Destino *</Text>
              <Pressable
                onPress={() => setModalVisible(true)}
                style={[styles.pointSelectorButton, !!errors.point && styles.inputError]}
                accessibilityRole="button"
                accessibilityLabel={
                  selectedPoint
                    ? `Ponto selecionado: ${selectedPoint.nome}. Toque para alterar.`
                    : 'Toque para escolher o ponto de destino da doação.'
                }
              >
                {selectedPoint ? (
                  <View style={styles.selectedPointContent}>
                    <View style={styles.selectedPointHeader}>
                      <Text style={styles.selectedPointName}>{selectedPoint.nome}</Text>
                      <View style={styles.selectedPointBadge}>
                        <Text style={styles.selectedPointBadgeText}>{selectedPoint.tipo}</Text>
                      </View>
                    </View>
                    <Text style={styles.selectedPointAddress}>📍 {selectedPoint.endereco}</Text>
                    <Text style={styles.changePointText}>Toque para alterar o ponto</Text>
                  </View>
                ) : (
                  <View style={styles.placeholderRow}>
                    <Text style={styles.selectorPlaceholder}>Selecione o ponto de destino...</Text>
                    <Text style={styles.selectorChevron}>▼</Text>
                  </View>
                )}
              </Pressable>
              {!!errors.point && <Text style={styles.errorText}>{errors.point}</Text>}
            </View>

            {/* Tipo do Item */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Tipo do Item *</Text>
              <TextInput
                style={[styles.input, !!errors.itemType && styles.inputError]}
                placeholder="Ex: Cesta Básica, Arroz, Feijão, Agasalho"
                placeholderTextColor={theme.colors.textMuted}
                value={itemType}
                onChangeText={(text) => {
                  setItemType(text);
                  setErrors((current) => ({ ...current, itemType: '' }));
                  setSaveError('');
                }}
              />
              {!!errors.itemType && <Text style={styles.errorText}>{errors.itemType}</Text>}
            </View>

            {/* Quantidade */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Quantidade (unidades) *</Text>
              <TextInput
                style={[styles.input, !!errors.quantity && styles.inputError]}
                placeholder="Ex: 5"
                placeholderTextColor={theme.colors.textMuted}
                value={quantity}
                onChangeText={handleQuantityChange}
                keyboardType="numeric"
              />
              {!!errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
            </View>

            {!!saveError && (
              <Text style={styles.errorText} accessibilityRole="alert">
                {saveError}
              </Text>
            )}

            <Pressable
              style={styles.validateButton}
              onPress={handleSave}
              disabled={saving}
              accessibilityRole="button"
              accessibilityState={{ disabled: saving }}
            >
              <Text style={styles.validateButtonText}>
                {saving ? 'Salvando...' : 'Salvar doação'}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Modal para seleção dos pontos vindos da API */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTextWrapper}>
                <Text style={styles.modalTitle}>Escolha o ponto de destino</Text>
                <Text style={styles.modalSubtitle}>
                  Selecione um ponto de coleta da API:
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Fechar seleção de pontos"
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingPoints ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primaryDark} />
                <Text style={styles.modalLoadingText}>Carregando pontos da API...</Text>
              </View>
            ) : pointsError ? (
              <View style={styles.modalLoadingContainer}>
                <Text style={styles.errorText}>{pointsError}</Text>
                <TouchableOpacity style={styles.modalRetryButton} onPress={carregarPontosApi}>
                  <Text style={styles.modalRetryButtonText}>Recarregar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={availablePoints}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalListContent}
                renderItem={({ item }) => {
                  const isSelected = selectedPoint?.id === item.id;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleSelectPointItem(item)}
                      style={[
                        styles.modalPointCard,
                        isSelected && styles.modalPointCardSelected,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Selecionar ${item.nome}`}
                    >
                      <View style={styles.modalPointHeader}>
                        <Text
                          style={[
                            styles.modalPointTitle,
                            isSelected && styles.modalPointTitleSelected,
                          ]}
                        >
                          {item.nome}
                        </Text>
                        <View
                          style={[styles.modalBadge, isSelected && styles.modalBadgeSelected]}
                        >
                          <Text
                            style={[
                              styles.modalBadgeText,
                              isSelected && styles.modalBadgeTextSelected,
                            ]}
                          >
                            {item.tipo}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.modalPointAddress}>📍 {item.endereco}</Text>
                      <Text style={styles.modalPointHours}>⏰ {item.horarioFuncionamento}</Text>
                      {isSelected && (
                        <View style={styles.selectedBanner}>
                          <Text style={styles.selectedBannerText}>✓ Ponto selecionado</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: theme.colors.background },
  screenContent: { flex: 1 },
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
    marginRight: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  backText: {
    fontSize: 16,
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  fieldContainer: {
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.textMain,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 4,
  },
  pointSelectorButton: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  placeholderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  selectorPlaceholder: {
    fontSize: 15,
    color: theme.colors.textMuted,
  },
  selectorChevron: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  selectedPointContent: {
    gap: 4,
  },
  selectedPointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedPointName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textMain,
    flex: 1,
    marginRight: 8,
  },
  selectedPointBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  selectedPointBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  selectedPointAddress: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  changePointText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    marginTop: 4,
  },
  validateButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 15,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  validateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.cardBg,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: '80%',
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  modalHeaderTextWrapper: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textMain,
  },
  modalSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  modalCloseButton: {
    padding: theme.spacing.xs,
  },
  modalCloseText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  modalLoadingContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  modalRetryButton: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.borderRadius.sm,
  },
  modalRetryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  modalListContent: {
    paddingBottom: theme.spacing.xl,
  },
  modalPointCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalPointCardSelected: {
    borderColor: theme.colors.primaryDark,
    backgroundColor: theme.colors.primaryLight,
  },
  modalPointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalPointTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textMain,
    flex: 1,
  },
  modalPointTitleSelected: {
    color: theme.colors.primaryDark,
  },
  modalBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  modalBadgeSelected: {
    backgroundColor: theme.colors.primaryDark,
  },
  modalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  modalBadgeTextSelected: {
    color: '#FFFFFF',
  },
  modalPointAddress: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  modalPointHours: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  selectedBanner: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.primaryDark,
  },
  selectedBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
});
