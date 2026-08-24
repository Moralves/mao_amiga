import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { CollectionPoint } from '../types/types';
import { theme } from '../styles/theme';

interface DetailScreenProps {
  point: CollectionPoint;
  onBack: () => void;
}

export const DetailScreen: React.FC<DetailScreenProps> = ({ point, onBack }) => {
  const handleCall = () => {
    const cleanPhone = point.phone.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Erro', 'Não foi possível iniciar a ligação neste dispositivo.');
    });
  };

  const handleRoute = () => {
    const query = encodeURIComponent(point.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o aplicativo de mapas.');
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.cardBg} />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerCategory}>{point.category}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{point.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.ratingText}>{point.rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}> (Ponto Verificado)</Text>
          </View>
        </View>

        {/* Detailed Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre o Ponto</Text>
          <Text style={styles.descriptionText}>{point.description}</Text>
        </View>

        {/* Info Grid (Address, Hours, Phone) */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Endereço</Text>
              <Text style={styles.infoValue}>{point.address}</Text>
            </View>
          </View>

          <View style={styles.infoRowSeparator} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⏰</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Horário de Funcionamento</Text>
              <Text style={styles.infoValue}>{point.hours}</Text>
            </View>
          </View>

          <View style={styles.infoRowSeparator} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📞</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Telefone / Contato</Text>
              <Text style={styles.infoValue}>{point.phone}</Text>
            </View>
          </View>
        </View>

        {/* Accepted Materials Badges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materiais Aceitos</Text>
          <View style={styles.materialsContainer}>
            {point.acceptedMaterials.map((material, index) => (
              <View key={index} style={styles.materialTag}>
                <Text style={styles.materialTagText}>{material}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleRoute}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Como Chegar (Mapas)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCall}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Ligar para o Ponto</Text>
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
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  headerCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  titleSection: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textMain,
    lineHeight: 34,
    marginBottom: theme.spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: theme.colors.ratingActive,
    fontSize: 18,
    marginRight: theme.spacing.xs,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  ratingCount: {
    fontSize: 14,
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.sm,
  },
  descriptionText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.light,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  infoRowSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: theme.spacing.xs,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  materialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  materialTag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    margin: theme.spacing.xs,
  },
  materialTagText: {
    color: theme.colors.primaryText,
    fontSize: 13,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.borderRadius.md,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.light,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
});
