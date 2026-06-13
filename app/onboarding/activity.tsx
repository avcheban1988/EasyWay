import { Button } from '@/components/ui/button';
import { OptionCard } from '@/components/ui/option-card';
import { ACTIVITY_LEVELS } from '@/constants/activityLevels';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

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

        <View style={styles.card}>
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

          <View style={styles.ctaWrap}>
            <Button
              title="Далее"
              onPress={handleNext}
              disabled={!activityLevel}
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
  activitiesContainer: {
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
  footer: {
    marginTop: 'auto',
  },
});
