import { Button } from '@/components/ui/button';
import { OptionCard } from '@/components/ui/option-card';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GoalType, useUserStore } from '@/store/userStore';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const GOALS: { id: GoalType; title: string; description: string; icon: string }[] = [
  {
    id: 'lose',
    title: 'Похудеть',
    description: 'Создать дефицит калорий для снижения веса',
    icon: '📉',
  },
  {
    id: 'maintain',
    title: 'Поддержать вес',
    description: 'Сохранить текущий вес и улучшить качество питания',
    icon: '⚖️',
  },
  {
    id: 'gain',
    title: 'Набрать массу',
    description: 'Создать профицит калорий для набора мышечной массы',
    icon: '💪',
  },
];

export default function GoalScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userProfile, setGoal } = useUserStore();
  const goal = userProfile.goal;

  const handleNext = () => {
    if (goal) {
      router.replace('/onboarding/anthropometry');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Цели</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>Давайте настроим приложение под ваши цели</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.goalsContainer}>
            {GOALS.map((goalOption) => (
              <OptionCard
                key={goalOption.id}
                title={goalOption.title}
                description={goalOption.description}
                selected={goal === goalOption.id}
                onPress={() => setGoal(goalOption.id)}
                icon={<Text style={styles.icon}>{goalOption.icon}</Text>}
              />
            ))}
          </View>

          <View style={styles.ctaWrap}>
            <Button
              title="Далее"
              onPress={handleNext}
              disabled={!goal}
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
  goalsContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 32,
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
