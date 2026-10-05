import React, { useEffect, useState } from 'react';
import {
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
import { theme } from '../styles/theme';
import { CollectionPoint } from '../types/types';
import { mockCollectionPoints } from '../data/mockPoints';
import { salvarDoacao } from '../data/doacoesStorage';

interface DonationScreenProps {
  point?: CollectionPoint | null;
  onBack: () => void;
  onSaved: () => void;
  onSelectPoint?: (point: CollectionPoint) => void;
}

export const DonationScreen: React.FC<DonationScreenProps> = ({
  point: initialPoint,
  onBack,
  onSaved,
  onSelectPoint,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(initialPoint ?? null);
  const [itemType, setItemType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [errors, setErrors] = useState({ itemType: '', quantity: '', point: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (initialPoint) {
      setSelectedPoint(initialPoint);
    }
  }, [initialPoint]);

  const handleQuantityChange = (value: string) => {
    setSaveError('');
    if (value !== '' && !/^[0-9]+$/.test(value)) {
      setErrors((current) => ({ ...current, quantity: 'Digite apenas números na quantidade.' }));
      return;
    }

    setQuantity(value);
    setErrors((current) => ({ ...current, quantity: '' }));
  };

  const handleSelectPointItem = (item: CollectionPoint) => {
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
      await salvarDoacao({ pointId: selectedPoint.id, itemType, quantity: Number(quantity) });
      onSaved();
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
        <KeyboardAvoidingView style={styles.screenContent} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <Pressable onPress={onBack} accessibilityRole="button" style={styles.backButton}>
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
            <Text style={styles.title}>Cadastrar doação</Text>
            <Text style={styles.subtitle}>
              Preencha os dados do item e confirme o ponto de coleta de destino.
            </Text>

            <View style={styles.formCard}>
              <Text style={styles.label}>Tipo do item</Text>
              <TextInput
                style={[styles.input, !!errors.itemType && styles.inputError]}
                value={itemType}
                onChangeText={(value) => {
                  setItemType(value);
                  setSaveError('');
                  if (errors.itemType) setErrors((current) => ({ ...current, itemType: '' }));
                }}
                placeholder="Ex.: alimentos não perecíveis"
                placeholderTextColor={theme.colors.textMuted}
                accessibilityLabel="Tipo do item"
                autoCapitalize="sentences"
              />
              {!!errors.itemType && <Text style={styles.errorText}>{errors.itemType}</Text>}

              <Text style={styles.label}>Quantidade</Text>
              <TextInput
                style={[styles.input, !!errors.quantity && styles.inputError]}
                value={quantity}
                onChangeText={handleQuantityChange}
                placeholder="Ex.: 10"
                placeholderTextColor={theme.colors.textMuted}
                accessibilityLabel="Quantidade"
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={9}
              />
              {!!errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}

              <Text style={styles.label}>Ponto de destino</Text>
              {selectedPoint ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setModalVisible(true)}
                  style={[styles.pointOption, !!errors.point && styles.inputError]}
                  accessibilityRole="button"
                  accessibilityLabel={`Ponto de destino: ${selectedPoint.name}, ${selectedPoint.address}`}
                >
                  <View style={styles.pointText}>
                    <View style={styles.pointHeaderRow}>
                      <Text style={styles.pointName}>{selectedPoint.name}</Text>
                      <View style={styles.changeBadge}>
                        <Text style={styles.changeBadgeText}>Trocar ponto ▾</Text>
                      </View>
                    </View>
                    <Text style={styles.pointAddress}>{selectedPoint.address}</Text>
                    <View style={styles.pointCategoryTag}>
                      <Text style={styles.pointCategoryTagText}>{selectedPoint.category}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setModalVisible(true)}
                  style={[styles.pointSelectorEmpty, !!errors.point && styles.inputError]}
                  accessibilityRole="button"
                  accessibilityLabel="Selecionar ponto de destino"
                >
                  <View style={styles.pointSelectorEmptyContent}>
                    <Text style={styles.pointSelectorIcon}>📍</Text>
                    <View style={styles.pointSelectorTextWrapper}>
                      <Text style={styles.pointSelectorEmptyTitle}>Selecione o ponto de destino</Text>
                      <Text style={styles.pointSelectorEmptySubtitle}>
                        Toque para escolher entre os pontos de coleta disponíveis
                      </Text>
                    </View>
                    <Text style={styles.pointSelectorAction}>Escolher ▾</Text>
                  </View>
                </TouchableOpacity>
              )}
              {!!errors.point && <Text style={styles.errorText}>{errors.point}</Text>}
            </View>

            {!!saveError && <Text style={styles.errorText} accessibilityRole="alert">{saveError}</Text>}
            <Pressable
              style={styles.validateButton}
              onPress={handleSave}
              disabled={saving}
              accessibilityRole="button"
              accessibilityState={{ disabled: saving }}
            >
              <Text style={styles.validateButtonText}>{saving ? 'Salvando...' : 'Salvar doação'}</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Modal for selecting any collection point */}
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
                  Selecione para qual ponto a sua doação será destinada:
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

            <FlatList
              data={mockCollectionPoints}
              keyExtractor={(item) => item.id}
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
                    accessibilityLabel={`Selecionar ${item.name}`}
                  >
                    <View style={styles.modalPointHeader}>
                      <Text style={[styles.modalPointTitle, isSelected && styles.modalPointTitleSelected]}>
                        {item.name}
                      </Text>
                      <View style={[styles.modalBadge, isSelected && styles.modalBadgeSelected]}>
                        <Text style={[styles.modalBadgeText, isSelected && styles.modalBadgeTextSelected]}>
                          {item.category}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.modalPointAddress}>📍 {item.address}</Text>
                    <Text style={styles.modalPointHours}>⏰ {item.hours}</Text>
                    {isSelected && (
                      <View style={styles.selectedBanner}>
                        <Text style={styles.selectedBannerText}>✓ Ponto selecionado</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
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
  backButton: { minHeight: 44, justifyContent: 'center', paddingRight: theme.spacing.lg },
  backText: { color: theme.colors.primaryDark, fontWeight: '700', fontSize: 15 },
  headerTitle: { flexShrink: 1, color: theme.colors.textMain, fontWeight: '700', fontSize: 16 },
  scrollView: { flex: 1 },
  scrollContent: {
    width: theme.layout.contentWidth,
    maxWidth: theme.layout.contentMaxWidth,
    alignSelf: 'center',
    paddingVertical: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  title: { fontSize: 26, fontWeight: '800', color: theme.colors.textMain, marginBottom: theme.spacing.xs },
  subtitle: { fontSize: 15, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl, lineHeight: 21 },
  formCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    ...theme.shadows.light,
  },
  label: { fontSize: 15, fontWeight: '700', color: theme.colors.textMain, marginBottom: theme.spacing.sm },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 15,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.lg,
  },
  inputError: { borderColor: theme.colors.error, marginBottom: theme.spacing.xs },
  errorText: { color: theme.colors.error, fontSize: 13, marginBottom: theme.spacing.lg },
  pointOption: {
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: '#F8FAFC',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  pointText: { flex: 1 },
  pointHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pointName: { fontSize: 15, fontWeight: '700', color: theme.colors.textMain, flex: 1, marginRight: theme.spacing.sm },
  changeBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.round,
  },
  changeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  pointAddress: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  pointCategoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  pointCategoryTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  pointSelectorEmpty: {
    borderWidth: 1.5,
    borderColor: theme.colors.primaryDark,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.sm,
    backgroundColor: '#F0FDF4',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  pointSelectorEmptyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointSelectorIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  pointSelectorTextWrapper: {
    flex: 1,
  },
  pointSelectorEmptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  pointSelectorEmptySubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  pointSelectorAction: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.round,
    overflow: 'hidden',
  },
  validateButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.borderRadius.md,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  validateButtonText: { color: theme.colors.white, fontSize: 16, fontWeight: '700' },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  modalContainer: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: 560,
    maxHeight: '85%',
    padding: theme.spacing.lg,
    ...theme.shadows.dark,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  modalHeaderTextWrapper: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  modalTitle: {
    fontSize: 19,
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
    borderRadius: theme.borderRadius.sm,
  },
  modalCloseText: {
    fontSize: 20,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  modalListContent: {
    paddingVertical: theme.spacing.xs,
  },
  modalPointCard: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  modalPointCardSelected: {
    borderColor: theme.colors.primaryDark,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
  },
  modalPointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalPointTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textMain,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  modalPointTitleSelected: {
    color: theme.colors.primaryDark,
  },
  modalBadge: {
    backgroundColor: theme.colors.cardBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.round,
  },
  modalBadgeSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primaryDark,
  },
  modalBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  modalBadgeTextSelected: {
    color: theme.colors.primaryDark,
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
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  selectedBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
});

export default DonationScreen;
