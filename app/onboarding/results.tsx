import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/button';
import { MacrosDisplay } from '@/components/ui/macros-display';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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

        <View style={styles.footer}>
          <Button
            title="Начать отслеживание"
            onPress={handleStartTracking}
          />
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  infoSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  footer: {
    marginTop: 'auto',
  },
});
