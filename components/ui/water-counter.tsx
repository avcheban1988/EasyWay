import { Colors, fontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWaterStore } from '@/store/waterStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const GLASS_ML = 250;
const WATER_COLOR = '#4FC3F7';
const GLASS_COLORS = ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3'];

export function WaterCounter() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { ml, targetMl, load, addWater } = useWaterStore();
  const [showSelector, setShowSelector] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
      { iterations: 3 }
    ).start();
  }, [ml, pulseAnim]);

  const progress = Math.min(1, ml / targetMl);
  const fullGlasses = Math.floor(ml / GLASS_ML);
  const partialFill = (ml % GLASS_ML) / GLASS_ML;

  const glasses = useMemo(() => {
    const items = [];
    const totalGlasses = Math.ceil(targetMl / GLASS_ML);
    for (let i = 0; i < totalGlasses; i++) {
      const glassIndex = i % GLASS_COLORS.length;
      let fill = 0;
      if (i < fullGlasses) fill = 1;
      else if (i === fullGlasses) fill = partialFill;
      items.push({ index: i, fill, color: GLASS_COLORS[glassIndex] });
    }
    return items;
  }, [fullGlasses, partialFill]);

  const quickAmounts = [250, 500, 750];

  return (
    <View style={[styles.card, { backgroundColor: hexToRgba('#4FC3F7', 0.18), borderColor: '#4FC3F7' }]}>
      <View style={styles.header}>
        <MaterialIcons name="water-drop" size={22} color="#4FC3F7" />
        <Text style={[styles.title, { color: '#0288D1' }]}>Вода</Text>
        <Text style={[styles.mlText, { color: '#0288D1' }]}>
          {ml} / {targetMl} мл
        </Text>
      </View>

      {/* Стаканы */}
      <View style={styles.glassesRow}>
        {glasses.map((g) => (
          <View key={g.index} style={styles.glassWrap}>
            <View style={[styles.glass, { borderColor: '#4FC3F7' }]}>
              <View
                style={[
                  styles.glassFill,
                  {
                    height: `${g.fill * 100}%`,
                    backgroundColor: g.fill > 0 ? WATER_COLOR : 'transparent',
                  },
                ]}
              />
            </View>
            <Text style={[styles.glassLabel, { color: '#0288D1' }]}>{GLASS_ML}</Text>
          </View>
        ))}
      </View>

      {/* Шкала прогресса */}
      <View style={[styles.progressTrack, { backgroundColor: hexToRgba('#4FC3F7', 0.15) }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: '#4FC3F7' }]} />
      </View>

      {/* Кнопки быстрого добавления */}
      {!showSelector ? (
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: '#4FC3F7' }]}
          onPress={() => setShowSelector(true)}
          activeOpacity={0.85}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Добавить воду</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.selectorRow}>
          {quickAmounts.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[styles.quickBtn, { backgroundColor: hexToRgba('#4FC3F7', 0.15), borderColor: '#4FC3F7' }]}
              onPress={async () => {
                await addWater(amount);
                setShowSelector(false);
              }}
              activeOpacity={0.85}
            >
              <MaterialIcons name="water-drop" size={18} color="#4FC3F7" />
              <Text style={[styles.quickBtnText, { color: '#0288D1' }]}>{amount} мл</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: 'transparent', borderColor: '#ccc' }]}
            onPress={() => setShowSelector(false)}
            activeOpacity={0.85}
          >
            <MaterialIcons name="close" size={18} color="#999" />
          </TouchableOpacity>
        </View>
      )}

      {ml > 0 && (
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={async () => {
            await useWaterStore.getState().setWater(0);
            setShowSelector(false);
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.resetText, { color: '#E53935' }]}>Сбросить</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14,
  },
  title: { fontFamily: fontFamily('semiBold'), fontSize: 17, flex: 1 },
  mlText: { fontFamily: fontFamily('semiBold'), fontSize: 14 },

  // Стаканы
  glassesRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14 },
  glassWrap: { alignItems: 'center', gap: 4 },
  glass: {
    width: 30, height: 40,
    borderWidth: 2, borderRadius: 4,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  glassFill: { width: '100%', position: 'absolute', bottom: 0 },
  glassLabel: { fontFamily: fontFamily('regular'), fontSize: 9 },

  // Прогресс
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', borderRadius: 4 },

  // Кнопки
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, gap: 6,
  },
  addBtnText: { fontFamily: fontFamily('semiBold'), fontSize: 15, color: '#fff' },
  selectorRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  quickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1,
  },
  quickBtnText: { fontFamily: fontFamily('semiBold'), fontSize: 13 },
  resetBtn: { alignItems: 'center', marginTop: 8 },
  resetText: { fontFamily: fontFamily('regular'), fontSize: 12 },
});
