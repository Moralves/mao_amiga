import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ponto } from '../types/ponto';
import { cadastrar, editar } from '../services/pontosService';
import { theme } from '../styles/theme';

export interface PointFormCustomProps {
  ponto?: Ponto;
  onBack?: () => void;
  onSaved?: (ponto: Ponto) => void;
}

export type PointFormScreenProps = Partial<NativeStackScreenProps<RootStackParamList, 'PointForm'>> &
  PointFormCustomProps;

const TIPOS_PONTO = ['coleta', 'distribuição'] as const;

export const PointFormScreen: React.FC<PointFormScreenProps> = ({
  route,
  navigation,
  ponto: propPonto,
  onBack,
  onSaved,
}) => {
  const pontoEdicao = route?.params?.ponto ?? propPonto;
  const isEditing = Boolean(pontoEdicao?.id);

  const [nome, setNome] = useState(pontoEdicao?.nome ?? '');
  const [endereco, setEndereco] = useState(pontoEdicao?.endereco ?? '');
  const [bairro, setBairro] = useState(pontoEdicao?.bairro ?? '');
  const [horario, setHorario] = useState(pontoEdicao?.horario ?? '');
  const [tipo, setTipo] = useState<string>(pontoEdicao?.tipo ?? '');

  const [errors, setErrors] = useState({
    nome: '',
    endereco: '',
    bairro: '',
    horario: '',
    tipo: '',
  });
  const [saving, setSaving] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const validarCampos = (): boolean => {
    const novosErros = {
      nome: nome.trim() ? '' : 'Informe o nome do ponto.',
      endereco: endereco.trim() ? '' : 'Informe o endereço.',
      bairro: bairro.trim() ? '' : 'Informe o bairro.',
      horario: horario.trim() ? '' : 'Informe o horário de funcionamento.',
      tipo: tipo.trim() ? '' : 'Escolha o tipo entre coleta e distribuição.',
    };

    setErrors(novosErros);
    return !Object.values(novosErros).some(Boolean);
  };

  const handleSubmit = async () => {
    if (saving) return;

    setApiErrorMessage(null);
    if (!validarCampos()) {
      return;
    }

    Keyboard.dismiss();
    setSaving(true);

    const payload = {
      nome: nome.trim(),
      endereco: endereco.trim(),
      bairro: bairro.trim(),
      horario: horario.trim(),
      tipo: tipo.trim(),
    };

    try {
      const resultado =
        isEditing && pontoEdicao
          ? await editar(pontoEdicao.id, payload)
          : await cadastrar(payload);

      if (onSaved) {
        onSaved(resultado);
      } else if (navigation?.goBack) {
        navigation.goBack();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha na comunicação com o servidor';
      setApiErrorMessage(
        `Não foi possível salvar o ponto (${msg}). Verifique os dados ou se a API está ligada.`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBg} />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar ponto' : 'Novo ponto'}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            {isEditing ? 'Editar Ponto' : 'Cadastrar Ponto'}
          </Text>
          <Text style={styles.subtitle}>
            Preencha todos os campos obrigatórios abaixo:
          </Text>

          {/* Nome */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nome *</Text>
            <TextInput
              style={[styles.input, !!errors.nome && styles.inputError]}
              placeholder="Ex: Ponto de Coleta Campinas"
              placeholderTextColor={theme.colors.textMuted}
              value={nome}
              onChangeText={(text) => {
                setNome(text);
                setErrors((prev) => ({ ...prev, nome: '' }));
                setApiErrorMessage(null);
              }}
            />
            {!!errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
          </View>

          {/* Endereço */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Endereço *</Text>
            <TextInput
              style={[styles.input, !!errors.endereco && styles.inputError]}
              placeholder="Ex: Praça Joaquim Lúcio, s/n - Setor Campinas"
              placeholderTextColor={theme.colors.textMuted}
              value={endereco}
              onChangeText={(text) => {
                setEndereco(text);
                setErrors((prev) => ({ ...prev, endereco: '' }));
                setApiErrorMessage(null);
              }}
            />
            {!!errors.endereco && <Text style={styles.errorText}>{errors.endereco}</Text>}
          </View>

          {/* Bairro */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Bairro *</Text>
            <TextInput
              style={[styles.input, !!errors.bairro && styles.inputError]}
              placeholder="Ex: Setor Campinas"
              placeholderTextColor={theme.colors.textMuted}
              value={bairro}
              onChangeText={(text) => {
                setBairro(text);
                setErrors((prev) => ({ ...prev, bairro: '' }));
                setApiErrorMessage(null);
              }}
            />
            {!!errors.bairro && <Text style={styles.errorText}>{errors.bairro}</Text>}
          </View>

          {/* Horário */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Horário *</Text>
            <TextInput
              style={[styles.input, !!errors.horario && styles.inputError]}
              placeholder="Ex: Seg a Sex, 8h às 17h"
              placeholderTextColor={theme.colors.textMuted}
              value={horario}
              onChangeText={(text) => {
                setHorario(text);
                setErrors((prev) => ({ ...prev, horario: '' }));
                setApiErrorMessage(null);
              }}
            />
            {!!errors.horario && <Text style={styles.errorText}>{errors.horario}</Text>}
          </View>

          {/* Tipo: escolha entre "coleta" e "distribuição" (dois TouchableOpacity com o escolhido destacado) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Tipo *</Text>
            <View style={styles.tipoRow}>
              {TIPOS_PONTO.map((opcao) => {
                const selecionado = tipo.toLowerCase() === opcao;
                return (
                  <TouchableOpacity
                    key={opcao}
                    activeOpacity={0.8}
                    onPress={() => {
                      setTipo(opcao);
                      setErrors((prev) => ({ ...prev, tipo: '' }));
                      setApiErrorMessage(null);
                    }}
                    style={[
                      styles.tipoOption,
                      selecionado && styles.tipoOptionSelected,
                      !!errors.tipo && !selecionado && styles.inputError,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selecionado }}
                  >
                    <Text
                      style={[
                        styles.tipoOptionText,
                        selecionado && styles.tipoOptionTextSelected,
                      ]}
                    >
                      {opcao}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {!!errors.tipo && <Text style={styles.errorText}>{errors.tipo}</Text>}
          </View>

          {/* Mensagem de erro caso a API recuse (400) ou esteja desligada */}
          {!!apiErrorMessage && (
            <View style={styles.apiErrorBanner} accessibilityRole="alert">
              <Text style={styles.apiErrorText}>{apiErrorMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={saving}
            accessibilityRole="button"
          >
            <Text style={styles.submitButtonText}>
              {saving
                ? 'Salvando...'
                : isEditing
                ? 'Salvar alterações'
                : 'Cadastrar ponto'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardContainer: {
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
    marginRight: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
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
  scrollView: {
    flex: 1,
  },
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
  tipoRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  tipoOption: {
    flex: 1,
    minHeight: 48,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  tipoOptionSelected: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  tipoOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textMain,
    textTransform: 'capitalize',
  },
  tipoOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  apiErrorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  apiErrorText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 15,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
