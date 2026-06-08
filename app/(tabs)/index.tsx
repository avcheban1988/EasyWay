import { Button } from '@/components/ui/button';
import { MainTabBackground } from '@/components/ui/main-tab-background';
import { MacrosDisplay } from '@/components/ui/macros-display';
import { SurfaceCard } from '@/components/ui/surface-card';
import SummaryCard from '@/components/ui/summary-card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useFoodStore } from '@/store/foodStore';
import { useUserStore } from '@/store/userStore';
import { useRootNavigationState, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userProfile, dailyMacros, loadProfile } = useUserStore();
  const { loadFoodEntries, getTodayEntries, getTodayTotals, removeFoodEntry } = useFoodStore();
  const { checkAuth } = useAuthStore();

  React.useEffect(() => {
    if (!rootNavigationState?.key) return;

    const initialize = async () => {
      await checkAuth();

      const { status, account } = useAuthStore.getState();
      if (status === 'unauthenticated') {
        router.replace('/onboarding/auth');
        return;
      }

      const accountEmail = account?.email ?? null;
      await loadProfile(accountEmail);
      await loadFoodEntries(accountEmail);
    };

    initialize();
  }, [checkAuth, loadFoodEntries, loadProfile, rootNavigationState?.key, router]);

  const todayMeals = getTodayEntries();
  const todayTotals = getTodayTotals();

  if (!userProfile.isOnboarded) {
    return (
      <MainTabBackground>
        <View style={styles.container}>
          <Text style={[styles.title, { color: colors.text }]}>Добро пожаловать!</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Давайте настроим приложение под ваши цели
          </Text>
          <Button
            title="Начать настройку"
            onPress={() => router.push('/onboarding/goal')}
          />
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
          <MacrosDisplay macros={dailyMacros} />
          <SurfaceCard nested style={styles.progressBox}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Сегодня съедено</Text>
            <Text style={[styles.progressValue, { color: colors.text }]}>Калории: {todayTotals.calories} / {dailyMacros.calories}</Text>
            <Text style={[styles.progressValue, { color: colors.text }]}>Белки: {todayTotals.proteins} / {dailyMacros.proteins} г</Text>
            <Text style={[styles.progressValue, { color: colors.text }]}>Жиры: {todayTotals.fats} / {dailyMacros.fats} г</Text>
            <Text style={[styles.progressValue, { color: colors.text }]}>Угли: {todayTotals.carbs} / {dailyMacros.carbs} г</Text>
          </SurfaceCard>
        </SurfaceCard>
      )}

      <SurfaceCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Приемы пищи сегодня</Text>
        {todayMeals.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.icon }]}>Добавьте первый прием пищи</Text>
        ) : (
          todayMeals.map((meal) => (
            <SurfaceCard key={meal.id} nested style={styles.mealRow}>
              <View style={styles.mealRowInner}>
                <View style={styles.mealDetails}>
                  <Text style={[styles.mealName, { color: colors.text }]}>{meal.name}</Text>
                  <Text style={[styles.mealNotes, { color: colors.icon }]}>{meal.mealType}, {meal.calories} ккал • {meal.proteins}/{meal.fats}/{meal.carbs}</Text>
                </View>
                <Button title="X" onPress={() => removeFoodEntry(meal.id)} variant="outline" />
              </View>
            </SurfaceCard>
          ))
        )}
      </SurfaceCard>

      <SurfaceCard style={styles.addFoodCard}>
        <Button
          title="+ Добавить еду"
          onPress={() => router.push('/add-food')}
        />
      </SurfaceCard>
    </ScrollView>
    </MainTabBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 16,
  },
  header: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EAF3',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  title: {
    fontSize: 32,
    fontFamily: 'TikTokSans',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'TikTokSans',
    marginBottom: 10,
  },
  progressBox: {
    marginTop: 4,
    marginBottom: 0,
    padding: 14,
  },
  addFoodCard: {
    marginBottom: 8,
    padding: 14,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 14,
    marginBottom: 4,
  },
  mealRow: {
    marginBottom: 8,
    padding: 12,
  },
  mealRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealDetails: {
    flex: 1,
    marginRight: 10,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
  },
  mealNotes: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  gradient: {
    flex: 1,
  },
});
