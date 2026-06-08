import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface GymDaysSelectorProps {
  selected: number | null;
  onSelect: (days: number) => void;
}

export function GymDaysSelector({ selected, onSelect }: GymDaysSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const days = Array.from({ length: 8 }, (_, i) => i);

  return (
    <View style={styles.container}>
      {days.map((day) => (
        <TouchableOpacity
          key={day}
          style={[
            styles.dayButton,
            selected === day && { backgroundColor: colors.tint },
          ]}
          onPress={() => onSelect(day)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dayText,
              { color: selected === day ? '#fff' : colors.text },
            ]}
          >
            {day === 0 ? 'Нет' : day}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
