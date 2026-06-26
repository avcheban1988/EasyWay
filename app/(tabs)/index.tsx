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
import { useRootNavigationState, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const [editModalMeal, setEditModalMeal] = useState<{ id: string; mealType: string; name: string; proteins: number; fats: number; carbs: number; calories: number } | null>(null);
  const [editModalGrams, setEditModalGrams] = useState('100');
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [dateModalValue, setDateModalValue] = useState('');

  useEffect(() => {
    if (!rootNavigationState?.key) return;
    const initialize = async () => {
      const { account } = useAuthStore.getState();
      const accountEmail = account?.email ?? null;
      await loadProfile(accountEmail);
      await loadFoodEntries(accountEmail);
    };
    initialize();
  }, [checkAuth, loadFoodEntries, loadProfile, rootNavigationState?.key, router]);

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
  const hasEntries = meals.length > 0;

  const handlePrevDay = () => setSelectedDate(shiftDate(selectedDate, -1));
  const handleNextDay = () => {
    const next = shiftDate(selectedDate, 1);
    if (next > getToday()) return;
    setSelectedDate(next);
  };

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
                style={[styles.arrowBtn, isToday && styles.arrowDisabled]}
                activeOpacity={isToday ? 1 : 0.7}
              >
                <MaterialIcons name="chevron-right" size={28} color={isToday ? '#B0CAB5' : '#3D8C54'} />
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
          </SurfaceCard>
        )}

        <SurfaceCard style={{ backgroundColor: '#FEF6E7', borderColor: '#F8A44C' }}>
          <Text style={[styles.sectionTitle, { color: '#B87A2C' }]}>
            Приемы пищи {isToday ? 'сегодня' : formatDateRu(selectedDate)}
          </Text>
          {!hasEntries ? (
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              {isToday ? 'Сегодня еду не записывали' : 'В этот день записей не было'}
            </Text>
          ) : (
            (() => {
              const mealColors: Record<string, string> = { 'Завтрак': '#53B175', 'Обед': '#F8A44C', 'Ужин': '#F7A593', 'Перекус': '#D3B0E0' };
              const order = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];
              const grouped: Record<string, typeof meals> = { Завтрак: [], Обед: [], Ужин: [], Перекус: [] };
              meals.forEach((m) => { if (grouped[m.mealType]) grouped[m.mealType].push(m); });
              return order.map((type) => {
                const items = grouped[type];
                if (items.length === 0) return null;
                const mc = mealColors[type] ?? '#ccc';
                return (
                  <View key={type} style={[styles.mealGroup, { backgroundColor: hexToRgba(mc, 0.12), borderColor: mc }]}>
                    <View style={[styles.mealGroupHeader, { borderBottomColor: hexToRgba(mc, 0.2) }]}>
                      <View style={[styles.mealGroupDot, { backgroundColor: mc }]} />
                      <Text style={[styles.mealGroupTitle, { color: mc }]}>{type}</Text>
                    </View>
                    {items.map((meal) => (
                      <View key={meal.id} style={styles.mealGroupItem}>
                        <View style={styles.mealGroupItemInfo}>
                          <Text style={[styles.mealName, { color: colors.text }]}>{meal.name}</Text>
                          <Text style={[styles.mealNotes, { color: colors.icon }]}>
                            {meal.calories} ккал • Б {meal.proteins} / Ж {meal.fats} / У {meal.carbs}
                          </Text>
                        </View>
                        <View style={styles.mealActions}>
                          <TouchableOpacity onPress={() => {
                            setEditModalGrams('100');
                            setEditModalMeal(meal);
                          }} style={styles.mealAction} activeOpacity={0.7}>
                            <MaterialIcons name="edit" size={16} color={colors.icon} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => removeFoodEntry(meal.id)} style={styles.mealAction} activeOpacity={0.7}>
                            <MaterialIcons name="close" size={16} color="#E53935" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              });
            })()
          )}
        </SurfaceCard>

      </ScrollView>

      {/* FAB-кнопка добавления еды */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: '#53B175' }]}
        onPress={() => router.push({ pathname: '/add-food', params: { date: selectedDate } })}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Toast-сообщение */}
      {toastMsg !== '' && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity, backgroundColor: 'rgba(0,0,0,0.8)' }]}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </Animated.View>
      )}

      {/* Модалка выбора даты (native) */}
      {dateModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Введите дату</Text>
            <Text style={[styles.modalLabel, { color: colors.icon }]}>Формат: ГГГГ-ММ-ДД</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="2026-06-26"
              placeholderTextColor={colors.icon}
              value={dateModalValue}
              onChangeText={setDateModalValue}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#53B175' }]}
                onPress={() => {
                  if (/^\d{4}-\d{2}-\d{2}$/.test(dateModalValue)) {
                    const entries = getEntriesForDate(dateModalValue);
                    if (entries.length === 0) setToastMsg('В этот день записей не было');
                    setSelectedDate(dateModalValue);
                  }
                  setDateModalVisible(false);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalBtnText}>Выбрать</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#E53935' }]}
                onPress={() => setDateModalVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalBtnText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Модалка изменения веса порции (кросс-платформенная) */}
      {editModalMeal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{editModalMeal.name}</Text>
            <Text style={[styles.modalLabel, { color: colors.icon }]}>Новый вес (грамм):</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              keyboardType="numeric"
              value={editModalGrams}
              onChangeText={(v) => setEditModalGrams(v.replace(/[^0-9.]/g, ''))}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#53B175' }]}
                onPress={() => {
                  const val = editModalGrams;
                  const ratio = Number(val) / 100;
                  if (ratio > 0 && editModalMeal) {
                    const old = {
                      mealType: editModalMeal.mealType,
                      name: editModalMeal.name,
                      calories: Math.round(editModalMeal.calories / (editModalMeal.proteins || 1) * (editModalMeal.proteins || 1) * ratio),
                      proteins: Math.round(editModalMeal.proteins * ratio * 10) / 10,
                      fats: Math.round(editModalMeal.fats * ratio * 10) / 10,
                      carbs: Math.round(editModalMeal.carbs * ratio * 10) / 10,
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
  mealGroup: { borderRadius: 12, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  mealGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  mealGroupDot: { width: 10, height: 10, borderRadius: 5 },
  mealGroupTitle: { fontFamily: fontFamily('semiBold'), fontSize: 13 },
  mealGroupItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 0 },
  mealGroupItemInfo: { flex: 1, marginRight: 8 },
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
});
