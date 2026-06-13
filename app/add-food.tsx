import { Button } from '@/components/ui/button';
import { OptionCard } from '@/components/ui/option-card';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MealType, useFoodStore } from '@/store/foodStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const MEAL_TYPES: MealType[] = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];

export default function AddFoodScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { addFoodEntry } = useFoodStore();

  const [mealType, setMealType] = useState<MealType>('Завтрак');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [proteins, setProteins] = useState('');
  const [fats, setFats] = useState('');
  const [carbs, setCarbs] = useState('');

  const handleSubmit = async () => {
    addFoodEntry({
      mealType,
      name: name.trim() || 'Продукт',
      calories: Number(calories) || 0,
      proteins: Number(proteins) || 0,
      fats: Number(fats) || 0,
      carbs: Number(carbs) || 0,
    });
    router.back();
  };

  const canSubmit = name.trim().length > 0 && Number(calories) > 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Добавить прием пищи</Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Тип</Text>
        <View style={styles.row}>
          {MEAL_TYPES.map((type) => (
            <OptionCard
              key={type}
              title={type}
              description=""
              selected={mealType === type}
              onPress={() => setMealType(type)}
            />
          ))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Название</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            value={name}
            onChangeText={setName}
            placeholder="Например: Омлет"
            placeholderTextColor={colors.icon}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Калории (ккал)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            keyboardType="numeric"
            value={calories}
            onChangeText={setCalories}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Белки (г)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            keyboardType="numeric"
            value={proteins}
            onChangeText={setProteins}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Жиры (г)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            keyboardType="numeric"
            value={fats}
            onChangeText={setFats}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Углеводы (г)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            keyboardType="numeric"
            value={carbs}
            onChangeText={setCarbs}
          />
        </View>
      </View>
      <Button title="Сохранить" onPress={handleSubmit} disabled={!canSubmit} />
      <Button title="Отмена" onPress={() => router.back()} variant="outline" style={{ marginTop: 10 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    ...Typography.display,
    marginBottom: 12,
  },
  sectionTitle: {
    ...Typography.title,
    marginBottom: 8,
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
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
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
});
