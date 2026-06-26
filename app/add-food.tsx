import { Colors, fontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MealType, useFoodStore } from '@/store/foodStore';
import { Product, useProductStore } from '@/store/productStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated, Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const MEAL_TYPES: MealType[] = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];

function getDefaultMealType(): MealType {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return 'Завтрак';
  if (h >= 12 && h < 17) return 'Обед';
  if (h >= 17 && h < 22) return 'Ужин';
  return 'Перекус';
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function AddFoodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { addFoodEntry } = useFoodStore();
  const { products, searchProducts, addProduct, toggleFavorite, favoriteIds, load: loadProducts } = useProductStore();

  const [mealType, setMealType] = useState<MealType>(getDefaultMealType());
  const [mode, setMode] = useState<'scan' | 'photo' | 'manual'>('manual');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // Ручное добавление
  const [manualName, setManualName] = useState('');
  const [manualProt, setManualProt] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualCarb, setManualCarb] = useState('');
  const [manualPackage, setManualPackage] = useState('');

  // Выбранный продукт
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [portions, setPortions] = useState('1');
  const [grams, setGrams] = useState('');

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Debounce поиска
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!searchQuery.trim()) { setResults([]); setSearching(false); return; }
    setSearching(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setResults(searchProducts(searchQuery));
      setSearching(false);
    }, 2000);
    return () => clearTimeout(timerRef.current);
  }, [searchQuery, searchProducts]);

  const handleScanBarcode = () => {
    // имитация сканирования
    setTimeout(() => {
      const random = products[Math.floor(Math.random() * products.length)];
      setSelectedProduct(random);
      setMode('manual');
    }, 1500);
  };

  const handleTakePhoto = () => {
    // имитация фото
    setTimeout(() => {
      const random = products[Math.floor(Math.random() * products.length)];
      setSelectedProduct(random);
      setMode('manual');
    }, 2000);
  };

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    setGrams(p.packageGrams?.toString() ?? '100');
    setPortions('1');
  };

  const handleAddCustomProduct = () => {
    if (!manualName.trim()) return;
    const p = Number(manualProt) || 0;
    const f = Number(manualFat) || 0;
    const c = Number(manualCarb) || 0;
    addProduct({
      name: manualName.trim(),
      caloriesPer100: p * 4 + f * 9 + c * 4,
      proteinsPer100: p,
      fatsPer100: f,
      carbsPer100: c,
      packageGrams: Number(manualPackage) || undefined,
    });
    // Создаём локальный объект продукта и сразу выбираем его
    const localProduct: Product = {
      id: `tmp-${Date.now()}`,
      name: manualName.trim(),
      caloriesPer100: p * 4 + f * 9 + c * 4,
      proteinsPer100: p,
      fatsPer100: f,
      carbsPer100: c,
      packageGrams: Number(manualPackage) || undefined,
    };
    setSelectedProduct(localProduct);
    setManualName('');
    setManualProt('');
    setManualFat('');
    setManualCarb('');
    setManualPackage('');
    setShowManual(false);
  };

  const handleAddToDiary = () => {
    if (!selectedProduct) return;
    const qty = Number(grams) || 100;
    const mult = qty / 100;
    const count = Number(portions) || 1;
    addFoodEntry({
      mealType,
      name: selectedProduct.name,
      calories: Math.round(selectedProduct.caloriesPer100 * mult * count),
      proteins: Math.round(selectedProduct.proteinsPer100 * mult * count * 10) / 10,
      fats: Math.round(selectedProduct.fatsPer100 * mult * count * 10) / 10,
      carbs: Math.round(selectedProduct.carbsPer100 * mult * count * 10) / 10,
      date: params.date,
    });
    router.back();
  };

  const macrosForSelected = useMemo(() => {
    if (!selectedProduct) return null;
    const qty = Number(grams) || 100;
    const mult = qty / 100;
    const count = Number(portions) || 1;
    return {
      calories: Math.round(selectedProduct.caloriesPer100 * mult * count),
      proteins: Math.round(selectedProduct.proteinsPer100 * mult * count * 10) / 10,
      fats: Math.round(selectedProduct.fatsPer100 * mult * count * 10) / 10,
      carbs: Math.round(selectedProduct.carbsPer100 * mult * count * 10) / 10,
    };
  }, [selectedProduct, grams, portions]);

  const renderManualForm = () => (
    <View style={[styles.manualCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.manualTitle, { color: colors.text }]}>Новый продукт</Text>
      <Text style={[styles.manualHint, { color: colors.icon }]}>Название</Text>
      <TextInput style={[styles.manualInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="Например: Творог 5%" placeholderTextColor={colors.icon} value={manualName} onChangeText={setManualName} />
      <Text style={[styles.manualHint, { color: colors.icon }]}>На 100 грамм (калории рассчитаются автоматически)</Text>
      <View style={styles.manualRow}>
        <View style={styles.manualField}><Text style={[styles.manualFieldLabel, { color: colors.icon }]}>Белки, г</Text><TextInput style={[styles.manualInputSmall, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="numeric" value={manualProt} onChangeText={(v) => setManualProt(v.replace(/[^0-9.]/g, ''))} /></View>
        <View style={styles.manualField}><Text style={[styles.manualFieldLabel, { color: colors.icon }]}>Жиры, г</Text><TextInput style={[styles.manualInputSmall, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="numeric" value={manualFat} onChangeText={(v) => setManualFat(v.replace(/[^0-9.]/g, ''))} /></View>
        <View style={styles.manualField}><Text style={[styles.manualFieldLabel, { color: colors.icon }]}>Углеводы, г</Text><TextInput style={[styles.manualInputSmall, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="numeric" value={manualCarb} onChangeText={(v) => setManualCarb(v.replace(/[^0-9.]/g, ''))} /></View>
      </View>
      {(manualProt || manualFat || manualCarb) ? (
        <View style={[styles.autoCalories, { backgroundColor: colors.backgroundSoft }]}>
          <Text style={[styles.autoCaloriesText, { color: colors.primary }]}>~ {Number(manualProt || 0) * 4 + Number(manualFat || 0) * 9 + Number(manualCarb || 0) * 4} ккал</Text>
        </View>
      ) : null}
      <Text style={[styles.manualHint, { color: colors.icon }]}>Вес порции / упаковки (необязательно)</Text>
      <View style={styles.manualInlineRow}>
        <TextInput style={[styles.manualInputHalf, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="140" placeholderTextColor={colors.icon} keyboardType="numeric" value={manualPackage} onChangeText={(v) => setManualPackage(v.replace(/[^0-9.]/g, ''))} />
        <Text style={[styles.manualUnit, { color: colors.icon }]}>грамм</Text>
      </View>
      <Text style={[styles.manualHint, { color: colors.icon }]}>Штрихкод (необязательно)</Text>
      <View style={styles.manualInlineRow}>
        <TextInput style={[styles.manualInputHalf, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="4612345678901" placeholderTextColor={colors.icon} keyboardType="numeric" />
        <TouchableOpacity style={[styles.barcodeBtn, { backgroundColor: hexToRgba('#53B175', 0.12), borderColor: '#53B175' }]}>
          <MaterialIcons name="qr-code-scanner" size={20} color="#53B175" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.saveProductBtn, { backgroundColor: colors.primary, opacity: manualName.trim() ? 1 : 0.5 }]} onPress={handleAddCustomProduct} activeOpacity={0.85}>
        <Text style={styles.saveProductText}>Сохранить продукт</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
      {/* Тип приёма пищи */}
      <View style={styles.mealTypes}>
        {MEAL_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.mealChip, mealType === t && { backgroundColor: colors.primary }]}
            onPress={() => setMealType(t)}
          >
            <Text style={[styles.mealChipText, { color: mealType === t ? '#fff' : colors.text }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 3 кнопки: сканер, фото, текст */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: hexToRgba('#53B175', 0.12), borderColor: '#53B175' }]} onPress={handleScanBarcode} activeOpacity={0.85}>
          <MaterialIcons name="qr-code-scanner" size={24} color="#53B175" />
          <Text style={[styles.actionText, { color: '#53B175' }]}>Штрихкод</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: hexToRgba('#F8A44C', 0.12), borderColor: '#F8A44C' }]} onPress={handleTakePhoto} activeOpacity={0.85}>
          <MaterialIcons name="camera-alt" size={24} color="#F8A44C" />
          <Text style={[styles.actionText, { color: '#F8A44C' }]}>Фото</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: hexToRgba('#D3B0E0', 0.12), borderColor: '#D3B0E0' }]} onPress={() => { setMode('manual'); setSelectedProduct(null); }} activeOpacity={0.85}>
          <MaterialIcons name="edit-note" size={24} color="#D3B0E0" />
          <Text style={[styles.actionText, { color: '#D3B0E0' }]}>Вручную</Text>
        </TouchableOpacity>
      </View>

      {/* Поиск */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <MaterialIcons name="search" size={20} color={colors.icon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Поиск продуктов..."
          placeholderTextColor={colors.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searching && <Text style={[styles.searchingText, { color: colors.icon }]}>Поиск...</Text>}
      </View>

      {/* Результаты поиска */}
      {(results.length > 0 || (searchQuery.trim() && !searching)) && !selectedProduct && (
        <View style={styles.resultsList}>
          {results.map((p) => (
            <TouchableOpacity key={p.id} style={[styles.resultItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => handleSelectProduct(p)} activeOpacity={0.85}>
              <View style={styles.resultInfo}>
                <Text style={[styles.resultName, { color: colors.text }]}>{p.name}</Text>
                <Text style={[styles.resultMacros, { color: colors.icon }]}>
                  {p.caloriesPer100} ккал · Б {p.proteinsPer100} / Ж {p.fatsPer100} / У {p.carbsPer100} на 100г
                  {p.packageGrams ? ` · уп. ${p.packageGrams}г` : ''}
                </Text>
              </View>
              <View style={styles.resultActions}>
                <TouchableOpacity onPress={() => toggleFavorite(p.id)} style={styles.favBtn} activeOpacity={0.7}>
                  <MaterialIcons name={favoriteIds.includes(p.id) ? 'star' : 'star-outline'} size={20} color={favoriteIds.includes(p.id) ? '#F8A44C' : colors.icon} />
                </TouchableOpacity>
                <MaterialIcons name="add-circle-outline" size={24} color={colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
          {searchQuery.trim() && results.length === 0 && !searching && (
            <View style={[styles.noResults, { borderColor: colors.border }]}>
              <Text style={[styles.noResultsText, { color: colors.icon }]}>Ничего не найдено</Text>
              <TouchableOpacity style={styles.expandRow} onPress={() => setShowManual((v) => !v)} activeOpacity={0.85}>
                <Text style={[styles.addNewText, { color: colors.primary }]}>Добавить новый продукт</Text>
                <Animated.View style={{ transform: [{ rotate: showManual ? '180deg' : '0deg' }] }}>
                  <MaterialIcons name="expand-more" size={22} color={colors.primary} />
                </Animated.View>
              </TouchableOpacity>

              {showManual && renderManualForm()}
            </View>
          )}
        </View>
      )}

      {/* Выбранный продукт — порции */}
      {selectedProduct && (
        <View style={[styles.selectedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.selectedHeader}>
            <Text style={[styles.selectedName, { color: colors.text }]}>{selectedProduct.name}</Text>
            <TouchableOpacity onPress={() => setSelectedProduct(null)}>
              <MaterialIcons name="close" size={22} color={colors.icon} />
            </TouchableOpacity>
          </View>

          <View style={styles.portionRow}>
            <View style={styles.portionField}>
              <Text style={[styles.portionLabel, { color: colors.icon }]}>Кол-во</Text>
              <TextInput style={[styles.portionInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="numeric" value={portions} onChangeText={(v) => setPortions(v.replace(/[^0-9.]/g, ''))} />
            </View>
            <View style={styles.portionField}>
              <Text style={[styles.portionLabel, { color: colors.icon }]}>Грамм</Text>
              <TextInput style={[styles.portionInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="numeric" value={grams} onChangeText={(v) => setGrams(v.replace(/[^0-9.]/g, ''))} />
              {selectedProduct.packageGrams && (
                <TouchableOpacity onPress={() => setGrams(selectedProduct.packageGrams!.toString())}>
                  <Text style={[styles.packageHint, { color: colors.primary }]}>уп. {selectedProduct.packageGrams}г</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {macrosForSelected && (
            <View style={[styles.macroPreview, { backgroundColor: colors.backgroundSoft }]}>
              <Text style={[styles.macroPreviewText, { color: colors.text }]}>
                {macrosForSelected.calories} ккал · Б {macrosForSelected.proteins} / Ж {macrosForSelected.fats} / У {macrosForSelected.carbs} г
              </Text>
            </View>
          )}

          <TouchableOpacity style={[styles.addDiaryBtn, { backgroundColor: colors.primary }]} onPress={handleAddToDiary} activeOpacity={0.85}>
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.addDiaryText}>Добавить в дневник</Text>
          </TouchableOpacity>
        </View>
      )}

{/* Форма ручного добавления (рендерится внутри блока «ничего не найдено») */}

      <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => router.back()} activeOpacity={0.85}>
        <Text style={[styles.cancelText, { color: colors.icon }]}>Отмена</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, paddingTop: 60 },

  // Тип приёма пищи
  mealTypes: { flexDirection: 'row', gap: 6, marginBottom: 16, flexWrap: 'wrap' },
  mealChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 0 },
  mealChipText: { fontFamily: fontFamily('semiBold'), fontSize: 13 },

  // 3 кнопки
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, gap: 4 },
  actionText: { fontFamily: fontFamily('semiBold'), fontSize: 11 },

  // Поиск
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, fontFamily: fontFamily('regular'), fontSize: 16, paddingVertical: 12, marginLeft: 8 },
  searchingText: { fontFamily: fontFamily('regular'), fontSize: 12 },

  // Результаты
  resultsList: { marginBottom: 16 },
  resultItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  resultInfo: { flex: 1, marginRight: 8 },
  resultName: { fontFamily: fontFamily('semiBold'), fontSize: 15 },
  resultMacros: { fontFamily: fontFamily('regular'), fontSize: 12, marginTop: 2 },
  noResults: { alignItems: 'center', paddingVertical: 20, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', marginBottom: 12 },
  noResultsText: { fontFamily: fontFamily('semiBold'), fontSize: 14, marginBottom: 12 },
  addNewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, gap: 6, paddingHorizontal: 20 },
  addNewText: { fontFamily: fontFamily('semiBold'), fontSize: 14 },

  // Выбранный продукт
  selectedCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  selectedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  selectedName: { fontFamily: fontFamily('bold'), fontSize: 18 },
  portionRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  portionField: { flex: 1 },
  portionLabel: { fontFamily: fontFamily('regular'), fontSize: 12, marginBottom: 4 },
  portionInput: { fontFamily: fontFamily('regular'), fontSize: 16, padding: Platform.select({ ios: 10, android: 8 }), borderWidth: 1, borderRadius: 8, textAlign: 'center' },
  packageHint: { fontFamily: fontFamily('semiBold'), fontSize: 12, textAlign: 'center', marginTop: 4 },
  macroPreview: { borderRadius: 10, padding: 10, alignItems: 'center', marginBottom: 12 },
  macroPreviewText: { fontFamily: fontFamily('semiBold'), fontSize: 14 },
  addDiaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
  addDiaryText: { fontFamily: fontFamily('semiBold'), fontSize: 16, color: '#fff' },

  // Ручное добавление
  manualCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12, width: '100%' },
  manualTitle: { fontFamily: fontFamily('bold'), fontSize: 15, marginBottom: 10 },
  manualHint: { fontFamily: fontFamily('medium'), fontSize: 11, marginBottom: 4, marginTop: 6 },
  manualInput: { fontFamily: fontFamily('regular'), fontSize: 14, paddingVertical: 10, paddingHorizontal: 10, borderWidth: 1, borderRadius: 8, marginBottom: 8 },
  manualRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  manualField: { flex: 1, minWidth: 0 },
  manualFieldLabel: { fontFamily: fontFamily('regular'), fontSize: 10, marginBottom: 2, textAlign: 'center' },
  manualInputSmall: { fontFamily: fontFamily('regular'), fontSize: 14, paddingVertical: 8, paddingHorizontal: 4, borderWidth: 1, borderRadius: 8, textAlign: 'center' },
  manualInlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  manualInputHalf: { flex: 1, fontFamily: fontFamily('regular'), fontSize: 14, paddingVertical: 10, paddingHorizontal: 8, borderWidth: 1, borderRadius: 8 },
  manualUnit: { fontFamily: fontFamily('regular'), fontSize: 13 },
  barcodeBtn: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  saveProductBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  resultActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  favBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  saveProductText: { fontFamily: fontFamily('semiBold'), fontSize: 15, color: '#fff' },

  cancelBtn: { paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  cancelText: { fontFamily: fontFamily('regular'), fontSize: 15 },
  expandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8 },
  autoCalories: { borderRadius: 8, padding: 8, alignItems: 'center', marginBottom: 8 },
  autoCaloriesText: { fontFamily: fontFamily('semiBold'), fontSize: 14 },
});
