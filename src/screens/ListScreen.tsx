import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockCollectionPoints, categories } from '../data/mockPoints';
import { PointCard } from '../components/PointCard';
import { CollectionPoint } from '../types/types';
import { theme } from '../styles/theme';

interface ListScreenProps {
  onSelectPoint: (point: CollectionPoint) => void;
}

export const ListScreen: React.FC<ListScreenProps> = ({ onSelectPoint }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Filter logic: simple, efficient, and responsive
  const filteredPoints = useMemo(() => {
    return mockCollectionPoints.filter((point) => {
      // 1. Filter by category if one is active
      const matchesCategory =
        selectedCategory === 'Todos' || point.category === selectedCategory;

      // 2. Filter by search query text (name, description, or materials)
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        point.name.toLowerCase().includes(query) ||
        point.shortDescription.toLowerCase().includes(query) ||
        point.category.toLowerCase().includes(query) ||
        point.acceptedMaterials.some((material) =>
          material.toLowerCase().includes(query)
        );

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Render a single category filter tab
  const renderCategoryItem = ({ item }: { item: string }) => {
    const isSelected = selectedCategory === item;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setSelectedCategory(item)}
        style={[
          styles.categoryPill,
          isSelected && styles.categoryPillSelected,
        ]}
      >
        <Text
          style={[
            styles.categoryPillText,
            isSelected && styles.categoryPillTextSelected,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.container}>
        {/* App Header */}
        <View style={styles.header}>
          <Text style={styles.logoTitle}>Mão Amiga</Text>
          <Text style={styles.logoSubtitle}>Encontre pontos de descarte e coleta seletiva</Text>
        </View>

        {/* Search Filter input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquise por nome, material (ex: pilhas)..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Categories horizontal filter list */}
        <View style={styles.categoriesWrapper}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Collection points flatlist */}
        <FlatList
          data={filteredPoints}
          keyExtractor={(item) => item.id}
          style={styles.pointsList}
          renderItem={({ item }) => (
            <PointCard point={item} onPress={() => onSelectPoint(item)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Nenhum ponto encontrado</Text>
              <Text style={styles.emptySubtitle}>
                Tente ajustar os termos de pesquisa ou selecione outra categoria de filtro.
              </Text>
              {(searchQuery !== '' || selectedCategory !== 'Todos') && (
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('Todos');
                  }}
                >
                  <Text style={styles.resetButtonText}>Limpar Filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    width: theme.layout.contentWidth,
    maxWidth: theme.layout.contentMaxWidth,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.primaryDark,
    letterSpacing: -0.5,
  },
  logoSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  searchContainer: {
    width: theme.layout.contentWidth,
    maxWidth: theme.layout.contentMaxWidth,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 52,
    marginBottom: theme.spacing.md,
    ...theme.shadows.light,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textMain,
    height: '100%',
  },
  clearButton: {
    marginLeft: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  categoriesWrapper: {
    width: theme.layout.contentWidth,
    maxWidth: theme.layout.contentMaxWidth,
    marginBottom: theme.spacing.lg,
  },
  categoriesList: {
    paddingHorizontal: theme.spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.cardBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  categoryPillSelected: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  categoryPillTextSelected: {
    color: theme.colors.white,
  },
  listContent: {
    width: '100%',
    paddingBottom: theme.spacing.xxl,
  },
  pointsList: {
    width: theme.layout.contentWidth,
    maxWidth: theme.layout.contentMaxWidth,
    flex: 1,
    minWidth: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  resetButton: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
});
