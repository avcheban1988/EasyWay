import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Typography } from '@/constants/theme';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function SliderInput({
  label,
  value,
  onChange,
  unit = '',
  min = 0,
  max = 100,
  step = 1,
}: SliderInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleTextChange = (text: string) => {
    const numValue = parseInt(text, 10);
    if (!isNaN(numValue)) {
      onChange(Math.min(Math.max(numValue, min), max));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.icon,
            },
          ]}
          value={value.toString()}
          onChangeText={handleTextChange}
          keyboardType="numeric"
          maxLength={3}
        />
        {unit && <Text style={[styles.unit, { color: colors.icon }]}>{unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    ...Typography.bodySemiBold,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    ...Typography.input,
    flex: 1,
  },
  unit: {
    ...Typography.body,
    marginLeft: 8,
  },
});
