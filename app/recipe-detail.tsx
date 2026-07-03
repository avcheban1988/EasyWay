import { Colors, fontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFoodStore } from '@/store/foodStore';
import { useProductStore } from '@/store/productStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecipeDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { recipes, products, getRecipeMacros } = useProductStore();
  const { addFoodEntry } = useFoodStore();
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();

  const recipe = useMemo(() => recipes.find((r) => r.id === recipeId), [recipeId, recipes]);
  const macros = useMemo(() => (recipe ? getRecipeMacros(recipe.id) : null), [recipe, getRecipeMacros]);

  if (!recipe) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.icon }]}>Рецепт не найден</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={{ color: colors.primary }}>Назад</Text></TouchableOpacity>
      </View>
    );
  }

  const handleAddToDiary = () => {
    if (!macros) return;
    addFoodEntry({ mealType: 'Завтрак', name: recipe.name, calories: macros.calories, proteins: macros.proteins, fats: macros.fats, carbs: macros.carbs, grams: 100 });
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.text }]} numberOfLines={1}>{recipe.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {macros && (
          <View style={[styles.macroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.macroValue, { color: colors.primary }]}>{macros.calories} ккал</Text>
            <Text style={[styles.macroRow, { color: colors.icon }]}>
              Б {macros.proteins} г · Ж {macros.fats} г · У {macros.carbs} г
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ингредиенты</Text>
        {recipe.ingredients.map((ing, idx) => {
          const p = products.find((pr) => pr.id === ing.productId);
          return (
            <View key={idx} style={[styles.ingredientRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.ingrDot} />
              <Text style={[styles.ingrName, { color: colors.text }]}>{ing.productName}</Text>
              <Text style={[styles.ingrGrams, { color: colors.icon }]}>{ing.grams} г</Text>
            </View>
          );
        })}

        <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#53B175' }]} onPress={handleAddToDiary} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>Добавить в дневник</Text>
        </TouchableOpacity>

        {recipe.steps.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Приготовление</Text>
            {recipe.steps.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumText}>{idx + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  topTitle: { flex: 1, fontFamily: fontFamily('bold'), fontSize: 18, textAlign: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  errorText: { fontFamily: fontFamily('regular'), fontSize: 16, textAlign: 'center', marginTop: 40 },

  macroCard: { borderRadius: 14, borderWidth: 1, padding: 20, alignItems: 'center', marginBottom: 20 },
  macroValue: { fontFamily: fontFamily('extraBold'), fontSize: 36 },
  macroRow: { fontFamily: fontFamily('medium'), fontSize: 14, marginTop: 4 },

  sectionTitle: { fontFamily: fontFamily('semiBold'), fontSize: 17, marginBottom: 10, marginTop: 4 },

  ingredientRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 6 },
  ingrDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#53B175', marginRight: 10 },
  ingrName: { flex: 1, fontFamily: fontFamily('medium'), fontSize: 14 },
  ingrGrams: { fontFamily: fontFamily('semiBold'), fontSize: 13 },

  stepRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  stepNum: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginTop: 0 },
  stepNumText: { fontFamily: fontFamily('bold'), fontSize: 13, color: '#fff' },
  stepText: { flex: 1, fontFamily: fontFamily('regular'), fontSize: 14, lineHeight: 20 },
  addBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  addBtnText: { fontFamily: fontFamily('semiBold'), fontSize: 16, color: '#fff' },
});
