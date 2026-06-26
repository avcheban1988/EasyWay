import { Colors, fontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RecipeIngredient, useProductStore } from '@/store/productStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function CreateRecipeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { products, searchProducts, addRecipe } = useProductStore();

  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof products>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSearchResults(searchProducts(searchQuery)), 500);
    return () => clearTimeout(timerRef.current);
  }, [searchQuery, searchProducts]);

  const handleAddIngredient = (productId: string, productName: string) => {
    setIngredients((prev) => [...prev, { productId, productName, grams: 100 }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGramsChange = (index: number, val: string) => {
    const g = Number(val) || 0;
    setIngredients((prev) => prev.map((ing, i) => i === index ? { ...ing, grams: g } : ing));
  };

  const handleAddStep = () => setSteps((prev) => [...prev, '']);
  const handleStepChange = (index: number, val: string) => {
    setSteps((prev) => prev.map((s, i) => i === index ? val : s));
  };
  const handleRemoveStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim() || ingredients.length === 0) return;
    addRecipe({
      name: name.trim(),
      ingredients: ingredients.map((ing) => ({ ...ing, grams: ing.grams || 100 })),
      steps: steps.filter((s) => s.trim()),
      isUserRecipe: true,
    });
    router.back();
  };

  const canSave = name.trim().length > 0 && ingredients.length > 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, { color: colors.text }]}>Создать рецепт</Text>

      {/* Название */}
      <Text style={[styles.label, { color: colors.icon }]}>Название рецепта</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
        placeholder="Например: Овсяноблин"
        placeholderTextColor={colors.icon}
        value={name}
        onChangeText={setName}
      />

      {/* Ингредиенты */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Ингредиенты</Text>

      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <MaterialIcons name="search" size={20} color={colors.icon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Поиск продуктов..."
          placeholderTextColor={colors.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {searchResults.map((p) => (
        <TouchableOpacity key={p.id} style={[styles.resultItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => handleAddIngredient(p.id, p.name)} activeOpacity={0.85}>
          <Text style={[styles.resultName, { color: colors.text }]}>{p.name}</Text>
          <MaterialIcons name="add-circle-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      ))}

      {ingredients.map((ing, idx) => (
        <View key={idx} style={[styles.ingredientRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.ingredientName, { color: colors.text }]}>{ing.productName}</Text>
          <View style={styles.ingredientRight}>
            <TextInput
              style={[styles.gramsInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              keyboardType="numeric"
              value={ing.grams.toString()}
              onChangeText={(v) => handleGramsChange(idx, v)}
            />
            <Text style={[styles.gramsUnit, { color: colors.icon }]}>г</Text>
            <TouchableOpacity onPress={() => handleRemoveIngredient(idx)} activeOpacity={0.7}>
              <MaterialIcons name="close" size={20} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {ingredients.length === 0 && (
        <Text style={[styles.hint, { color: colors.icon }]}>Найдите продукты выше и добавьте их</Text>
      )}

      {/* Шаги приготовления */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Приготовление</Text>

      {steps.map((step, idx) => (
        <View key={idx} style={styles.stepRow}>
          <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
            <Text style={styles.stepNumberText}>{idx + 1}</Text>
          </View>
          <TextInput
            style={[styles.stepInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
            placeholder={`Шаг ${idx + 1}`}
            placeholderTextColor={colors.icon}
            value={step}
            onChangeText={(v) => handleStepChange(idx, v)}
            multiline
          />
          {steps.length > 1 && (
            <TouchableOpacity onPress={() => handleRemoveStep(idx)} activeOpacity={0.7}>
              <MaterialIcons name="close" size={18} color={colors.icon} />
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity style={[styles.addStepBtn, { borderColor: colors.border }]} onPress={handleAddStep} activeOpacity={0.85}>
        <MaterialIcons name="add" size={20} color={colors.icon} />
        <Text style={[styles.addStepText, { color: colors.icon }]}>Добавить шаг</Text>
      </TouchableOpacity>

      {/* Сохранить */}
      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: canSave ? 1 : 0.5 }]} onPress={handleSave} disabled={!canSave} activeOpacity={0.85}>
        <Text style={styles.saveBtnText}>Сохранить рецепт</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => router.back()} activeOpacity={0.85}>
        <Text style={[styles.cancelText, { color: colors.icon }]}>Отмена</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontFamily: fontFamily('bold'), fontSize: 22, marginBottom: 20 },
  label: { fontFamily: fontFamily('medium'), fontSize: 13, marginBottom: 6 },
  input: { fontFamily: fontFamily('regular'), fontSize: 16, padding: Platform.select({ ios: 14, android: 12 }), borderWidth: 1.5, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontFamily: fontFamily('semiBold'), fontSize: 17, marginTop: 16, marginBottom: 10 },

  searchWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, marginBottom: 8 },
  searchInput: { flex: 1, fontFamily: fontFamily('regular'), fontSize: 15, paddingVertical: 10, marginLeft: 6 },

  resultItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 6 },
  resultName: { flex: 1, fontFamily: fontFamily('medium'), fontSize: 14 },

  ingredientRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 6 },
  ingredientName: { flex: 1, fontFamily: fontFamily('medium'), fontSize: 14 },
  ingredientRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gramsInput: { fontFamily: fontFamily('regular'), fontSize: 14, padding: Platform.select({ ios: 6, android: 4 }), borderWidth: 1, borderRadius: 6, width: 56, textAlign: 'center' },
  gramsUnit: { fontFamily: fontFamily('regular'), fontSize: 13 },

  hint: { fontFamily: fontFamily('regular'), fontSize: 13, textAlign: 'center', marginVertical: 12 },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  stepNumberText: { fontFamily: fontFamily('bold'), fontSize: 14, color: '#fff' },
  stepInput: { flex: 1, fontFamily: fontFamily('regular'), fontSize: 14, padding: Platform.select({ ios: 10, android: 8 }), borderWidth: 1, borderRadius: 10, minHeight: 40 },

  addStepBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', marginBottom: 20 },
  addStepText: { fontFamily: fontFamily('medium'), fontSize: 13 },

  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  saveBtnText: { fontFamily: fontFamily('semiBold'), fontSize: 16, color: '#fff' },
  cancelBtn: { paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  cancelText: { fontFamily: fontFamily('regular'), fontSize: 14 },
});