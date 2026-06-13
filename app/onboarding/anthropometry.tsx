import { Button } from '@/components/ui/button';
import { GenderSelector } from '@/components/ui/gender-selector';
import InputField from '@/components/ui/input-field';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GenderType, useUserStore } from '@/store/userStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AnthropometryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { userProfile, setGender, setAge, setHeight, setWeight } = useUserStore();

  const [localGender, setLocalGender] = useState<GenderType | null>(userProfile.gender);
  const [localAge, setLocalAge] = useState(userProfile.age || 25);
  const [localHeight, setLocalHeight] = useState(userProfile.height || 170);
  const [localWeight, setLocalWeight] = useState(userProfile.weight || 70);

  const validateAge = (value: number) => value >= 16 && value <= 90;
  const validateHeight = (value: number) => value >= 140 && value <= 220;
  const validateWeight = (value: number) => value >= 40 && value <= 200;

  const handleAgeChange = (text: string) => {
    const num = Number(text);
    setLocalAge(isNaN(num) ? 25 : num);
  };

  const handleHeightChange = (text: string) => {
    const num = Number(text);
    setLocalHeight(isNaN(num) ? 170 : num);
  };

  const handleWeightChange = (text: string) => {
    const num = Number(text);
    setLocalWeight(isNaN(num) ? 70 : num);
  };

  const handleNext = () => {
    setGender(localGender!);
    setAge(localAge);
    setHeight(localHeight);
    setWeight(localWeight);
    router.replace('/onboarding/activity');
  };

  const isFormValid = localGender !== null && localAge && localHeight && localWeight &&
    validateAge(localAge) && validateHeight(localHeight) && validateWeight(localWeight);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Расскажите о себе
          </Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Эти данные помогут нам рассчитать вашу норму калорий
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.form}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Пол</Text>
            <GenderSelector
              selected={localGender}
              onSelect={setLocalGender}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Возраст</Text>
            <InputField
              value={localAge.toString()}
              onChangeText={handleAgeChange}
              keyboardType="numeric"
              placeholder="16-90 лет"
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Рост (см)</Text>
            <InputField
              value={localHeight.toString()}
              onChangeText={handleHeightChange}
              keyboardType="numeric"
              placeholder="140-220 см"
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Вес (кг)</Text>
            <InputField
              value={localWeight.toString()}
              onChangeText={handleWeightChange}
              keyboardType="numeric"
              placeholder="40-200 кг"
            />
          </View>
          </View>

          <View style={styles.ctaWrap}>
            <Button
              title="Далее"
              onPress={handleNext}
              disabled={!isFormValid}
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
    marginBottom: 32,
  },
  title: {
    ...Typography.display,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
  },
  form: {
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.title,
    marginBottom: 12,
  },
  input: {
    padding: Platform.select({ ios: 14, android: 10 }),
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 6,
  },
  footer: {
    marginTop: 'auto',
  },
});
