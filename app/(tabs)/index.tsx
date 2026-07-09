import { Button } from '@/components/ui/button';
import { MacrosDisplay } from '@/components/ui/macros-display';
import { MainTabBackground } from '@/components/ui/main-tab-background';
import SummaryCard from '@/components/ui/summary-card';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Colors, Typography, fontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useFoodStore } from '@/store/foodStore';
import { useUserStore } from '@/store/userStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRootNavigationState, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateRu(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function shiftDate(dateStr: string, delta: number) {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userProfile, dailyMacros, loadProfile } = useUserStore();
  const { loadFoodEntries, removeFoodEntry, addFoodEntry, getEntriesForDate, getTotalsForDate } = useFoodStore();
  const { checkAuth } = useAuthStore();

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showCalendar, setShowCalendar] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [editModalMeal, setEditModalMeal] = useState<{ id: string; mealType: string; name: string; proteins: number; fats: number; carbs: number; calories: number; grams?: number } | null>(null);
  const [editModalPortions, setEditModalPortions] = useState('1');
  const [editModalGrams, setEditModalGrams] = useState('100');
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [dateModalValue, setDateModalValue] = useState('');

  useEffect(() => {
    if (!rootNavigationState?.key) return;
    const initialize = async () => {
      const token = useAuthStore.getState().token;
      if (!token) return;
      await loadProfile();
      await loadFoodEntries();
    };
    initialize();
  }, [loadFoodEntries, loadProfile, rootNavigationState?.key, router]);

  useEffect(() => {
    if (!toastMsg) return;
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2700),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastMsg(''));
  }, [toastMsg, toastOpacity]);

  const meals = getEntriesForDate(selectedDate);
  const dayTotals = getTotalsForDate(selectedDate);
  const isToday = selectedDate === getToday();

  const handlePrevDay = () => {
    // Анимированный свайп
    Animated.timing(swipeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      swipeAnim.setValue(0);
      setSelectedDate(shiftDate(selectedDate, -1));
    });
  };
  const handleNextDay = () => {
    Animated.timing(swipeAnim, {
      toValue: -1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      swipeAnim.setValue(0);
      setSelectedDate(shiftDate(selectedDate, 1));
    });
  };

  // Анимированный свайп для переключения дат
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const dateSwipeResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5,
    onPanResponderMove: (_, gs) => {
      swipeAnim.setValue(gs.dx);
    },
    onPanResponderRelease: (_, gs) => {
      if (gs.dx > 60) {
        Animated.timing(swipeAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          swipeAnim.setValue(0);
          setSelectedDate(shiftDate(selectedDate, -1));
        });
      } else if (gs.dx < -60) {
        Animated.timing(swipeAnim, {
          toValue: -300,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          swipeAnim.setValue(0);
          setSelectedDate(shiftDate(selectedDate, 1));
        });
      } else {
        Animated.spring(swipeAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  })).current;

  const handleDatePress = () => {
    if (Platform.OS === 'web') {
      setShowCalendar(true);
    } else {
      setDateModalValue(selectedDate);
      setDateModalVisible(true);
    }
  };

  const handleCalendarChange = (val: string) => {
    setShowCalendar(false);
    setSelectedDate(val);
    const entries = getEntriesForDate(val);
    if (entries.length === 0) setToastMsg('В этот день записей не было');
  };

  if (!userProfile.isOnboarded) {
    return (
      <MainTabBackground>
        <View style={styles.container}>
          <Text style={[styles.title, { color: colors.text }]}>Настройка приложения</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>Давайте настроим приложение под ваши цели</Text>
          <Button title="Начать настройку" onPress={() => router.push('/onboarding/goal')} />
        </View>
      </MainTabBackground>
    );
  }

  return (
    <MainTabBackground>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
        <SummaryCard />

        {dailyMacros && (
          <SurfaceCard style={{ backgroundColor: '#EBF7EE', borderColor: '#53B175' }}>
            <Animated.View style={{ transform: [{ translateX: swipeAnim }] }} {...dateSwipeResponder.panHandlers}>
            <View style={styles.dateHeader}>
              <TouchableOpacity onPress={handlePrevDay} style={styles.arrowBtn} activeOpacity={0.7}>
                <MaterialIcons name="chevron-left" size={28} color="#3D8C54" />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDatePress} style={styles.dateCenter} activeOpacity={0.85}>
                <Text style={[styles.dateValue, { color: '#3D8C54' }]}>
                  {isToday ? `Сегодня, ${formatDateRu(selectedDate)}` : formatDateRu(selectedDate)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNextDay}
                style={styles.arrowBtn}
                activeOpacity={0.7}
              >
                <MaterialIcons name="chevron-right" size={28} color="#3D8C54" />
              </TouchableOpacity>
            </View>

            {showCalendar && Platform.OS === 'web' && (
              <View style={[styles.calendarWrap, { backgroundColor: colors.card, borderColor: '#53B175' }]}>
                <TextInput
                  style={[styles.calendarInput, { color: colors.text }]}
                  placeholder="ГГГГ-ММ-ДД"
                  placeholderTextColor={colors.icon}
                  defaultValue={selectedDate}
                  autoFocus
                  selectTextOnFocus
                  onSubmitEditing={(e) => {
                    const val = e.nativeEvent.text;
                    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                      handleCalendarChange(val);
                    }
                  }}
                  onBlur={(e) => {
                    const val = e.nativeEvent.text;
                    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                      handleCalendarChange(val);
                    } else {
                      setShowCalendar(false);
                    }
                  }}
                />
              </View>
            )}

            <MacrosDisplay macros={dailyMacros} todayTotals={dayTotals} />
            </Animated.View>
          </SurfaceCard>
        )}

        {/* 4 отдельных блока: Завтрак, Обед, Ужин, Перекус */}
        {(() => {
          const mealConfig: { key: string; label: string; color: string; textColor: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
            { key: 'Завтрак', label: 'Завтрак', color: '#53B175', textColor: '#2E7D32', icon: 'free-breakfast' },
            { key: 'Обед', label: 'Обед', color: '#F8A44C', textColor: '#B87020', icon: 'lunch-dining' },
            { key: 'Ужин', label: 'Ужин', color: '#F7A593', textColor: '#C06050', icon: 'dinner-dining' },
            { key: 'Перекус', label: 'Перекус', color: '#D3B0E0', textColor: '#8E5BA0', icon: 'cookie' },
          ];

          const grouped: Record<string, typeof meals> = { Завтрак: [], Обед: [], Ужин: [], Перекус: [] };
          meals.forEach((m) => { if (grouped[m.mealType]) grouped[m.mealType].push(m); });

          return mealConfig.map((cfg) => {
            const items = grouped[cfg.key];
            const sum = items.reduce((acc, m) => ({
              calories: acc.calories + m.calories,
              proteins: acc.proteins + (m.proteins || 0),
              fats: acc.fats + (m.fats || 0),
              carbs: acc.carbs + (m.carbs || 0),
            }), { calories: 0, proteins: 0, fats: 0, carbs: 0 });

            return (
              <View key={cfg.key} style={[styles.mealBlock, { borderColor: cfg.color, backgroundColor: colors.card }]}>
                {/* Заголовок с суммой БЖУ и плюсиком */}
                <View style={[styles.mealBlockHeader, { borderBottomColor: hexToRgba(cfg.color, 0.25) }]}>
                  <View style={styles.mealBlockHeaderRow}>
                    <View style={styles.mealBlockHeaderLeft}>
                      <MaterialIcons name={cfg.icon} size={18} color={cfg.textColor} />
                      <Text style={[styles.mealBlockTitle, { color: cfg.textColor }]}>{cfg.label}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.mealBlockAddBtn, { backgroundColor: cfg.color }]}
                      onPress={() => router.push({ pathname: '/add-food', params: { date: selectedDate, mealType: cfg.key } })}
                      activeOpacity={0.85}
                    >
                      <MaterialIcons name="add" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.mealBlockSum, { color: cfg.textColor }]}>
                    {Math.round(sum.calories)} ккал · Б {Math.round(sum.proteins)} / Ж {Math.round(sum.fats)} / У {Math.round(sum.carbs)}
                  </Text>
                </View>

                {/* Список продуктов в этом приёме пищи */}
                {items.length === 0 ? (
                  <Text style={[styles.mealBlockEmpty, { color: hexToRgba(cfg.textColor, 0.7) }]}>
                    Пока ничего не добавлено
                  </Text>
                ) : (
                  items.map((meal) => (
                    <View key={meal.id} style={[styles.mealBlockItem, { borderBottomColor: hexToRgba(cfg.color, 0.12) }]}>
                      <View style={styles.mealBlockItemInfo}>
                        <Text style={[styles.mealName, { color: colors.text }]}>{meal.name}</Text>
                        <Text style={[styles.mealNotes, { color: colors.icon }]}>
                          {Math.round(meal.calories)} ккал · Б {Math.round(meal.proteins)} / Ж {Math.round(meal.fats)} / У {Math.round(meal.carbs)}
                        </Text>
                      </View>
                      <View style={styles.mealActions}>
                            <TouchableOpacity onPress={() => { setEditModalPortions('1'); setEditModalGrams((meal.grams ?? 100).toString()); setEditModalMeal(meal); }} style={styles.mealAction} activeOpacity={0.7}>
                          <MaterialIcons name="edit" size={16} color={colors.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => removeFoodEntry(meal.id)} style={styles.mealAction} activeOpacity={0.7}>
                          <MaterialIcons name="close" size={16} color="#E53935" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            );
          });
        })()}

        {/* Отступ после последнего блока */}
        <View style={{ height: 20 }} />

      </ScrollView>

      {/* Toast-сообщение */}
      {toastMsg !== '' && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity, backgroundColor: 'rgba(0,0,0,0.8)' }]}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </Animated.View>
      )}

      {/* Модалка выбора даты */}
      {dateModalVisible && (
        <View style={styles.dateModalOverlay}>
          <View style={[styles.dateModalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Выберите дату</Text>

            <View style={styles.dateModalQuick}>
              <TouchableOpacity
                style={[styles.dateModalChip, { backgroundColor: '#53B175' }]}
                onPress={() => { setSelectedDate(getToday()); setDateModalVisible(false); }}
                activeOpacity={0.85}
              >
                <MaterialIcons name="today" size={16} color="#fff" />
                <Text style={styles.dateModalChipText}>Сегодня</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateModalChip, { backgroundColor: '#F8A44C' }]}
                onPress={() => { setSelectedDate(shiftDate(getToday(), -1)); setDateModalVisible(false); }}
                activeOpacity={0.85}
              >
                <MaterialIcons name="yesterday" size={16} color="#fff" />
                <Text style={styles.dateModalChipText}>Вчера</Text>
              </TouchableOpacity>
            </View>

            {Platform.OS === 'web' ? (
              <View style={styles.dateModalCalendarWrap}>
                <input
                  type="date"
                  value={dateModalValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDateModalValue(val);
                    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                      const entries = getEntriesForDate(val);
                      if (entries.length === 0) setToastMsg('В этот день записей не было');
                      setSelectedDate(val);
                      setDateModalVisible(false);
                    }
                  }}
                  style={{
                    fontFamily: fontFamily('regular'),
                    fontSize: 16,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    width: '100%',
                    background: colors.background,
                    color: colors.text,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  autoFocus
                />
              </View>
            ) : (
              <DateTimePicker
                value={new Date(dateModalValue + 'T00:00:00')}
                mode="date"
                display="inline"
                onChange={(_, date) => {
                  if (date) {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const d = String(date.getDate()).padStart(2, '0');
                    const val = `${y}-${m}-${d}`;
                    setDateModalValue(val);
                    const entries = getEntriesForDate(val);
                    if (entries.length === 0) setToastMsg('В этот день записей не было');
                    setSelectedDate(val);
                    setDateModalVisible(false);
                  }
                }}
                themeVariant="light"
              />
            )}

            <TouchableOpacity
              style={[styles.dateModalClose, { borderColor: colors.border }]}
              onPress={() => setDateModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={[styles.dateModalCloseText, { color: colors.icon }]}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Модалка изменения веса порции (кросс-платформенная) */}
      {editModalMeal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{editModalMeal.name}</Text>
            <View style={styles.editRow}>
              <View style={styles.editField}>
                <Text style={[styles.modalLabel, { color: colors.icon }]}>Кол-во</Text>
                <TextInput
                  style={[styles.editInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  keyboardType="decimal-pad"
                  value={editModalPortions}
                  onChangeText={(v) => { const clean = v.replace(/[^0-9.,]/g, '').replace(',', '.'); if ((clean.match(/\./g) || []).length <= 1) setEditModalPortions(clean); }}
                  selectTextOnFocus
                />
              </View>
              <View style={styles.editField}>
                <Text style={[styles.modalLabel, { color: colors.icon }]}>Грамм</Text>
                <TextInput
                  style={[styles.editInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  keyboardType="decimal-pad"
                  value={editModalGrams}
                  onChangeText={(v) => { const clean = v.replace(/[^0-9.,]/g, '').replace(',', '.'); if ((clean.match(/\./g) || []).length <= 1) setEditModalGrams(clean); }}
                  selectTextOnFocus
                />
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#53B175' }]}
                onPress={() => {
                  const qty = Number(editModalGrams) || 100;
                  const count = Number(editModalPortions) || 1;
                  if (qty > 0 && editModalMeal) {
                    // Пересчитываем макросы через per-100g: original / (origGrams/100)
                    const origGrams = editModalMeal.grams || 100;
                    const per100 = {
                      calories: editModalMeal.calories / (origGrams / 100),
                      proteins: editModalMeal.proteins / (origGrams / 100),
                      fats: editModalMeal.fats / (origGrams / 100),
                      carbs: editModalMeal.carbs / (origGrams / 100),
                    };
                    const mult = qty / 100;
                    const old = {
                      mealType: editModalMeal.mealType,
                      name: editModalMeal.name,
                      calories: Math.round(per100.calories * mult * count),
                      proteins: Math.round(per100.proteins * mult * count * 10) / 10,
                      fats: Math.round(per100.fats * mult * count * 10) / 10,
                      carbs: Math.round(per100.carbs * mult * count * 10) / 10,
                      grams: qty,
                    };
                    removeFoodEntry(editModalMeal.id);
                    addFoodEntry({ ...old, date: selectedDate });
                  }
                  setEditModalMeal(null);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalBtnText}>Сохранить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#E53935' }]}
                onPress={() => setEditModalMeal(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalBtnText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </MainTabBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', padding: 16 },
  title: { ...Typography.displayLarge, marginBottom: 8 },
  subtitle: { ...Typography.body, marginBottom: 16 },
  sectionTitle: { ...Typography.title, marginBottom: 10 },
  addFoodCard: { marginBottom: 8, padding: 14 },
  mealRow: { marginBottom: 8, padding: 12, borderRadius: 12 },
  // Блоки приёма пищи
  mealBlock: { borderRadius: 14, borderWidth: 1.5, marginBottom: 12, overflow: 'hidden' },
  mealBlockHeader: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  mealBlockHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  mealBlockHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mealBlockTitle: { fontFamily: fontFamily('bold'), fontSize: 15 },
  mealBlockSum: { fontFamily: fontFamily('medium'), fontSize: 12, marginLeft: 26 },
  mealBlockAddBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  mealBlockEmpty: { fontFamily: fontFamily('regular'), fontSize: 13, padding: 12, textAlign: 'center' },
  mealBlockItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 0.5 },
  mealBlockItemInfo: { flex: 1, marginRight: 8 },
  mealActions: { flexDirection: 'row', gap: 4 },
  mealAction: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  mealRowInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mealDetails: { flex: 1, marginRight: 10 },
  mealName: { ...Typography.bodySemiBold, marginTop: 4 },
  mealTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mealTypeDot: { width: 8, height: 8, borderRadius: 4 },
  mealTypeLabel: { fontFamily: fontFamily('semiBold'), fontSize: 11 },
  mealNotes: { ...Typography.caption, marginTop: 2 },
  emptyText: { fontSize: 14, marginTop: 8 },
  fab: { 
    position: 'absolute', 
    bottom: 100, 
    right: 20, 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 6, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 8,
    zIndex: 100,
  },
  gradient: { flex: 1 },

  // Дата-заголовок
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  arrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  dateCenter: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  dateLabel: {
    fontFamily: fontFamily('regular'),
    fontSize: 12,
    marginBottom: 2,
  },
  dateValue: {
    fontFamily: fontFamily('bold'),
    fontSize: 16,
  },

  // Календарь
  calendarWrap: { borderRadius: 12, borderWidth: 1, padding: 8, marginBottom: 10 },
  calendarInput: { fontFamily: fontFamily('regular'), fontSize: 16, padding: 8, textAlign: 'center' },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 40,
    right: 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  toastText: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 14,
    color: '#fff',
  },

  // Модалка изменения веса
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dateModalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', zIndex: 1000,
  },
  dateModalCard: {
    width: '90%', marginTop: 60, borderRadius: 16, borderWidth: 1, padding: 20,
  },
  dateModalQuick: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  dateModalChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10,
  },
  dateModalChipText: { fontFamily: fontFamily('semiBold'), fontSize: 14, color: '#fff' },
  dateModalCalendarWrap: { marginBottom: 16 },
  dateModalClose: { paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginTop: 12 },
  dateModalCloseText: { fontFamily: fontFamily('semiBold'), fontSize: 15 },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  modalTitle: {
    fontFamily: fontFamily('bold'),
    fontSize: 18,
    marginBottom: 16,
  },
  modalLabel: {
    fontFamily: fontFamily('regular'),
    fontSize: 14,
    marginBottom: 8,
  },
  modalInput: {
    fontFamily: fontFamily('regular'),
    fontSize: 18,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnText: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 15,
    color: '#fff',
  },
  editRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  editField: { flex: 1 },
  editInput: {
    fontFamily: fontFamily('regular'), fontSize: 18,
    padding: 12, borderWidth: 1, borderRadius: 10,
    textAlign: 'center',
  },
});
