import { Button } from '@/components/ui/button';
import { Colors, fontFamily, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ResultsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { userProfile, dailyMacros, calculateMacros, saveProfile, setIsOnboarded } = useUserStore();

  useEffect(() => {
    // Если выбраны свои БЖУ — не пересчитываем
    if (userProfile.goal !== 'manual') {
      calculateMacros();
    }
  }, [userProfile.goal, calculateMacros]);

  const handleStartTracking = async () => {
    setIsOnboarded(true);
    try {
      await saveProfile();
    } catch (e) {
      console.warn('saveProfile error (ignored):', e);
    }
    router.replace('/(tabs)');
  };

  if (!dailyMacros) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Расчет ваших показателей...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Ваша персональная норма 🎯
          </Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            На основе ваших параметров мы рассчитали оптимальные значения
          </Text>
        </View>

        <View style={styles.card}>
          {/* Калории крупно */}
          <View style={styles.caloriesBlock}>
            <Text style={styles.caloriesValue}>{dailyMacros.calories}</Text>
            <Text style={styles.caloriesUnit}>ккал</Text>
          </View>

          {/* БЖУ цифрами с цветами */}
          <View style={styles.macrosRow}>
            <View style={styles.macroCol}>
              <Text style={[styles.macroNumber, { color: '#53B175' }]}>{dailyMacros.proteins}</Text>
              <Text style={[styles.macroLabelSmall, { color: '#53B175' }]}>белки</Text>
            </View>
            <View style={styles.macroCol}>
              <Text style={[styles.macroNumber, { color: '#F7A593' }]}>{dailyMacros.fats}</Text>
              <Text style={[styles.macroLabelSmall, { color: '#F7A593' }]}>жиры</Text>
            </View>
            <View style={styles.macroCol}>
              <Text style={[styles.macroNumber, { color: '#F8A44C' }]}>{dailyMacros.carbs}</Text>
              <Text style={[styles.macroLabelSmall, { color: '#F8A44C' }]}>Углеводы</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            Что это значит?
          </Text>
          <Text style={[styles.infoText, { color: colors.icon }]}>
            • Белки необходимы для восстановления и роста мышц
          </Text>
          <Text style={[styles.infoText, { color: colors.icon }]}>
            • Жиры важны для гормонального баланса и здоровья
          </Text>
          <Text style={[styles.infoText, { color: colors.icon }]}>
            • Углеводы обеспечивают энергией для тренировок и повседневной активности
          </Text>
          </View>

          <View style={styles.ctaWrap}>
            <Button
              title="Начать отслеживание"
              onPress={handleStartTracking}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...Typography.display,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
  },
  infoSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  infoTitle: {
    ...Typography.title,
    marginBottom: 12,
  },
  infoText: {
    ...Typography.label,
    fontFamily: Typography.body.fontFamily,
    marginBottom: 8,
  },
  loadingText: {
    ...Typography.title,
    textAlign: 'center',
    marginTop: 40,
  },
  footer: {
    marginTop: 'auto',
  },
  card: {
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: '#FAFBF7',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 18,
  },
  ctaWrap: {
    position: 'relative',
    marginTop: 6,
  },
  caloriesBlock: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#53B175',
    borderRadius: 14,
    marginBottom: 20,
  },
  caloriesValue: {
    fontFamily: fontFamily('extraBold'),
    fontSize: 48,
    color: '#fff',
    lineHeight: 56,
  },
  caloriesUnit: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  macroCol: {
    alignItems: 'center',
  },
  macroNumber: {
    fontFamily: fontFamily('bold'),
    fontSize: 28,
    lineHeight: 34,
  },
  macroLabelSmall: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 12,
    marginTop: 2,
  },
});
