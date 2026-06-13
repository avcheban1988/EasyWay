import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View, TextInputProps } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = TextInputProps & {
  label?: string;
  errorText?: string | null;
};

export function InputField({ label, errorText = null, style, ...rest }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [focused, setFocused] = useState(false);

  const borderColor = focused ? colors.tint : errorText ? '#d32f2f' : colors.border;

  return (
    <View style={styles.fieldGroup}>
      {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
      <TextInput
        {...rest}
        style={[styles.input, { color: colors.text, borderColor, backgroundColor: colors.card }, style]}
        placeholderTextColor={colors.icon}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e as any);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e as any);
        }}
      />
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    ...Typography.label,
    marginBottom: 6,
  },
  input: {
    ...Typography.input,
    paddingVertical: Platform.select({ ios: 14, android: 14 }),
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 56,
  },
  errorText: {
    ...Typography.caption,
    color: '#d32f2f',
    marginTop: 6,
  },
});

export default InputField;
