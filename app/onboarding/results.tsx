import { Button } from '@/components/ui/button';
import { MacrosDisplay } from '@/components/ui/macros-display';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ResultsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { dailyMacros, calculateMacros, saveProfile, setIsOnboarded } = useUserStore();

  useEffect(() => {
    calculateMacros();
  }, [calculateMacros]);

  const handleStartTracking = async () => {
    setIsOnboarded(true);
    await saveProfile();
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
          <MacrosDisplay macros={dailyMacros} />

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
});
