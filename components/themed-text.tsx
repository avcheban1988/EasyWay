import { Colors, Typography } from '@/constants/theme';
import React from 'react';
import { Text, TextProps, useColorScheme } from 'react-native';

type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];

  const getTextStyle = () => {
    switch (type) {
      case 'title':
        return { ...Typography.display, color: colors.text };
      case 'defaultSemiBold':
        return Typography.bodySemiBold;
      case 'subtitle':
        return { ...Typography.subtitle, color: colors.icon };
      case 'link':
        return { ...Typography.bodySemiBold, color: colors.tint };
      default:
        return Typography.body;
    }
  };

  return <Text style={[getTextStyle(), style]} {...props} />;
}
