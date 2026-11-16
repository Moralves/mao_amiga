import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
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
import { listar } from '../services/pontosService';
import { cadastrar } from '../services/doacoesService';
import { theme } from '../styles/theme';

export interface DonationScreenCustomProps {
  point?: Ponto | null;
  onBack?: () => void;
  onSaved?: () => void;
}

export type DonationScreenProps = Partial<NativeStackScreenProps<RootStackParamList, 'Donation'>> &
  DonationScreenCustomProps;

export const DonationScreen: React.FC<DonationScreenProps> = ({
  route,
  navigation,
  point: initialPoint,
  onBack,
  onSaved,
}) => {
  const pontoInicial = route?.params?.ponto ?? initialPoint ?? null;
  const [selectedPointName, setSelectedPointName] = useState<string>(pontoInicial?.nome ?? '');
  const [availablePoints, setAvailablePoints] = useState<Ponto[]>([]);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [pointsError, setPointsError] = useState<string | null>(null);

  const [itemType, setItemType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [errors, setErrors] = useState({ itemType: '', quantity: '', point: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (pontoInicial?.nome) {
      setSelectedPointName(pontoInicial.nome);
    }
  }, [pontoInicial]);

  // Carrega os pontos da API (GET /api/v1/pontos) para escolha do destino
  const carregarPontosApi = useCallback(async () => {
    setLoadingPoints(true);
    setPointsError(null);
    try {
      const lista = await listar();
      setAvailablePoints(lista || []);
    } catch {
      setPointsError('Não foi possível carregar os pontos de destino da API.');
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

  const handleSave = async () => {
    if (saving) return;

    const nextErrors = {
      itemType: itemType.trim() ? '' : 'Informe o tipo do item.',
      quantity: !quantity
        ? 'Informe a quantidade.'
        : Number(quantity) <= 0
        ? 'Informe uma quantidade maior que zero.'
        : '',
      point: selectedPointName.trim() ? '' : 'Selecione o ponto de destino.',
    };

    setErrors(nextErrors);
    const isValid = !Object.values(nextErrors).some(Boolean);
    if (!isValid) {
      return;
    }

    Keyboard.dismiss();
    setSaveError('');
    setSaving(true);

    try {
      await cadastrar({
        tipoItem: itemType.trim(),
        quantidade: Number(quantity),
        pontoDestino: selectedPointName.trim(),
      });

      if (onSaved) {
        onSaved();
      } else if (navigation?.navigate) {
        const returnScreen = route?.params?.returnScreen;
        if (returnScreen === 'MyDonations' && navigation.goBack) {
          navigation.goBack();
        } else {
          navigation.navigate('MyDonations');
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar na API';
      setSaveError(
        `Não foi possível registrar a doação (${msg}). Verifique os dados ou se a API está ligada.`
      );
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
              Preencha os dados abaixo para registrar a doação na API:
            </Text>

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

            {/* Ponto de destino escolhido entre os pontos da API (GET /api/v1/pontos) com um TouchableOpacity por ponto */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Ponto de Destino *</Text>
              {loadingPoints ? (
                <View style={styles.pointsStateBox}>
                  <ActivityIndicator size="small" color={theme.colors.primaryDark} />
                  <Text style={styles.pointsStateText}>Carregando pontos da API...</Text>
                </View>
              ) : pointsError ? (
                <View style={styles.pointsStateBox}>
                  <Text style={styles.errorText}>{pointsError}</Text>
                  <TouchableOpacity style={styles.retryPointsButton} onPress={carregarPontosApi}>
                    <Text style={styles.retryPointsText}>Tentar novamente</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.pointsOptionsList}>
                  {availablePoints.map((ponto) => {
                    const isSelected = selectedPointName === ponto.nome;
                    return (
                      <TouchableOpacity
                        key={ponto.id}
                        activeOpacity={0.75}
                        onPress={() => {
                          setSelectedPointName(ponto.nome);
                          setErrors((current) => ({ ...current, point: '' }));
                          setSaveError('');
                        }}
                        style={[
                          styles.pointOptionButton,
                          isSelected && styles.pointOptionButtonSelected,
                          !!errors.point && !selectedPointName && styles.inputError,
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                      >
                        <View style={styles.pointOptionHeader}>
                          <Text
                            style={[
                              styles.pointOptionName,
                              isSelected && styles.pointOptionNameSelected,
                            ]}
                          >
                            {ponto.nome}
                          </Text>
                          <Text
                            style={[
                              styles.pointOptionType,
                              isSelected && styles.pointOptionTypeSelected,
                            ]}
                          >
                            {ponto.tipo}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.pointOptionBairro,
                            isSelected && styles.pointOptionBairroSelected,
                          ]}
                        >
                          📍 {ponto.bairro} — {ponto.horario}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              {!!errors.point && <Text style={styles.errorText}>{errors.point}</Text>}
            </View>

            {!!saveError && (
              <View style={styles.apiErrorBanner} accessibilityRole="alert">
                <Text style={styles.apiErrorText}>{saveError}</Text>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.validateButton}
              onPress={handleSave}
              disabled={saving}
              accessibilityRole="button"
              accessibilityState={{ disabled: saving }}
            >
              <Text style={styles.validateButtonText}>
                {saving ? 'Salvando...' : 'Salvar doação'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    width: theme.layout.contentWidth,
    maxWidth: theme.layout.contentMaxWidth,
    alignSelf: 'center',
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
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
  pointsStateBox: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  pointsStateText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  retryPointsButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  retryPointsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pointsOptionsList: {
    gap: theme.spacing.sm,
  },
  pointOptionButton: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  pointOptionButtonSelected: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  pointOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pointOptionName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textMain,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  pointOptionNameSelected: {
    color: '#FFFFFF',
  },
  pointOptionType: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    textTransform: 'uppercase',
  },
  pointOptionTypeSelected: {
    color: theme.colors.primaryLight,
  },
  pointOptionBairro: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  pointOptionBairroSelected: {
    color: '#E2E8F0',
  },
  apiErrorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  apiErrorText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '600',
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
});
