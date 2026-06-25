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
import { Animated, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const { loadFoodEntries, removeFoodEntry, getEntriesForDate, getTotalsForDate } = useFoodStore();
  const { checkAuth } = useAuthStore();

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showCalendar, setShowCalendar] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;

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
      // На native просим ввести дату
      const d = prompt?.('Введите дату (ГГГГ-ММ-ДД):', selectedDate);
      if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
        if (!hasEntries) setToastMsg('В этот день записей не было');
        setSelectedDate(d);
      }
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
      <ScrollView style={styles.container}>
        <SummaryCard />

        {dailyMacros && (
          <SurfaceCard>
            <View style={styles.dateHeader}>
              <TouchableOpacity onPress={handlePrevDay} style={styles.arrowBtn} activeOpacity={0.7}>
                <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDatePress} style={styles.dateCenter} activeOpacity={0.85}>
                <Text style={[styles.dateValue, { color: colors.text }]}>
                  {isToday ? `Сегодня, ${formatDateRu(selectedDate)}` : formatDateRu(selectedDate)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNextDay}
                style={[styles.arrowBtn, isToday && styles.arrowDisabled]}
                activeOpacity={isToday ? 1 : 0.7}
              >
                <MaterialIcons name="chevron-right" size={28} color={isToday ? (colors.icon as string) : colors.primary} />
              </TouchableOpacity>
            </View>

            {showCalendar && Platform.OS === 'web' && (
              <View style={[styles.calendarWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleCalendarChange(e.target.value)}
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
            )}

            <MacrosDisplay macros={dailyMacros} todayTotals={dayTotals} />
          </SurfaceCard>
        )}

        <SurfaceCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Приемы пищи {isToday ? 'сегодня' : formatDateRu(selectedDate)}
          </Text>
          {!hasEntries ? (
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              {isToday ? 'Сегодня еду не записывали' : 'В этот день записей не было'}
            </Text>
          ) : (
            meals.map((meal) => {
              const mealColors: Record<string, string> = { 'Завтрак': '#53B175', 'Обед': '#F8A44C', 'Ужин': '#F7A593', 'Перекус': '#D3B0E0' };
              const mc = mealColors[meal.mealType] ?? '#ccc';
              return (
                <SurfaceCard key={meal.id} nested style={[styles.mealRow, { borderLeftColor: mc, borderLeftWidth: 4, backgroundColor: hexToRgba(mc, 0.06) }]}>
                  <View style={styles.mealRowInner}>
                    <View style={styles.mealDetails}>
                      <View style={styles.mealTypeBadge}>
                        <View style={[styles.mealTypeDot, { backgroundColor: mc }]} />
                        <Text style={[styles.mealTypeLabel, { color: mc }]}>{meal.mealType}</Text>
                      </View>
                      <Text style={[styles.mealName, { color: colors.text }]}>{meal.name}</Text>
                      <Text style={[styles.mealNotes, { color: colors.icon }]}>
                        {meal.calories} ккал • Б {meal.proteins} / Ж {meal.fats} / У {meal.carbs}
                      </Text>
                    </View>
                    <Button title="X" onPress={() => removeFoodEntry(meal.id)} variant="outline" />
                  </View>
                </SurfaceCard>
              );
            })
          )}
        </SurfaceCard>

        <SurfaceCard style={styles.addFoodCard}>
          <Button
            title="+ Добавить еду"
            onPress={() => router.push({ pathname: '/add-food', params: { date: selectedDate } })}
          />
        </SurfaceCard>
      </ScrollView>

      {/* Toast-сообщение */}
      {toastMsg !== '' && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity, backgroundColor: 'rgba(0,0,0,0.8)' }]}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </Animated.View>
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
  mealRowInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mealDetails: { flex: 1, marginRight: 10 },
  mealName: { ...Typography.bodySemiBold, marginTop: 4 },
  mealTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mealTypeDot: { width: 8, height: 8, borderRadius: 4 },
  mealTypeLabel: { fontFamily: fontFamily('semiBold'), fontSize: 11 },
  mealNotes: { ...Typography.caption, marginTop: 2 },
  emptyText: { fontSize: 14, marginTop: 8 },
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
  calendarWrap: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    marginBottom: 10,
  },

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
});
