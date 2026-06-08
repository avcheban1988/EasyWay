import { Colors, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DailyMacros } from '@/store/userStore';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MacrosDisplayProps {
  macros: DailyMacros;
}

export function MacrosDisplay({ macros }: MacrosDisplayProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, Shadows.cardSoft, { backgroundColor: colors.cardNested, borderColor: colors.border }]}>
      <View style={[styles.caloriesContainer, { backgroundColor: colors.tint }]}>
        <Text style={styles.caloriesLabel}>Твоя норма</Text>
        <Text style={styles.caloriesValue}>{macros.calories}</Text>
        <Text style={styles.caloriesUnit}>ккал</Text>
      </View>

      <View style={styles.macrosContainer}>
        <View style={styles.macroItem}>
          <Text style={[styles.macroLabel, { color: colors.icon }]}>Белки</Text>
          <Text style={[styles.macroValue, { color: colors.text }]}>
            {macros.proteins} <Text style={styles.macroUnit}>г</Text>
          </Text>
        </View>

        <View style={styles.macroItem}>
          <Text style={[styles.macroLabel, { color: colors.icon }]}>Жиры</Text>
          <Text style={[styles.macroValue, { color: colors.text }]}>
            {macros.fats} <Text style={styles.macroUnit}>г</Text>
          </Text>
        </View>

        <View style={styles.macroItem}>
          <Text style={[styles.macroLabel, { color: colors.icon }]}>Углеводы</Text>
          <Text style={[styles.macroValue, { color: colors.text }]}>
            {macros.carbs} <Text style={styles.macroUnit}>г</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  caloriesContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  caloriesLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'TikTokSans',
  },
  caloriesValue: {
    color: '#fff',
    fontSize: 44,
    fontFamily: 'TikTokSans',
  },
  caloriesUnit: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'TikTokSans',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 24,
    fontWeight: '600',
  },
  macroUnit: {
    fontSize: 14,
  },
});
