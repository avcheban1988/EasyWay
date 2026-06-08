import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { GenderType } from '@/store/userStore';

interface GenderSelectorProps {
  selected: GenderType | null;
  onSelect: (gender: GenderType) => void;
}

export function GenderSelector({ selected, onSelect }: GenderSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.option,
          selected === 'male' && { backgroundColor: colors.tint },
        ]}
        onPress={() => onSelect('male')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.optionText,
            { color: selected === 'male' ? '#fff' : colors.text },
          ]}
        >
          Мужской
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.option,
          selected === 'female' && { backgroundColor: colors.tint },
        ]}
        onPress={() => onSelect('female')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.optionText,
            { color: selected === 'female' ? '#fff' : colors.text },
          ]}
        >
          Женский
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  option: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
