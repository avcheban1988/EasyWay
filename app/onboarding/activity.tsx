import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/button';
import { OptionCard } from '@/components/ui/option-card';
import { ACTIVITY_LEVELS } from '@/constants/activityLevels';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Typography } from '@/constants/theme';

export default function ActivityScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { userProfile, setActivityLevel } = useUserStore();
  const activityLevel = userProfile.activityLevel;

  const handleNext = () => {
    if (activityLevel) {
      router.replace('/onboarding/gym-frequency');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Ваш уровень активности
          </Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Это поможет нам точнее рассчитать вашу норму калорий
          </Text>
        </View>

        <View style={styles.activitiesContainer}>
          {ACTIVITY_LEVELS.map((level) => (
            <OptionCard
              key={level.id}
              title={level.title}
              description={level.description}
              selected={activityLevel === level.id}
              onPress={() => setActivityLevel(level.id)}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            title="Далее"
            onPress={handleNext}
            disabled={!activityLevel}
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
    ...Typography.display,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
  },
  activitiesContainer: {
    marginBottom: 24,
  },
  footer: {
    marginTop: 'auto',
  },
});
