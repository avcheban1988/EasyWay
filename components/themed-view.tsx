import React from 'react';
import { View, ViewProps, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

export function ThemedView({ style, ...props }: ViewProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  return <View style={[{ backgroundColor: colors.background }, style]} {...props} />;
}
