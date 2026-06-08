import { Colors } from '@/constants/theme';
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
        return { fontSize: 28, fontFamily: 'TikTokSans-Bold', color: colors.text };
      case 'defaultSemiBold':
        return { fontFamily: 'TikTokSans-SemiBold' };
      case 'subtitle':
        return { fontSize: 16, fontFamily: 'TikTokSans-Medium', color: colors.icon };
      case 'link':
        return { color: colors.tint, fontFamily: 'TikTokSans-SemiBold' };
      default:
        return { fontFamily: 'TikTokSans' };
    }
  };

  return <Text style={[getTextStyle(), style]} {...props} />;
}
