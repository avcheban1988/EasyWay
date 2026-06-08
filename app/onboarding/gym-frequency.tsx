import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/button';
import { GymDaysSelector } from '@/components/ui/gym-days-selector';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Сколько дней в неделю вы тренируетесь?
          </Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Это поможет нам оптимизировать вашу программу питания
          </Text>
        </View>

        <View style={styles.section}>
          <GymDaysSelector
            selected={localGymDays}
            onSelect={setLocalGymDays}
          />
        </View>


        <View style={styles.footer}>
          <Button
            title="Рассчитать"
            onPress={handleNext}
            disabled={localGymDays === null}
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  footer: {
    marginTop: 'auto',
  },
});
