import { Button } from '@/components/ui/button';
import { GymDaysSelector } from '@/components/ui/gym-days-selector';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function GymFrequencyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { userProfile, setGymDaysPerWeek } = useUserStore();

  const [localGymDays, setLocalGymDays] = useState<number | null>(userProfile.gymDaysPerWeek);

  const handleNext = () => {
    setGymDaysPerWeek(localGymDays!);
    router.replace('/onboarding/results');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Сколько дней в неделю вы тренируетесь?
          </Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Это поможет нам оптимизировать вашу программу питания
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.section}>
            <GymDaysSelector
              selected={localGymDays}
              onSelect={setLocalGymDays}
            />
          </View>

          <View style={styles.ctaWrap}>
            <Button
              title="Рассчитать"
              onPress={handleNext}
              disabled={localGymDays === null}
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
    paddingBottom: 120,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    ...Typography.display,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
  },
  section: {
    marginBottom: 24,
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
  sectionTitle: {
    ...Typography.title,
    marginBottom: 12,
  },
  footer: {
    marginTop: 'auto',
  },
});
