import { Colors, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

type SurfaceCardProps = ViewProps & {
  nested?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SurfaceCard({ nested, style, children, ...props }: SurfaceCardProps) {
  const colors = Colors[useColorScheme() ?? 'light'];

  return (
    <View
      style={[
        styles.card,
        nested ? Shadows.cardSoft : Shadows.card,
        {
          backgroundColor: nested ? colors.cardNested : colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
});
