import { Button } from '@/components/ui/button';
import { GenderSelector } from '@/components/ui/gender-selector';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GenderType, useUserStore } from '@/store/userStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              keyboardType="numeric"
              value={localAge.toString()}
              onChangeText={handleAgeChange}
              placeholder="16-90 лет"
              placeholderTextColor={colors.icon}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Рост (см)</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              keyboardType="numeric"
              value={localHeight.toString()}
              onChangeText={handleHeightChange}
              placeholder="140-220 см"
              placeholderTextColor={colors.icon}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Вес (кг)</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              keyboardType="numeric"
              value={localWeight.toString()}
              onChangeText={handleWeightChange}
              placeholder="40-200 кг"
              placeholderTextColor={colors.icon}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Далее"
            onPress={handleNext}
            disabled={!isFormValid}
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
    fontWeight: '700',
    fontFamily: 'TikTokSans',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'TikTokSans',
  },
  form: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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
