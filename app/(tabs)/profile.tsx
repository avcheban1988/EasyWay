import { Button } from '@/components/ui/button';
import { MainTabBackground } from '@/components/ui/main-tab-background';
import { OptionCard } from '@/components/ui/option-card';
import { ACTIVITY_LEVELS } from '@/constants/activityLevels';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GenderType, GoalType, useUserStore } from '@/store/userStore';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const GOALS: { id: GoalType; title: string }[] = [
  { id: 'lose', title: 'Похудеть' },
  { id: 'maintain', title: 'Поддержать' },
  { id: 'gain', title: 'Набрать' },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    userProfile,
    setGoal,
    setGender,
    setAge,
    setHeight,
    setWeight,
    setActivityLevel,
    calculateMacros,
    saveProfile,
  } = useUserStore();

  const [localGoal, setLocalGoal] = useState<GoalType | null>(userProfile.goal);
  const [localGender, setLocalGender] = useState<GenderType | null>(userProfile.gender);
  const [localAge, setLocalAge] = useState(userProfile.age?.toString() ?? '25');
  const [localHeight, setLocalHeight] = useState(userProfile.height?.toString() ?? '170');
  const [localWeight, setLocalWeight] = useState(userProfile.weight?.toString() ?? '70');
  const [localActivity, setLocalActivity] = useState(userProfile.activityLevel || 'moderate');

  const hasSyncedLocalRef = useRef(false);

  useEffect(() => {
    if (hasSyncedLocalRef.current) return;

    const hasAnyProfileData = !!(
      userProfile.isOnboarded ||
      userProfile.goal ||
      userProfile.gender ||
      userProfile.age !== null ||
      userProfile.height !== null ||
      userProfile.weight !== null ||
      userProfile.activityLevel ||
      userProfile.gymDaysPerWeek !== null
    );

    if (!hasAnyProfileData) return;

    hasSyncedLocalRef.current = true;
    setLocalGoal(userProfile.goal);
    setLocalGender(userProfile.gender);
    setLocalAge(userProfile.age?.toString() ?? '25');
    setLocalHeight(userProfile.height?.toString() ?? '170');
    setLocalWeight(userProfile.weight?.toString() ?? '70');
    setLocalActivity(userProfile.activityLevel || 'moderate');
  }, [userProfile]);

  const applyChanges = async () => {
    if (localGoal) setGoal(localGoal);
    if (localGender) setGender(localGender);
    setAge(Number(localAge));
    setHeight(Number(localHeight));
    setWeight(Number(localWeight));
    setActivityLevel(localActivity);
    calculateMacros();
    await saveProfile();
  };

  const isSaveEnabled =
    !!localGoal &&
    !!localGender &&
    Number(localAge) > 0 &&
    Number(localHeight) > 0 &&
    Number(localWeight) > 0;

  return (
    <MainTabBackground>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Text style={[styles.title, { color: colors.text }]}>Настройки профиля</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>Измените параметры, чтобы пересчитать норму</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Цель</Text>
      <View style={styles.row}>
        {GOALS.map((option) => (
          <OptionCard
            key={option.id}
            title={option.title}
            description=""
            selected={localGoal === option.id}
            onPress={() => setLocalGoal(option.id)}
          />
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Пол</Text>
      <View style={styles.row}>
        <OptionCard
          title="Мужской"
          description=""
          selected={localGender === 'male'}
          onPress={() => setLocalGender('male')}
        />
        <OptionCard
          title="Женский"
          description=""
          selected={localGender === 'female'}
          onPress={() => setLocalGender('female')}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Возраст</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          keyboardType="numeric"
          value={localAge}
          onChangeText={setLocalAge}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Рост (см)</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          keyboardType="numeric"
          value={localHeight}
          onChangeText={setLocalHeight}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Вес (кг)</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          keyboardType="numeric"
          value={localWeight}
          onChangeText={setLocalWeight}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Активность</Text>
      <View style={styles.row}>
        {ACTIVITY_LEVELS.map((option) => (
          <OptionCard
            key={option.id}
            title={option.title}
            description=""
            selected={localActivity === option.id}
            onPress={() => setLocalActivity(option.id)}
          />
        ))}
      </View>

      </View>
      <Button title="Сохранить" onPress={applyChanges} disabled={!isSaveEnabled} />
    </ScrollView>
    </MainTabBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 20,
  },
  title: {
    ...Typography.display,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.label,
    fontFamily: Typography.body.fontFamily,
    marginBottom: 20,
    color: '#777',
  },
  sectionTitle: {
    ...Typography.title,
    marginVertical: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    ...Typography.label,
    marginBottom: 6,
  },
  input: {
    ...Typography.input,
    padding: Platform.select({ ios: 14, android: 10 }),
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 6,
    // subtle shadow for elevated input
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
