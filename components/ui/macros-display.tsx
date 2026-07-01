import { Colors, Shadows, fontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DailyMacros } from '@/store/userStore';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface MacrosDisplayProps {
  macros: DailyMacros;
  todayTotals?: DailyMacros;
}

const BAR_COLORS = {
  calories: '#D3B0E0',
  proteins: '#53B175',
  fats: '#F7A593',
  carbs: '#F8A44C',
};

export function MacrosDisplay({ macros, todayTotals }: MacrosDisplayProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const totals = todayTotals ?? { calories: 0, proteins: 0, fats: 0, carbs: 0 };

  const calAnim = useRef(new Animated.Value(0)).current;
  const protAnim = useRef(new Animated.Value(0)).current;
  const fatAnim = useRef(new Animated.Value(0)).current;
  const carbAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration = 800;
    Animated.parallel([
      Animated.timing(calAnim, { toValue: Math.min(1, totals.calories / Math.max(1, macros.calories)), duration, useNativeDriver: false }),
      Animated.timing(protAnim, { toValue: Math.min(1, totals.proteins / Math.max(1, macros.proteins)), duration, useNativeDriver: false }),
      Animated.timing(fatAnim, { toValue: Math.min(1, totals.fats / Math.max(1, macros.fats)), duration, useNativeDriver: false }),
      Animated.timing(carbAnim, { toValue: Math.min(1, totals.carbs / Math.max(1, macros.carbs)), duration, useNativeDriver: false }),
    ]).start();
  }, [totals, macros, calAnim, protAnim, fatAnim, carbAnim]);

  const bars = [
    { key: 'calories', label: 'Калории', eaten: totals.calories, target: macros.calories, anim: calAnim, color: BAR_COLORS.calories, big: true, unit: 'ккал' },
    { key: 'proteins', label: 'Белки', eaten: totals.proteins, target: macros.proteins, anim: protAnim, color: BAR_COLORS.proteins, big: false, unit: 'г' },
    { key: 'fats', label: 'Жиры', eaten: totals.fats, target: macros.fats, anim: fatAnim, color: BAR_COLORS.fats, big: false, unit: 'г' },
    { key: 'carbs', label: 'Углеводы', eaten: totals.carbs, target: macros.carbs, anim: carbAnim, color: BAR_COLORS.carbs, big: false, unit: 'г' },
  ];

  return (
    <View style={[styles.container, Shadows.cardSoft, { backgroundColor: colors.cardNested, borderColor: colors.border }]}>
      {bars.map((bar) => (
        <View key={bar.key} style={[styles.barWrap, bar.big && styles.bigBarWrap]}>
          <View style={styles.barHeader}>
            <Text style={[styles.barLabel, { color: colors.text }]}>{bar.label}</Text>
            <Text style={[styles.barCount, { color: colors.icon }]}>
              {Math.round(bar.eaten)} / {Math.round(bar.target)} {bar.unit}
            </Text>
          </View>
          <View style={[styles.barTrack, bar.big && styles.bigBarTrack]}>
            <Animated.View
              style={[
                styles.barFill,
                bar.big ? styles.bigBarFill : styles.smallBarFill,
                {
                  backgroundColor: bar.color,
                  width: bar.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  barWrap: {
    marginBottom: 14,
  },
  bigBarWrap: {
    marginBottom: 20,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barLabel: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 14,
  },
  barCount: {
    fontFamily: fontFamily('regular'),
    fontSize: 13,
  },
  barTrack: {
    height: 10,
    backgroundColor: '#F0F3F7',
    borderRadius: 6,
    overflow: 'hidden',
  },
  bigBarTrack: {
    height: 18,
    borderRadius: 9,
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  bigBarFill: {
    borderRadius: 9,
  },
  smallBarFill: {
    borderRadius: 6,
  },
});
