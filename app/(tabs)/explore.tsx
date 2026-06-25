import { MainTabBackground } from '@/components/ui/main-tab-background';
import { Colors, fontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFoodStore } from '@/store/foodStore';
import { Recipe, useProductStore } from '@/store/productStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const CATEGORIES: { key: string; label: string; color: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: 'all', label: 'Все', color: '#53B175', icon: 'restaurant' },
  { key: 'breakfast', label: 'Завтрак', color: '#F8A44C', icon: 'free-breakfast' },
  { key: 'lunch', label: 'Обед', color: '#F7A593', icon: 'lunch-dining' },
  { key: 'dinner', label: 'Ужин', color: '#D3B0E0', icon: 'dinner-dining' },
  { key: 'high_protein', label: 'Больше белка', color: '#53B175', icon: 'fitness-center' },
  { key: 'high_carb', label: 'Больше углеводов', color: '#F8A44C', icon: 'bolt' },
  { key: 'high_fat', label: 'Больше жира', color: '#F7A593', icon: 'water-drop' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { products, favoriteIds, recipes, toggleFavorite, removeRecipe, getRecipeMacros, load: loadProducts } = useProductStore();
  const { addFoodEntry } = useFoodStore();
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const favoriteProducts = useMemo(() => products.filter((p) => favoriteIds.includes(p.id)), [products, favoriteIds]);
  const userRecipes = useMemo(() => recipes.filter((r) => r.isUserRecipe), [recipes]);
  const readyRecipes = useMemo(() => recipes.filter((r) => !r.isUserRecipe), [recipes]);
  const filteredReady = selectedCategory === 'all' ? readyRecipes : readyRecipes.filter((r) => r.category === selectedCategory);

  const handleAddRecipeToDiary = (recipe: Recipe) => {
    const macros = getRecipeMacros(recipe.id);
    if (!macros) return;
    addFoodEntry({
      mealType: 'Завтрак',
      name: recipe.name,
      calories: macros.calories,
      proteins: macros.proteins,
      fats: macros.fats,
      carbs: macros.carbs,
    });
  };

  return (
    <MainTabBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>Рецепты</Text>
          <TouchableOpacity style={[styles.createBtn, { backgroundColor: '#53B175' }]} onPress={() => router.push('/create-recipe')} activeOpacity={0.85}>
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={[styles.createBtnText, { color: '#fff' }]}>Создать</Text>
          </TouchableOpacity>
        </View>

        {/* Избранные продукты */}
        <View style={[styles.sectionCard, { backgroundColor: '#FEF6E7', borderColor: '#F8A44C' }]}>
          <Text style={[styles.sectionTitle, { color: '#B87A2C' }]}>
            <MaterialIcons name="star" size={16} color="#F8A44C" /> Избранное
          </Text>
          {favoriteProducts.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.icon }]}>Нет избранных продуктов</Text>
          ) : (
            favoriteProducts.map((p) => (
              <View key={p.id} style={[styles.productItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: colors.text }]}>{p.name}</Text>
                  <Text style={[styles.productMacros, { color: colors.icon }]}>{p.caloriesPer100} ккал · Б {p.proteinsPer100} / Ж {p.fatsPer100} / У {p.carbsPer100}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(p.id)} activeOpacity={0.7}>
                  <MaterialIcons name="star" size={22} color="#F8A44C" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Рецепты пользователя */}
        <View style={[styles.sectionCard, { backgroundColor: '#EBF7EE', borderColor: '#53B175' }]}>
          <Text style={[styles.sectionTitle, { color: '#3D8C54' }]}>
            <MaterialIcons name="menu-book" size={16} color="#53B175" /> Мои рецепты
          </Text>
          {userRecipes.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.icon }]}>Нет своих рецептов</Text>
          ) : (
            userRecipes.map((r) => {
              const macros = getRecipeMacros(r.id);
              return (
                <View key={r.id} style={[styles.recipeItemRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.recipeItemContent}>
                    <Text style={[styles.recipeName, { color: colors.text }]}>{r.name}</Text>
                    {macros && <Text style={[styles.recipeMacros, { color: colors.icon }]}>~{macros.calories} ккал · Б {macros.proteins} / Ж {macros.fats} / У {macros.carbs}</Text>}
                  </View>
                  <View style={styles.recipeActions}>
                    <TouchableOpacity onPress={() => router.push('/create-recipe')} style={styles.actionBtn} activeOpacity={0.7}>
                      <MaterialIcons name="edit" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                      if (Platform.OS === 'web' ? window.confirm(`Удалить «${r.name}»?`) : true) {
                        removeRecipe(r.id);
                      }
                    }} style={styles.actionBtn} activeOpacity={0.7}>
                      <MaterialIcons name="close" size={20} color="#E53935" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Готовые рецепты с категориями */}
        <View style={[styles.sectionCard, { backgroundColor: '#F5EEFA', borderColor: '#D3B0E0' }]}>
          <Text style={[styles.sectionTitle, { color: '#9B6DB0' }]}>
            <MaterialIcons name="restaurant" size={16} color="#D3B0E0" /> Готовые рецепты
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryChip, selectedCategory === cat.key && { backgroundColor: cat.color }]}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.85}
              >
                <MaterialIcons name={cat.icon} size={16} color={selectedCategory === cat.key ? '#fff' : cat.color} />
                <Text style={[styles.categoryChipText, { color: selectedCategory === cat.key ? '#fff' : cat.color }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredReady.map((r) => {
            const macros = getRecipeMacros(r.id);
            return (
              <View key={r.id} style={[styles.recipeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.recipeCardContent}>
                  <Text style={[styles.recipeName, { color: colors.text }]}>{r.name}</Text>
                  {macros && <Text style={[styles.recipeMacros, { color: colors.icon }]}>~{macros.calories} ккал · Б {macros.proteins} / Ж {macros.fats} / У {macros.carbs}</Text>}
                </View>
                <TouchableOpacity style={[styles.addRecipeBtn, { backgroundColor: hexToRgba('#53B175', 0.12) }]} onPress={() => handleAddRecipeToDiary(r)} activeOpacity={0.85}>
                  <MaterialIcons name="add" size={18} color="#53B175" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </MainTabBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontFamily: fontFamily('bold'), fontSize: 24 },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5 },
  createBtnText: { fontFamily: fontFamily('semiBold'), fontSize: 13 },

  sectionCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 16 },
  sectionTitle: { fontFamily: fontFamily('semiBold'), fontSize: 15, marginBottom: 10 },
  emptyText: { fontFamily: fontFamily('regular'), fontSize: 13 },

  productItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 6 },
  productInfo: { flex: 1, marginRight: 8 },
  productName: { fontFamily: fontFamily('semiBold'), fontSize: 14 },
  productMacros: { fontFamily: fontFamily('regular'), fontSize: 11, marginTop: 2 },

  categoriesScroll: { marginBottom: 10 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, marginRight: 8, backgroundColor: 'rgba(0,0,0,0.04)' },
  categoryChipText: { fontFamily: fontFamily('medium'), fontSize: 12 },

  recipeCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  recipeCardContent: { flex: 1, marginRight: 8 },
  recipeName: { fontFamily: fontFamily('semiBold'), fontSize: 14, marginBottom: 2 },
  recipeMacros: { fontFamily: fontFamily('regular'), fontSize: 12 },
  addRecipeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  recipeItem: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 6 },
  recipeItemRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 6 },
  recipeItemContent: { flex: 1, marginRight: 8 },
  recipeActions: { flexDirection: 'row', gap: 6 },
  actionBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
});
