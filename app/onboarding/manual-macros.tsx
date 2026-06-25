import { Colors, fontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

function PressableScale({
  children,
  style,
  onPress,
  ...props
}: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  [key: string]: any;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <TouchableOpacity
      style={style}
      activeOpacity={0.85}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      {...props}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function ManualMacrosScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userProfile, setManualMacros } = useUserStore();

  const [proteinsStr, setProteinsStr] = useState(
    userProfile.manualProteins?.toString() ?? '',
  );
  const [fatsStr, setFatsStr] = useState(
    userProfile.manualFats?.toString() ?? '',
  );
  const [carbsStr, setCarbsStr] = useState(
    userProfile.manualCarbs?.toString() ?? '',
  );

  const proteins = useMemo(() => parseFloat(proteinsStr) || 0, [proteinsStr]);
  const fats = useMemo(() => parseFloat(fatsStr) || 0, [fatsStr]);
  const carbs = useMemo(() => parseFloat(carbsStr) || 0, [carbsStr]);

  const calories = useMemo(
    () => proteins * 4 + fats * 9 + carbs * 4,
    [proteins, fats, carbs],
  );

  const hasValues = proteins > 0 || fats > 0 || carbs > 0;

  const handleSave = () => {
    if (!hasValues) return;
    setManualMacros(proteins, fats, carbs);
    router.replace('/onboarding/anthropometry');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Кнопка назад */}
      <View style={styles.topBar}>
        <PressableScale onPress={() => router.back()}>
          <View style={[styles.backBtn, { backgroundColor: colors.card }]}>
            <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
          </View>
        </PressableScale>
        <Text style={[styles.topTitle, { color: colors.text }]}>
          Свои БЖУ
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          Укажите свои нормы БЖУ в граммах, калории рассчитаются автоматически
        </Text>

        {/* Поле: Белки */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Белки, г
          </Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.icon}
              keyboardType="numeric"
              value={proteinsStr}
              onChangeText={setProteinsStr}
            />
            <View
              style={[styles.inputBadge, { backgroundColor: colors.proteins }]}
            >
              <Text style={styles.inputBadgeText}>Б</Text>
            </View>
          </View>
        </View>

        {/* Поле: Жиры */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Жиры, г
          </Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.icon}
              keyboardType="numeric"
              value={fatsStr}
              onChangeText={setFatsStr}
            />
            <View style={[styles.inputBadge, { backgroundColor: colors.fats }]}>
              <Text style={styles.inputBadgeText}>Ж</Text>
            </View>
          </View>
        </View>

        {/* Поле: Углеводы */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Углеводы, г
          </Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.icon}
              keyboardType="numeric"
              value={carbsStr}
              onChangeText={setCarbsStr}
            />
            <View style={[styles.inputBadge, { backgroundColor: colors.carbs }]}>
              <Text style={styles.inputBadgeText}>У</Text>
            </View>
          </View>
        </View>

        {/* Блок с калориями */}
        <View
          style={[
            styles.caloriesCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={[styles.caloriesLabel, { color: colors.icon }]}>
            Калории
          </Text>
          <Text style={[styles.caloriesValue, { color: colors.primary }]}>
            {Math.round(calories)} ккал
          </Text>
          {hasValues && (
            <Text style={[styles.caloriesFormula, { color: colors.icon }]}>
              {proteins}×4 + {fats}×9 + {carbs}×4
            </Text>
          )}
        </View>

        {/* Кнопка сохранить */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: colors.primary },
            !hasValues && { opacity: 0.5 },
          ]}
          onPress={handleSave}
          disabled={!hasValues}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>Сохранить и продолжить</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  backArrow: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 22,
  },
  topTitle: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontFamily: fontFamily('regular'),
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily('regular'),
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  inputBadgeText: {
    fontFamily: fontFamily('bold'),
    fontSize: 16,
    color: '#FFFFFF',
  },
  caloriesCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  caloriesLabel: {
    fontFamily: fontFamily('regular'),
    fontSize: 14,
    marginBottom: 6,
  },
  caloriesValue: {
    fontFamily: fontFamily('bold'),
    fontSize: 36,
    lineHeight: 44,
  },
  caloriesFormula: {
    fontFamily: fontFamily('regular'),
    fontSize: 12,
    marginTop: 6,
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 16,
    color: '#FFFFFF',
  },
});
