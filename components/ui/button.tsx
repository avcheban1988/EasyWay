import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const buttonStyle = [
    styles.button,
    variant === 'primary' && { backgroundColor: colors.tint },
    variant === 'secondary' && { backgroundColor: colors.secondary },
    variant === 'outline' && {
      backgroundColor: 'transparent',
      borderColor: colors.tint,
      borderWidth: 2,
    },
    disabled && styles.disabled,
    style,
  ];

  const textColorStyle = [
    styles.text,
    variant === 'primary' && { color: '#fff' },
    variant === 'secondary' && { color: '#fff' },
    variant === 'outline' && { color: colors.tint },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.tint : '#fff'} />
      ) : (
        <Text style={textColorStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  text: Typography.button,
  disabled: {
    opacity: 0.5,
  },
});
