import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { CollectionPoint } from '../types/types';

interface DonationScreenProps {
  point: CollectionPoint;
  onBack: () => void;
}

export const DonationScreen: React.FC<DonationScreenProps> = ({ point, onBack }) => {
  const insets = useSafeAreaInsets();
  const [itemType, setItemType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [errors, setErrors] = useState({ itemType: '', quantity: '' });
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (!validated) return;
    const timeout = setTimeout(() => setValidated(false), 3000);
    return () => clearTimeout(timeout);
  }, [validated]);

  const handleQuantityChange = (value: string) => {
    setValidated(false);
    if (value !== '' && !/^[0-9]+$/.test(value)) {
      setErrors((current) => ({ ...current, quantity: 'Digite apenas números na quantidade.' }));
      return;
    }

    setQuantity(value);
    setErrors((current) => ({ ...current, quantity: '' }));
  };

  const handleValidate = () => {
    const nextErrors = {
      itemType: itemType.trim() ? '' : 'Informe o tipo do item.',
      quantity: !quantity ? 'Informe a quantidade.' : Number(quantity) <= 0 ? 'Informe uma quantidade maior que zero.' : '',
    };
    const isValid = !Object.values(nextErrors).some(Boolean);
    setErrors(nextErrors);
    setValidated(isValid);
    if (isValid) Keyboard.dismiss();
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
        <Text style={styles.subtitle}>Preencha os dados do item para este ponto de coleta.</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Tipo do item</Text>
          <TextInput
            style={[styles.input, !!errors.itemType && styles.inputError]}
            value={itemType}
            onChangeText={(value) => {
              setItemType(value);
              setValidated(false);
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
          <View style={styles.pointOption} accessibilityLabel={`Ponto de destino: ${point.name}, ${point.address}`}>
            <View style={styles.pointText}>
              <Text style={styles.pointName}>{point.name}</Text>
              <Text style={styles.pointAddress}>{point.address}</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.validateButton} onPress={handleValidate} accessibilityRole="button">
          <Text style={styles.validateButtonText}>Validar formulário</Text>
        </Pressable>
      </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
      {validated && (
        <View
          style={[styles.toastPosition, { top: insets.top + theme.spacing.md }]}
          pointerEvents="none"
        >
          <View style={styles.successToast} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text style={styles.successToastIcon}>✓</Text>
            <Text style={styles.successToastText}>Dados validados com sucesso!</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: theme.colors.background },
  screenContent: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.cardBg,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md,
  },
  backButton: { minHeight: 44, justifyContent: 'center', paddingRight: theme.spacing.lg },
  backText: { color: theme.colors.primaryDark, fontWeight: '700', fontSize: 15 },
  headerTitle: { flexShrink: 1, color: theme.colors.textMain, fontWeight: '700', fontSize: 16 },
  scrollView: { flex: 1 },
  scrollContent: {
    width: theme.layout.contentWidth, maxWidth: theme.layout.contentMaxWidth,
    alignSelf: 'center', paddingVertical: theme.spacing.xl, paddingBottom: theme.spacing.xxxl,
  },
  title: { fontSize: 26, fontWeight: '800', color: theme.colors.textMain, marginBottom: theme.spacing.xs },
  subtitle: { fontSize: 15, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl, lineHeight: 21 },
  formCard: {
    backgroundColor: theme.colors.cardBg, borderRadius: theme.borderRadius.md,
    borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg,
    ...theme.shadows.light,
  },
  label: { fontSize: 15, fontWeight: '700', color: theme.colors.textMain, marginBottom: theme.spacing.sm },
  input: {
    minHeight: 50, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm, paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 15, color: theme.colors.textMain, marginBottom: theme.spacing.lg,
  },
  inputError: { borderColor: theme.colors.error, marginBottom: theme.spacing.xs },
  errorText: { color: theme.colors.error, fontSize: 13, marginBottom: theme.spacing.lg },
  pointOption: {
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm, backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  pointText: { flex: 1 },
  pointName: { fontSize: 14, fontWeight: '700', color: theme.colors.textMain },
  pointAddress: { fontSize: 12, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  validateButton: {
    backgroundColor: theme.colors.primaryDark, borderRadius: theme.borderRadius.md,
    minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg,
  },
  validateButtonText: { color: theme.colors.white, fontSize: 16, fontWeight: '700' },
  toastPosition: {
    position: 'absolute', left: theme.spacing.md, right: theme.spacing.md,
    alignItems: 'center', zIndex: 10, elevation: 10,
  },
  successToast: {
    width: '100%', maxWidth: theme.layout.contentMaxWidth,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.primaryText, borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  successToastIcon: {
    color: theme.colors.white, fontSize: 18, fontWeight: '700', marginRight: theme.spacing.md,
  },
  successToastText: {
    flex: 1, flexShrink: 1, color: theme.colors.white,
    fontSize: 15, fontWeight: '700', lineHeight: 21,
  },
});
