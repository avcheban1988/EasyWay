import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface OptionCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function OptionCard({
  title,
  description,
  selected,
  onPress,
  style,
  icon,
}: OptionCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: selected ? colors.tint : colors.card,
          borderColor: selected ? colors.tint : colors.border,
          shadowColor: colors.shadow,
          shadowOpacity: selected ? 0.28 : 0.08,
          shadowRadius: selected ? 14 : 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: selected ? 5 : 2,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: selected ? '#fff' : colors.text }]}>{title}</Text>
          {description && (
            <Text style={[styles.description, { color: selected ? '#fff' : colors.icon }]}>{description}</Text>
          )}
        </View>
        {selected && (
          <View style={[styles.checkmark, { backgroundColor: '#fff' }]}> 
            <Text style={[styles.checkmarkText, { color: colors.tint }]}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
