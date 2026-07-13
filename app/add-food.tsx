import { Colors, fontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/lib/api';
import { MealType, useFoodStore } from '@/store/foodStore';
import { Product, useProductStore } from '@/store/productStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
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
  const params = useLocalSearchParams<{ date?: string; mealType?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { addFoodEntry, recentProducts } = useFoodStore();
  const { products, searchProducts, searchByBarcode, addProduct, toggleFavorite, favoriteIds, load: loadProducts } = useProductStore();

  const [mealType, setMealType] = useState<MealType>((params.mealType as MealType) || getDefaultMealType());
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
  const [manualBarcode, setManualBarcode] = useState('');

  // Выбранный продукт
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [portions, setPortions] = useState('1');
  const [grams, setGrams] = useState('');
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [recentAddedIdx, setRecentAddedIdx] = useState<number | null>(null);
  const recentAddedScale = useRef(new Animated.Value(1)).current;
  const recentAddedOpacity = useRef(new Animated.Value(1)).current;
  const [barcodeModal, setBarcodeModal] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState('');
  const [barcodeScanning, setBarcodeScanning] = useState(true);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // AI (DeepSeek)
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingText, setAiLoadingText] = useState('');
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [textDescription, setTextDescription] = useState('');
  const [aiResultData, setAiResultData] = useState<{
    name: string;
    caloriesPer100: number;
    proteinsPer100: number;
    fatsPer100: number;
    carbsPer100: number;
    grams: number;
  } | null>(null);
  const [showAiResult, setShowAiResult] = useState(false);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Загружаем недавние продукты при открытии экрана
  useEffect(() => {
    useFoodStore.getState().loadRecentProducts();
  }, []);

  // Debounce поиска
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!searchQuery.trim()) { setResults([]); setSearching(false); return; }
    setSearching(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setResults(searchProducts(searchQuery));
      setSearching(false);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [searchQuery, searchProducts]);

  const handleScanBarcode = async () => {
    if (cameraPermission && !cameraPermission.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) return;
    }
    setBarcodeValue('');
    setBarcodeScanning(true);
    setBarcodeModal(true);
  };

  const handleBarcodeDetected = (code: string) => {
    setBarcodeScanning(false);
    setBarcodeValue(code);
    const found = searchByBarcode(code);
    if (found) {
      setTimeout(() => {
        setBarcodeModal(false);
        handleSelectProduct(found);
      }, 800);
    } else {
      if (showManual) {
        setManualBarcode(code);
      }
      setShowManual(true);
      setMode('manual');
      setSearchQuery('');
      setResults([]);
      setTimeout(() => {
        setManualBarcode(code);
      }, 0);
    }
  };

  const handleTakePhoto = async () => {
    setAiLoading(true);
    setAiLoadingText('Открываем камеру...');

    try {
      // Запрашиваем разрешение камеры
      if (cameraPermission && !cameraPermission.granted) {
        const result = await requestCameraPermission();
        if (!result.granted) {
          setAiLoading(false);
          return;
        }
      }

      let imageBase64: string | null = null;

      // Пробуем камеру
      try {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.6,
          base64: true,
          maxWidth: 1024,
          maxHeight: 1024,
        });
        if (!result.canceled && result.assets?.[0]?.base64) {
          imageBase64 = result.assets[0].base64;
        }
      } catch {
        // fallback — галерея
      }

      // Если камера не дала результат — галерея
      if (!imageBase64) {
        const galleryPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!galleryPerm.granted) {
          setAiLoading(false);
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.6,
          base64: true,
          maxWidth: 1024,
          maxHeight: 1024,
        });
        if (!result.canceled && result.assets?.[0]?.base64) {
          imageBase64 = result.assets[0].base64;
        }
      }

      if (!imageBase64) {
        setAiLoading(false);
        return;
      }

      setAiLoadingText('Анализируем фото через AI...');
      const aiResult = await api.analyzePhoto(imageBase64);

      // Создаём продукт из результата
      await addProduct({
        name: aiResult.name,
        caloriesPer100: aiResult.caloriesPer100,
        proteinsPer100: aiResult.proteinsPer100,
        fatsPer100: aiResult.fatsPer100,
        carbsPer100: aiResult.carbsPer100,
      });

      const freshProducts = useProductStore.getState().products;
      const found = freshProducts.find((p) => p.name === aiResult.name);
      if (found) {
        setSelectedProduct(found);
        setGrams('100');
        setPortions('1');
      }
    } catch (err: any) {
      console.error('[AI Photo]', err);
    } finally {
      setAiLoading(false);
      setAiLoadingText('');
    }
  };

  const handleTextAnalysis = async () => {
    if (!textDescription.trim()) return;
    setTextModalVisible(false);
    setAiLoading(true);
    setAiLoadingText('Анализируем описание через AI...');
    try {
      const aiResult = await api.analyzeText(textDescription);
      // Пытаемся извлечь вес из текста
      const weightMatch = textDescription.match(/(\d+)\s*(г|грамм|граммов|гр)/i);
      const grams = weightMatch ? parseInt(weightMatch[1], 10) : 100;

      setAiResultData({
        name: aiResult.name,
        caloriesPer100: aiResult.caloriesPer100,
        proteinsPer100: aiResult.proteinsPer100,
        fatsPer100: aiResult.fatsPer100,
        carbsPer100: aiResult.carbsPer100,
        grams,
      });
      setShowAiResult(true);
    } catch (err: any) {
      console.error('[AI Text]', err);
    } finally {
      setAiLoading(false);
      setAiLoadingText('');
    }
  };

  const handleAddAiResult = async () => {
    if (!aiResultData) return;
    const { name, caloriesPer100, proteinsPer100, fatsPer100, carbsPer100, grams } = aiResultData;
    const mult = grams / 100;

    // Сохраняем продукт в БД
    await addProduct({ name, caloriesPer100, proteinsPer100, fatsPer100, carbsPer100 });

    // Добавляем в дневник
    await addFoodEntry({
      mealType,
      name,
      calories: Math.round(caloriesPer100 * mult),
      proteins: Math.round(proteinsPer100 * mult * 10) / 10,
      fats: Math.round(fatsPer100 * mult * 10) / 10,
      carbs: Math.round(carbsPer100 * mult * 10) / 10,
      grams,
      date: params.date,
    });

    setShowAiResult(false);
    setAiResultData(null);
    setTextDescription('');
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleEditAiResult = () => {
    setShowAiResult(false);
    // Открываем модалку с тем же текстом
    setTimeout(() => setTextModalVisible(true), 300);
  };

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    setGrams(p.packageGrams?.toString() ?? '100');
    setPortions('1');
  };

  const handleAddCustomProduct = async () => {
    if (!manualName.trim()) return;
    const p = Number(manualProt) || 0;
    const f = Number(manualFat) || 0;
    const c = Number(manualCarb) || 0;
    const newProduct = {
      name: manualName.trim(),
      caloriesPer100: p * 4 + f * 9 + c * 4,
      proteinsPer100: p,
      fatsPer100: f,
      carbsPer100: c,
      packageGrams: Number(manualPackage) || undefined,
      barcode: manualBarcode || undefined,
    };
    // Ждём сохранения в БД
    await addProduct(newProduct);
    // Ищем продукт в локальном списке (через свежее состояние стора)
    const freshProducts = useProductStore.getState().products;
    const found = freshProducts.find((pr) => pr.name === manualName.trim());
    if (found) {
      setSelectedProduct(found);
      setGrams(found.packageGrams?.toString() ?? '100');
      setPortions('1');
    }
    setManualName('');
    setManualProt('');
    setManualFat('');
    setManualCarb('');
    setManualPackage('');
    setManualBarcode('');
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
      grams: Number(grams) || 100,
      date: params.date,
    });
    setAddedFeedback(true);
    setTimeout(() => {
      // Сбрасываем выбор, чтобы можно было добавить ещё продукты
      setSelectedProduct(null);
      setPortions('1');
      setGrams('');
      setSearchQuery('');
      setResults([]);
      setAddedFeedback(false);
    }, 800);
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
        <View style={styles.manualField}><Text style={[styles.manualFieldLabel, { color: colors.icon }]}>Белки, г</Text><TextInput style={[styles.manualInputSmall, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="decimal-pad" value={manualProt} onChangeText={(v) => setManualProt(v.replace(/[^0-9.,]/g, '').replace(',', '.'))} /></View>
        <View style={styles.manualField}><Text style={[styles.manualFieldLabel, { color: colors.icon }]}>Жиры, г</Text><TextInput style={[styles.manualInputSmall, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="decimal-pad" value={manualFat} onChangeText={(v) => setManualFat(v.replace(/[^0-9.,]/g, '').replace(',', '.'))} /></View>
        <View style={styles.manualField}><Text style={[styles.manualFieldLabel, { color: colors.icon }]}>Углеводы, г</Text><TextInput style={[styles.manualInputSmall, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="decimal-pad" value={manualCarb} onChangeText={(v) => setManualCarb(v.replace(/[^0-9.,]/g, '').replace(',', '.'))} /></View>
      </View>
      {(manualProt || manualFat || manualCarb) ? (
        <View style={[styles.autoCalories, { backgroundColor: colors.backgroundSoft }]}>
          <Text style={[styles.autoCaloriesText, { color: colors.primary }]}>~ {Number(manualProt || 0) * 4 + Number(manualFat || 0) * 9 + Number(manualCarb || 0) * 4} ккал</Text>
        </View>
      ) : null}
      <Text style={[styles.manualHint, { color: colors.icon }]}>Вес порции / упаковки (необязательно)</Text>
      <View style={styles.manualInlineRow}>
        <TextInput style={[styles.manualInputHalf, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="140" placeholderTextColor={colors.icon} keyboardType="decimal-pad" value={manualPackage} onChangeText={(v) => setManualPackage(v.replace(/[^0-9.,]/g, '').replace(',', '.'))} />
        <Text style={[styles.manualUnit, { color: colors.icon }]}>грамм</Text>
      </View>
      <Text style={[styles.manualHint, { color: colors.icon }]}>Штрихкод</Text>
      <View style={styles.manualInlineRow}>
        <TextInput style={[styles.manualInputHalf, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="———" placeholderTextColor={colors.icon} keyboardType="numeric" value={manualBarcode} onChangeText={setManualBarcode} />
        <TouchableOpacity style={[styles.barcodeBtn, { backgroundColor: hexToRgba('#53B175', 0.12), borderColor: '#53B175' }]} onPress={() => { setBarcodeValue(''); setBarcodeScanning(true); setBarcodeModal(true); }} activeOpacity={0.85}>
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
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: hexToRgba('#D3B0E0', 0.12), borderColor: '#D3B0E0' }]} onPress={() => { setTextDescription(''); setTextModalVisible(true); }} activeOpacity={0.85}>
          <MaterialIcons name="edit-note" size={24} color="#D3B0E0" />
          <Text style={[styles.actionText, { color: '#D3B0E0' }]}>AI Текст</Text>
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
{(results.length > 0 || ((searchQuery.trim() || showManual) && !searching)) && !selectedProduct && (
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
          {showManual && !searching && (
            <View style={[styles.noResults, { borderColor: colors.border }]}> 
              {renderManualForm()}
            </View>
          )}
          {searchQuery.trim() && results.length === 0 && !showManual && !searching && (
            <View style={[styles.noResults, { borderColor: colors.border }]}> 
              <Text style={[styles.noResultsText, { color: colors.icon }]}>Ничего не найдено</Text>
              <TouchableOpacity style={styles.expandRow} onPress={() => setShowManual(true)} activeOpacity={0.85}>
                <Text style={[styles.addNewText, { color: colors.primary }]}>Добавить новый продукт</Text>
                <Animated.View style={{ transform: [{ rotate: showManual ? '180deg' : '0deg' }] }}>
                  <MaterialIcons name="expand-more" size={22} color={colors.primary} />
                </Animated.View>
              </TouchableOpacity>
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
              <TextInput style={[styles.portionInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="decimal-pad" value={portions} onChangeText={(v) => { const clean = v.replace(/[^0-9.,]/g, '').replace(',', '.'); if ((clean.match(/\./g) || []).length <= 1) setPortions(clean); }} />
            </View>
            <View style={styles.portionField}>
              <Text style={[styles.portionLabel, { color: colors.icon }]}>Грамм</Text>
              <TextInput style={[styles.portionInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="decimal-pad" value={grams} onChangeText={(v) => { const clean = v.replace(/[^0-9.,]/g, '').replace(',', '.'); if ((clean.match(/\./g) || []).length <= 1) setGrams(clean); }} />
              {selectedProduct.packageGrams && (
                <TouchableOpacity onPress={() => setGrams(selectedProduct.packageGrams!.toString())} style={[styles.pkgChip, { backgroundColor: hexToRgba(colors.primary, 0.12), borderColor: colors.primary }]}>
                  <MaterialIcons name="inventory-2" size={14} color={colors.primary} />
                  <Text style={[styles.pkgChipText, { color: colors.primary }]}>уп. {selectedProduct.packageGrams}г</Text>
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

          <TouchableOpacity
            style={[styles.addDiaryBtn, { backgroundColor: addedFeedback ? '#3D8C54' : colors.primary }]}
            onPress={handleAddToDiary}
            activeOpacity={0.85}
            disabled={addedFeedback}
          >
            <MaterialIcons name={addedFeedback ? 'check-circle' : 'add'} size={20} color="#fff" />
            <Text style={styles.addDiaryText}>{addedFeedback ? 'Добавлено' : 'Добавить в дневник'}</Text>
          </TouchableOpacity>
        </View>
      )}

{/* Форма ручного добавления (рендерится внутри блока «ничего не найдено») */}

      {/* Недавно добавленные */}
      {!selectedProduct && recentProducts.length > 0 && (
        <View style={[styles.recentSection, { borderColor: colors.border }]}>
          <Text style={[styles.recentTitle, { color: colors.text }]}>Недавно добавленные</Text>
          {recentProducts.map((item, idx) => {
            const product = products.find((p) => p.name === item.name);
            const isThisAdded = recentAddedIdx === idx;
            return (
              <TouchableOpacity
                key={`${item.name}-${idx}`}
                style={[styles.resultItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  if (product) {
                    setSelectedProduct(product);
                    setGrams(item.grams.toString());
                    setPortions('1');
                  }
                }}
                activeOpacity={0.85}
              >
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: colors.text }]}>{item.name}</Text>
                  {product && (
                    <Text style={[styles.resultMacros, { color: colors.icon }]}>
                      {product.caloriesPer100} ккал · Б {product.proteinsPer100} / Ж {product.fatsPer100} / У {product.carbsPer100} · {item.grams}г
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.recentAddBtn, { backgroundColor: isThisAdded ? hexToRgba('#53B175', 0.25) : hexToRgba('#53B175', 0.12), borderColor: isThisAdded ? '#2E7D32' : '#53B175' }]}
                  onPress={async () => {
                    if (!product || isThisAdded) return;
                    const mult = item.grams / 100;
                    await addFoodEntry({
                      mealType,
                      name: product.name,
                      calories: Math.round(product.caloriesPer100 * mult),
                      proteins: Math.round(product.proteinsPer100 * mult * 10) / 10,
                      fats: Math.round(product.fatsPer100 * mult * 10) / 10,
                      carbs: Math.round(product.carbsPer100 * mult * 10) / 10,
                      grams: item.grams,
                      date: params.date,
                    });
                    // Анимация: показать галочку с масштабом
                    setRecentAddedIdx(idx);
                    recentAddedScale.setValue(0.5);
                    recentAddedOpacity.setValue(1);
                    Animated.parallel([
                      Animated.spring(recentAddedScale, { toValue: 1, useNativeDriver: true }),
                    ]).start();
                    setTimeout(() => {
                      Animated.timing(recentAddedOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
                        setRecentAddedIdx(null);
                        recentAddedOpacity.setValue(1);
                        recentAddedScale.setValue(1);
                      });
                    }, 1500);
                  }}
                  activeOpacity={0.7}
                >
                  {isThisAdded ? (
                    <Animated.View style={{ transform: [{ scale: recentAddedScale }], opacity: recentAddedOpacity }}>
                      <MaterialIcons name="check" size={20} color="#2E7D32" />
                    </Animated.View>
                  ) : (
                    <MaterialIcons name="add" size={20} color="#53B175" />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => router.back()} activeOpacity={0.85}>
        <Text style={[styles.cancelText, { color: colors.icon }]}>Готово</Text>
      </TouchableOpacity>

      {/* Модалка сканера штрихкода */}
      {barcodeModal && (
        <View style={styles.barcodeOverlay}>
          <View style={[styles.barcodeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.barcodeTitle, { color: colors.text }]}>Сканер штрихкода</Text>

            {cameraPermission?.granted ? (
              <>
                <View style={styles.cameraWrap}>
                  {barcodeScanning && (
                    <CameraView
                      style={styles.camera}
                      facing="back"
                      onBarcodeScanned={(result) => {
                        if (barcodeScanning) {
                          handleBarcodeDetected(result.data);
                        }
                      }}
                      barcodeScannerSettings={{
                        barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'codabar', 'itf14', 'qr', 'pdf417', 'aztec', 'datamatrix'],
                      }}
                    />
                  )}
                  {!barcodeScanning && (
                    <View style={styles.barcodeResult}>
                      <Text style={[styles.barcodeDigits, { color: colors.text }]}>{barcodeValue}</Text>
                      {(() => {
                        const found = searchByBarcode(barcodeValue);
                        if (found) {
                          return <Text style={[styles.barcodeFound, { color: '#53B175' }]}>Найден: {found.name}</Text>;
                        }
                        return (
                          <>
                            <Text style={[styles.barcodeNotFound, { color: colors.icon }]}>Продукт не найден</Text>
                            <TouchableOpacity
                              style={[styles.barcodeAddNew, { backgroundColor: '#53B175' }]}
                              onPress={() => {
                                setBarcodeModal(false);
                                setMode('manual');
                                setShowManual(true);
                                setSearchQuery('');
                                setResults([]);
                                setManualBarcode(barcodeValue);
                              }}
                              activeOpacity={0.85}
                            >
                              <Text style={styles.barcodeAddNewText}>Добавить новый продукт</Text>
                            </TouchableOpacity>
                          </>
                        );
                      })()}
                    </View>
                  )}
                </View>

                {!barcodeScanning && (
                  <TouchableOpacity
                    style={[styles.barcodeRescan, { borderColor: colors.primary }]}
                    onPress={() => setBarcodeScanning(true)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.barcodeRescanText, { color: colors.primary }]}>Сканировать ещё</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <Text style={[styles.barcodeHint, { color: colors.icon }]}>
                  Нужен доступ к камере для сканирования штрихкодов
                </Text>
                <TouchableOpacity
                  style={[styles.barcodeClose, { backgroundColor: colors.primary }]}
                  onPress={requestCameraPermission}
                  activeOpacity={0.85}
                >
                  <Text style={styles.barcodeCloseText}>Разрешить доступ</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.barcodeDismiss, { borderColor: colors.border }]}
              onPress={() => setBarcodeModal(false)}
              activeOpacity={0.85}
            >
              <Text style={[styles.barcodeDismissText, { color: colors.icon }]}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* AI загрузка */}
      {aiLoading && (
        <View style={styles.barcodeOverlay}>
          <View style={[styles.barcodeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.barcodeTitle, { color: colors.text }]}>AI анализ</Text>
            <View style={{ paddingVertical: 30, alignItems: 'center' }}>
              <MaterialIcons name="smart-toy" size={48} color={colors.primary} />
              <Text style={[styles.barcodeHint, { color: colors.text, marginTop: 12 }]}>{aiLoadingText}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Модалка текстового описания */}
      {textModalVisible && (
        <View style={styles.barcodeOverlay}>
          <View style={[styles.barcodeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.barcodeTitle, { color: colors.text }]}>Опишите блюдо</Text>
            <Text style={[styles.barcodeHint, { color: colors.icon }]}>
              Например: «куриный суп с лапшой и морковью» или «греческий салат с фетой и оливками»
            </Text>
            <TextInput
              style={[styles.textModalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Введите описание..."
              placeholderTextColor={colors.icon}
              value={textDescription}
              onChangeText={setTextDescription}
              multiline
              autoFocus
            />
            <View style={{ flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 16, width: '80%' }}>
              <TouchableOpacity
                style={[styles.photoSourceBtn, { backgroundColor: '#D3B0E0', borderColor: '#D3B0E0', opacity: textDescription.trim() ? 1 : 0.5, width: '100%' }]}
                onPress={handleTextAnalysis}
                activeOpacity={0.85}
                disabled={!textDescription.trim()}
              >
                <Text style={{ fontFamily: fontFamily('semiBold'), fontSize: 15, color: '#fff' }}>Анализировать</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.barcodeDismiss, { borderColor: colors.border, width: '100%' }]}
                onPress={() => setTextModalVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={[styles.barcodeDismissText, { color: colors.icon }]}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* AI результат текстового анализа */}
      {showAiResult && aiResultData && (
        <View style={styles.barcodeOverlay}>
          <View style={[styles.barcodeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.barcodeTitle, { color: colors.text }]}>Результат анализа</Text>

            <View style={[styles.aiResultBlock, { backgroundColor: colors.backgroundSoft }]}>
              <Text style={[styles.aiResultName, { color: colors.text }]}>{aiResultData.name}</Text>
              <View style={styles.aiResultRow}>
                <Text style={[styles.aiResultLabel, { color: colors.icon }]}>Вес:</Text>
                <Text style={[styles.aiResultValue, { color: colors.text }]}>{aiResultData.grams} г</Text>
              </View>
              <View style={styles.aiResultDivider} />
              <View style={styles.aiResultRow}>
                <Text style={[styles.aiResultLabel, { color: colors.icon }]}>Калории:</Text>
                <Text style={[styles.aiResultValue, { color: '#F8A44C' }]}>
                  {Math.round(aiResultData.caloriesPer100 * aiResultData.grams / 100)} ккал
                </Text>
              </View>
              <View style={styles.aiResultRow}>
                <Text style={[styles.aiResultLabel, { color: colors.icon }]}>Белки:</Text>
                <Text style={[styles.aiResultValue, { color: colors.text }]}>
                  {Math.round(aiResultData.proteinsPer100 * aiResultData.grams / 100 * 10) / 10} г
                </Text>
              </View>
              <View style={styles.aiResultRow}>
                <Text style={[styles.aiResultLabel, { color: colors.icon }]}>Жиры:</Text>
                <Text style={[styles.aiResultValue, { color: colors.text }]}>
                  {Math.round(aiResultData.fatsPer100 * aiResultData.grams / 100 * 10) / 10} г
                </Text>
              </View>
              <View style={styles.aiResultRow}>
                <Text style={[styles.aiResultLabel, { color: colors.icon }]}>Углеводы:</Text>
                <Text style={[styles.aiResultValue, { color: colors.text }]}>
                  {Math.round(aiResultData.carbsPer100 * aiResultData.grams / 100 * 10) / 10} г
                </Text>
              </View>
              <Text style={[styles.aiResultPer100, { color: colors.icon }]}>
                (на 100г: {aiResultData.caloriesPer100} ккал · Б{aiResultData.proteinsPer100} / Ж{aiResultData.fatsPer100} / У{aiResultData.carbsPer100})
              </Text>
            </View>

            <View style={{ flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 12, width: '80%' }}>
              <TouchableOpacity
                style={[styles.photoSourceBtn, { backgroundColor: '#53B175', borderColor: '#53B175', width: '100%' }]}
                onPress={handleAddAiResult}
                activeOpacity={0.85}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text style={{ fontFamily: fontFamily('semiBold'), fontSize: 15, color: '#fff' }}>Добавить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoSourceBtn, { backgroundColor: hexToRgba('#D3B0E0', 0.12), borderColor: '#D3B0E0', width: '100%' }]}
                onPress={handleEditAiResult}
                activeOpacity={0.85}
              >
                <MaterialIcons name="edit" size={20} color="#D3B0E0" />
                <Text style={{ fontFamily: fontFamily('semiBold'), fontSize: 15, color: '#D3B0E0' }}>Изменить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 200, paddingTop: 60 },

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
  pkgChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, marginTop: 6 },
  pkgChipText: { fontFamily: fontFamily('semiBold'), fontSize: 12 },
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

  // Модалка сканера штрихкода
  barcodeOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
  },
  barcodeCard: {
    width: '90%', borderRadius: 16, borderWidth: 1, padding: 20, alignItems: 'center',
  },
  barcodeTitle: { fontFamily: fontFamily('bold'), fontSize: 18, marginBottom: 16 },
  cameraWrap: {
    width: '100%', height: 220, borderRadius: 12, overflow: 'hidden', marginBottom: 12,
  },
  camera: { flex: 1 },
  barcodeResult: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#000',
  },
  barcodeDigits: {
    fontFamily: fontFamily('bold'), fontSize: 24,
    letterSpacing: 3, color: '#fff', textAlign: 'center', paddingHorizontal: 12,
  },
  barcodeHint: { fontFamily: fontFamily('regular'), fontSize: 14, marginBottom: 16, textAlign: 'center' },
  barcodeRescan: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  barcodeRescanText: { fontFamily: fontFamily('semiBold'), fontSize: 14 },
  barcodeClose: { paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12, marginBottom: 8 },
  barcodeCloseText: { fontFamily: fontFamily('semiBold'), fontSize: 15, color: '#fff' },
  barcodeDismiss: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10, borderWidth: 1 },
  barcodeDismissText: { fontFamily: fontFamily('regular'), fontSize: 14 },
  barcodeFound: { fontFamily: fontFamily('semiBold'), fontSize: 14, marginTop: 8 },
  barcodeNotFound: { fontFamily: fontFamily('regular'), fontSize: 14, marginTop: 8, marginBottom: 12, textAlign: 'center' },
  barcodeAddNew: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, marginTop: 4 },
  barcodeAddNewText: { fontFamily: fontFamily('semiBold'), fontSize: 14, color: '#fff' },

  // Недавно добавленные
  recentSection: { borderTopWidth: 1, paddingTop: 12, marginBottom: 16 },
  recentTitle: { fontFamily: fontFamily('semiBold'), fontSize: 15, marginBottom: 10 },
  recentAddBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },

  // AI фото/текст
  photoSourceBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 8,
  },
  photoSourceText: { fontFamily: fontFamily('semiBold'), fontSize: 16 },
  textModalInput: {
    fontFamily: fontFamily('regular'), fontSize: 16, padding: 12, borderWidth: 1,
    borderRadius: 10, minHeight: 100, textAlignVertical: 'top', width: '100%',
  },
  aiResultBlock: {
    borderRadius: 12, padding: 16, width: '100%', marginBottom: 8,
  },
  aiResultName: { fontFamily: fontFamily('bold'), fontSize: 18, marginBottom: 10, textAlign: 'center' },
  aiResultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  aiResultLabel: { fontFamily: fontFamily('regular'), fontSize: 14 },
  aiResultValue: { fontFamily: fontFamily('semiBold'), fontSize: 14 },
  aiResultDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 6 },
  aiResultPer100: { fontFamily: fontFamily('regular'), fontSize: 11, textAlign: 'center', marginTop: 6 },
});
