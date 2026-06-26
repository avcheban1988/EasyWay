import { MainTabBackground } from '@/components/ui/main-tab-background';
import { ACTIVITY_LEVELS } from '@/constants/activityLevels';
import { Colors, fontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GenderType, GoalType, useUserStore } from '@/store/userStore';
import { useWeightStore } from '@/store/weightStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const GOALS: { id: GoalType; title: string; color: string }[] = [
  { id: 'lose', title: 'Похудеть', color: '#53B175' },
  { id: 'maintain', title: 'Поддержать вес', color: '#F8A44C' },
  { id: 'gain', title: 'Набрать массу', color: '#F7A593' },
  { id: 'manual', title: 'Свои БЖУ', color: '#D3B0E0' },
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    userProfile,
    setName,
    setGoal,
    setGender,
    setAge,
    setHeight,
    setWeight,
    setActivityLevel,
    calculateMacros,
    saveProfile,
  } = useUserStore();

  const { entries: weightEntries, addEntry: addWeightEntry, loadEntries: loadWeightEntries } = useWeightStore();

  const [localName, setLocalName] = useState(userProfile.name ?? '');
  const [localGoal, setLocalGoal] = useState<GoalType | null>(userProfile.goal);
  const [localGender, setLocalGender] = useState<GenderType | null>(userProfile.gender);
  const [localAge, setLocalAge] = useState(userProfile.age?.toString() ?? '25');
  const [localHeight, setLocalHeight] = useState(userProfile.height?.toString() ?? '170');
  const [localWeight, setLocalWeight] = useState(userProfile.weight?.toString() ?? '70');
  const [localActivity, setLocalActivity] = useState(userProfile.activityLevel || 'moderate');
  const [localManualProteins, setLocalManualProteins] = useState(userProfile.manualProteins?.toString() ?? '');
  const [localManualFats, setLocalManualFats] = useState(userProfile.manualFats?.toString() ?? '');
  const [localManualCarbs, setLocalManualCarbs] = useState(userProfile.manualCarbs?.toString() ?? '');

  const [goalsExpanded, setGoalsExpanded] = useState(false);
  const [paramsExpanded, setParamsExpanded] = useState(false);

  const [weightExpanded, setWeightExpanded] = useState(false);
  const [addingWeight, setAddingWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  const weightAnim = useRef(new Animated.Value(0)).current;

  const hasSyncedLocalRef = useRef(false);

  useEffect(() => {
    loadWeightEntries();
  }, [loadWeightEntries]);

  useEffect(() => {
    if (hasSyncedLocalRef.current) return;
    const hasAnyProfileData = !!(
      userProfile.isOnboarded || userProfile.goal || userProfile.gender ||
      userProfile.age !== null || userProfile.height !== null ||
      userProfile.weight !== null || userProfile.activityLevel ||
      userProfile.gymDaysPerWeek !== null
    );
    if (!hasAnyProfileData) return;
    hasSyncedLocalRef.current = true;
    setLocalName(userProfile.name ?? '');
    setLocalGoal(userProfile.goal);
    setLocalGender(userProfile.gender);
    setLocalAge(userProfile.age?.toString() ?? '25');
    setLocalHeight(userProfile.height?.toString() ?? '170');
    setLocalWeight(userProfile.weight?.toString() ?? '70');
    setLocalActivity(userProfile.activityLevel || 'moderate');
    setLocalManualProteins(userProfile.manualProteins?.toString() ?? '');
    setLocalManualFats(userProfile.manualFats?.toString() ?? '');
    setLocalManualCarbs(userProfile.manualCarbs?.toString() ?? '');
  }, [userProfile]);

  useEffect(() => {
    Animated.timing(weightAnim, {
      toValue: weightExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [weightExpanded, weightAnim]);

  const weightChartHeight = weightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 260],
  });

  // Автосохранение при любом изменении
  const autoSave = useRef(
    (() => {
      let timer: ReturnType<typeof setTimeout> | null = null;
      return () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          const s = useUserStore.getState();
          s.setName(localName);
          if (localGoal) s.setGoal(localGoal);
          if (localGender) s.setGender(localGender);
          s.setAge(Number(localAge));
          s.setHeight(Number(localHeight));
          s.setWeight(Number(localWeight));
          s.setActivityLevel(localActivity);
          if (localGoal === 'manual') {
            const p = Number(localManualProteins) || 0;
            const f = Number(localManualFats) || 0;
            const c = Number(localManualCarbs) || 0;
            if (p && f && c) s.setManualMacros(p, f, c);
          }
        }, 600);
      };
    })(),
  ).current;

  useEffect(() => { autoSave(); }, [localName, localGoal, localGender, localAge, localHeight, localWeight, localActivity, localManualProteins, localManualFats, localManualCarbs, autoSave]);

  const handleRecalculate = () => {
    const s = useUserStore.getState();
    if (localGoal) s.setGoal(localGoal);
    if (localGender) s.setGender(localGender);
    s.setAge(Number(localAge));
    s.setHeight(Number(localHeight));
    s.setWeight(Number(localWeight));
    s.setActivityLevel(localActivity);
    if (localGoal === 'manual') {
      const p = Number(localManualProteins) || 0;
      const f = Number(localManualFats) || 0;
      const c = Number(localManualCarbs) || 0;
      if (p && f && c) s.setManualMacros(p, f, c);
    } else {
      s.calculateMacros();
    }
    s.saveProfile();
    setParamsExpanded(false);
    const fresh = useUserStore.getState().dailyMacros;
    if (fresh) {
      Alert.alert('Новая норма', `Калории: ${fresh.calories} ккал\nБелки: ${fresh.proteins} г\nЖиры: ${fresh.fats} г\nУглеводы: ${fresh.carbs} г`);
    }
  };

  const handleAddWeight = async () => {
    const w = parseFloat(newWeight);
    if (!w || w < 30 || w > 300) return;
    await addWeightEntry(w);
    setNewWeight('');
    setAddingWeight(false);
  };

  // Данные для мини-графика
  const chartData = useMemo(() => {
    const sorted = [...weightEntries].sort((a, b) => (a.date < b.date ? -1 : 1));
    const maxW = Math.max(...sorted.map((e) => e.weight), 0);
    const minW = Math.min(...sorted.map((e) => e.weight), 0);
    const range = maxW - minW;
    return { sorted, maxW, minW, range };
  }, [weightEntries]);

  const latestWeight = weightEntries[0]?.weight ?? null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  const activeGoal = GOALS.find((g) => g.id === localGoal);
  const activeGoalName = GOALS.find((g) => g.id === localGoal)?.title ?? 'Не выбрано';

  const genderLabel = localGender === 'male' ? 'Мужской' : localGender === 'female' ? 'Женский' : '—';

  return (
    <MainTabBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Настройки профиля</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Измените параметры, чтобы пересчитать норму
          </Text>

          {/* Имя */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Имя</Text>
            <View style={styles.nameRow}>
              <TextInput
                style={[styles.nameInput, { color: colors.text, borderColor: '#53B175', backgroundColor: hexToRgba('#53B175', 0.06) }]}
                placeholder="Ваше имя"
                placeholderTextColor={colors.icon}
                value={localName}
                onChangeText={setLocalName}
              />
              <TouchableOpacity style={[styles.nameConfirmBtn, { backgroundColor: '#53B175' }]} onPress={() => { Keyboard.dismiss(); setName(localName); }} activeOpacity={0.85}>
                <MaterialIcons name="check" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.nameCancelBtn, { borderColor: colors.border }]} onPress={() => { Keyboard.dismiss(); setLocalName(userProfile.name ?? ''); }} activeOpacity={0.85}>
                <MaterialIcons name="close" size={20} color={colors.icon} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Цель — свёрнуто/развёрнуто */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Цель</Text>
            {!goalsExpanded && (
              <TouchableOpacity onPress={() => setGoalsExpanded(true)}>
                <Text style={[styles.changeText, { color: colors.primary }]}>Изменить</Text>
              </TouchableOpacity>
            )}
          </View>

          {!goalsExpanded ? (
            activeGoal && (
              <View style={[styles.goalRow, { backgroundColor: activeGoal.color, borderColor: activeGoal.color }]}>
                <MaterialIcons
                  name={activeGoal.id === 'lose' ? 'trending-down' : activeGoal.id === 'maintain' ? 'balance' : activeGoal.id === 'gain' ? 'fitness-center' : 'calculate'}
                  size={20} color="#fff"
                />
                <Text style={[styles.goalText, { color: '#fff' }]}>{activeGoal.title}</Text>
                <MaterialIcons name="check-circle" size={20} color="#fff" style={{ marginLeft: 'auto' }} />
              </View>
            )
          ) : (
            GOALS.map((g) => {
              const isActive = localGoal === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.goalRow,
                    {
                      backgroundColor: isActive ? g.color : hexToRgba(g.color, 0.15),
                      borderColor: isActive ? g.color : hexToRgba(g.color, 0.4),
                    },
                  ]}
                  onPress={() => { setLocalGoal(g.id); setGoalsExpanded(false); }}
                  activeOpacity={0.85}
                >
                  <MaterialIcons
                    name={g.id === 'lose' ? 'trending-down' : g.id === 'maintain' ? 'balance' : g.id === 'gain' ? 'fitness-center' : 'calculate'}
                    size={20}
                    color={isActive ? '#fff' : g.color}
                  />
                  <Text style={[styles.goalText, { color: isActive ? '#fff' : g.color }]}>{g.title}</Text>
                  {isActive && <MaterialIcons name="check-circle" size={20} color="#fff" style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              );
            })
          )}

          {/* Параметры — свёрнуто/развёрнуто */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Параметры</Text>
            {!paramsExpanded && (
              <TouchableOpacity onPress={() => setParamsExpanded(true)}>
                <Text style={[styles.changeText, { color: colors.primary }]}>Изменить</Text>
              </TouchableOpacity>
            )}
          </View>

          {!paramsExpanded ? (
            <View style={styles.paramsSummary}>
              {localGoal === 'manual' ? (
                <>
                  <View style={styles.paramChip}>
                    <Text style={[styles.paramChipValue, { color: colors.text }]}>Б: {localManualProteins || '—'} г</Text>
                  </View>
                  <View style={styles.paramChip}>
                    <Text style={[styles.paramChipValue, { color: colors.text }]}>Ж: {localManualFats || '—'} г</Text>
                  </View>
                  <View style={styles.paramChip}>
                    <Text style={[styles.paramChipValue, { color: colors.text }]}>У: {localManualCarbs || '—'} г</Text>
                  </View>
                  {localManualProteins && localManualFats && localManualCarbs && (
                    <View style={styles.paramChip}>
                      <Text style={[styles.paramChipValue, { color: '#D3B0E0' }]}>
                        ~{Number(localManualProteins || 0) * 4 + Number(localManualFats || 0) * 9 + Number(localManualCarbs || 0) * 4} ккал
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <View style={styles.paramChip}>
                    <Text style={[styles.paramChipValue, { color: colors.text }]}>{genderLabel}</Text>
                  </View>
                  <View style={styles.paramChip}>
                    <Text style={[styles.paramChipValue, { color: colors.text }]}>{localAge} лет</Text>
                  </View>
                  <View style={styles.paramChip}>
                    <Text style={[styles.paramChipValue, { color: colors.text }]}>{localHeight} см</Text>
                  </View>
                  <View style={styles.paramChip}>
                    <Text style={[styles.paramChipValue, { color: colors.text }]}>{localWeight} кг</Text>
                  </View>
                  <View style={styles.paramChip}>
                    <Text style={[styles.paramChipValue, { color: colors.text }]}>{ACTIVITY_LEVELS.find((a) => a.id === localActivity)?.title ?? '—'}</Text>
                  </View>
                </>
              )}
            </View>
          ) : localGoal === 'manual' ? (
            <>
              <Text style={[styles.sectionTitle, { color: '#D3B0E0' }]}>Свои БЖУ (на день)</Text>
              <View style={[styles.colorField, { borderLeftColor: '#53B175', backgroundColor: hexToRgba('#53B175', 0.08) }]}>
                <Text style={[styles.fieldLabel, { color: '#53B175' }]}>Белки (г)</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="numeric" value={localManualProteins} onChangeText={(v) => setLocalManualProteins(v.replace(/[^0-9.]/g, ''))} />
              </View>
              <View style={[styles.colorField, { borderLeftColor: '#F8A44C', backgroundColor: hexToRgba('#F8A44C', 0.08) }]}>
                <Text style={[styles.fieldLabel, { color: '#F8A44C' }]}>Жиры (г)</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="numeric" value={localManualFats} onChangeText={(v) => setLocalManualFats(v.replace(/[^0-9.]/g, ''))} />
              </View>
              <View style={[styles.colorField, { borderLeftColor: '#F7A593', backgroundColor: hexToRgba('#F7A593', 0.08) }]}>
                <Text style={[styles.fieldLabel, { color: '#F7A593' }]}>Углеводы (г)</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="numeric" value={localManualCarbs} onChangeText={(v) => setLocalManualCarbs(v.replace(/[^0-9.]/g, ''))} />
              </View>
              {(localManualProteins || localManualFats || localManualCarbs) && (
                <View style={[styles.autoCalories, { backgroundColor: hexToRgba('#D3B0E0', 0.1) }]}>
                  <Text style={[styles.autoCaloriesText, { color: '#D3B0E0' }]}>
                    ~ {Number(localManualProteins || 0) * 4 + Number(localManualFats || 0) * 9 + Number(localManualCarbs || 0) * 4} ккал
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Пол</Text>
              <View style={styles.genderRow}>
                {(['male', 'female'] as GenderType[]).map((g) => {
                  const isActive = localGender === g;
                  const color = g === 'male' ? '#53B175' : '#F7A593';
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderBtn, { backgroundColor: isActive ? color : hexToRgba(color, 0.15), borderColor: isActive ? color : hexToRgba(color, 0.4) }]}
                      onPress={() => setLocalGender(g)}
                      activeOpacity={0.85}
                    >
                      <MaterialIcons name={g === 'male' ? 'male' : 'female'} size={18} color={isActive ? '#fff' : color} />
                      <Text style={[styles.genderText, { color: isActive ? '#fff' : color }]}>{g === 'male' ? 'Мужской' : 'Женский'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[styles.colorField, { borderLeftColor: '#F8A44C', backgroundColor: hexToRgba('#F8A44C', 0.08) }]}>
                <Text style={[styles.fieldLabel, { color: '#F8A44C' }]}>Возраст</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="numeric" value={localAge} onChangeText={(v) => setLocalAge(v.replace(/[^0-9]/g, ''))} />
              </View>

              <View style={[styles.colorField, { borderLeftColor: '#F7A593', backgroundColor: hexToRgba('#F7A593', 0.08) }]}>
                <Text style={[styles.fieldLabel, { color: '#F7A593' }]}>Рост (см)</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="numeric" value={localHeight} onChangeText={(v) => setLocalHeight(v.replace(/[^0-9]/g, ''))} />
              </View>

              <View style={[styles.colorField, { borderLeftColor: '#D3B0E0', backgroundColor: hexToRgba('#D3B0E0', 0.08) }]}>
                <Text style={[styles.fieldLabel, { color: '#D3B0E0' }]}>Вес (кг)</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} keyboardType="numeric" value={localWeight} onChangeText={(v) => setLocalWeight(v.replace(/[^0-9.]/g, ''))} />
              </View>

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Активность</Text>
              <View style={styles.activityRow}>
                {ACTIVITY_LEVELS.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.chip, { backgroundColor: localActivity === opt.id ? colors.primary : 'transparent', borderColor: localActivity === opt.id ? colors.primary : colors.border }]}
                    onPress={() => setLocalActivity(opt.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.chipText, { color: localActivity === opt.id ? '#fff' : colors.text }]}>{opt.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          <TouchableOpacity style={[styles.recalcBtn, { backgroundColor: colors.primary }]} onPress={handleRecalculate} activeOpacity={0.85}>
            <Text style={styles.recalcBtnText}>Пересчитать норму</Text>
          </TouchableOpacity>
        </View>

        {/* Блок веса — разворачивающийся */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.weightHeader}
            onPress={() => setWeightExpanded((v) => !v)}
            activeOpacity={0.85}
          >
            <View style={styles.weightHeaderLeft}>
              <MaterialIcons name="monitor-weight" size={24} color={colors.primary} />
              <Text style={[styles.weightTitle, { color: colors.text }]}>
                Вес: <Text style={{ color: colors.primary, fontFamily: fontFamily('bold') }}>
                  {latestWeight ?? '—'} кг
                </Text>
              </Text>
            </View>
            {!weightExpanded && (
              <Text style={[styles.changeText, { color: colors.primary }]}>Изменить</Text>
            )}
          </TouchableOpacity>

          <Animated.View style={[styles.weightBody, { maxHeight: weightChartHeight, overflow: 'hidden' }]}>
            {/* Мини-график веса с горизонтальным скроллом */}
            {chartData.sorted.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
                <View style={[styles.chartContainer, { width: Math.max(320, chartData.sorted.length * 50) }]}>
                  <View style={styles.chart}>
                    {chartData.sorted.map((entry) => {
                      const pct = chartData.range > 0 ? ((entry.weight - chartData.minW) / chartData.range) : 0.5;
                      const barHeightPx = Math.max(Math.round(140 * pct), 8);
                      return (
                        <View key={entry.id} style={styles.chartCol}>
                          <Text style={[styles.chartBarLabel, { color: colors.icon }]}>{entry.weight}</Text>
                          <View style={[styles.chartBar, { height: barHeightPx, backgroundColor: '#53B175' }]} />
                          <Text style={[styles.chartDate, { color: colors.icon }]}>{formatDate(entry.date)}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <View style={styles.chartLabels}>
                    <Text style={[styles.chartRange, { color: colors.icon }]}>{chartData.maxW}</Text>
                    <Text style={[styles.chartRange, { color: colors.icon }]}>{chartData.minW}</Text>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <Text style={[styles.chartEmpty, { color: colors.icon }]}>
                Добавьте больше записей для отображения динамики
              </Text>
            )}

            {/* Кнопка добавления веса */}
            {!addingWeight ? (
              <TouchableOpacity
                style={[styles.addWeightBtn, { backgroundColor: hexToRgba('#53B175', 0.15), borderColor: '#53B175' }]}
                onPress={() => setAddingWeight(true)}
                activeOpacity={0.85}
              >
                <MaterialIcons name="add" size={18} color="#53B175" />
                <Text style={[styles.addWeightText, { color: '#53B175' }]}>Добавить вес</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.addWeightForm, { backgroundColor: colors.backgroundSoft, borderColor: colors.border }]}>
                <View style={styles.addWeightRow}>
                  <View style={styles.addWeightField}>
                    <Text style={[styles.addWeightLabel, { color: colors.text }]}>Вес (кг)</Text>
                    <TextInput
                      style={[styles.addWeightInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                      keyboardType="decimal"
                      placeholder="70.0"
                      placeholderTextColor={colors.icon}
                      value={newWeight}
                      onChangeText={setNewWeight}
                    />
                  </View>

                </View>
                <View style={styles.addWeightActions}>
                  <TouchableOpacity
                    style={[styles.addWeightSubmit, { backgroundColor: '#53B175' }]}
                    onPress={handleAddWeight}
                    disabled={!newWeight}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.addWeightSubmitText}>Добавить</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setAddingWeight(false)} style={styles.cancelBtn}>
                    <Text style={[styles.cancelText, { color: colors.icon }]}>Отмена</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </MainTabBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 20, paddingBottom: 40 },
  card: {
    borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 3,
  },
  title: { fontFamily: fontFamily('bold'), fontSize: 22, marginBottom: 4 },
  subtitle: { fontFamily: fontFamily('regular'), fontSize: 14, lineHeight: 20, marginBottom: 20 },
  sectionTitle: { fontFamily: fontFamily('semiBold'), fontSize: 16, marginTop: 16, marginBottom: 10 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, marginBottom: 10,
  },
  changeText: { fontFamily: fontFamily('semiBold'), fontSize: 13 },
  paramsSummary: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4,
  },
  paramChip: {
    paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 10,
  },
  paramChipValue: { fontFamily: fontFamily('medium'), fontSize: 13 },
  fieldGroup: { marginBottom: 4 },
  fieldLabel: { fontFamily: fontFamily('semiBold'), fontSize: 13, marginBottom: 6 },
  nameInput: {
    fontFamily: fontFamily('semiBold'), fontSize: 18,
    padding: Platform.select({ ios: 14, android: 12 }),
    borderWidth: 2, borderRadius: 12,
    textAlign: 'center', flex: 1,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameConfirmBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  nameCancelBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  input: {
    fontFamily: fontFamily('regular'), fontSize: 16,
    padding: Platform.select({ ios: 12, android: 10 }),
    borderWidth: 1, borderRadius: 10,
  },

  // Цели — по одной на строку
  goalRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1.5,
    marginBottom: 8,
  },
  goalText: { fontFamily: fontFamily('semiBold'), fontSize: 15, marginLeft: 10 },

  // Пол — два блока в ряд
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 12,
    borderRadius: 12, borderWidth: 1.5, gap: 6,
  },
  genderText: { fontFamily: fontFamily('semiBold'), fontSize: 14 },

  // Цветные поля
  colorField: {
    marginTop: 12, borderRadius: 10, borderLeftWidth: 3,
    paddingHorizontal: 12, paddingVertical: 10,
  },

  // Активность — чипсы
  activityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 1,
  },
  chipText: { fontFamily: fontFamily('medium'), fontSize: 13 },

  // Блок веса
  weightHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  weightHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  weightTitle: { fontFamily: fontFamily('semiBold'), fontSize: 17 },
  weightBody: { marginTop: 16 },

  // График
  chartScroll: { marginBottom: 12 },
  chartContainer: { flexDirection: 'row', height: 180 },
  chart: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  chartCol: { flex: 1, alignItems: 'center' },
  chartBar: { width: '80%', borderRadius: 6 },
  chartBarLabel: { fontFamily: fontFamily('semiBold'), fontSize: 10, marginBottom: 2 },
  chartDate: { fontFamily: fontFamily('regular'), fontSize: 10, marginTop: 4 },
  chartLabels: { width: 30, justifyContent: 'space-between', paddingLeft: 4 },
  chartRange: { fontFamily: fontFamily('regular'), fontSize: 10 },
  chartEmpty: { fontFamily: fontFamily('regular'), fontSize: 13, textAlign: 'center', marginBottom: 12 },

  // Добавление веса
  addWeightBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 10, borderWidth: 1, gap: 6,
  },
  addWeightText: { fontFamily: fontFamily('semiBold'), fontSize: 14 },
  addWeightForm: { borderRadius: 12, borderWidth: 1, padding: 14 },
  addWeightRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  addWeightField: { flex: 1 },
  addWeightLabel: { fontFamily: fontFamily('semiBold'), fontSize: 12, marginBottom: 4 },
  addWeightInput: {
    fontFamily: fontFamily('regular'), fontSize: 16,
    padding: Platform.select({ ios: 14, android: 12 }),
    borderWidth: 1.5, borderRadius: 10,
  },
  addWeightActions: { alignItems: 'center', gap: 10, marginTop: 4 },
  addWeightSubmit: {
    paddingVertical: 12, paddingHorizontal: 32,
    borderRadius: 10, alignItems: 'center', width: '100%',
  },
  addWeightSubmitText: {
    fontFamily: fontFamily('semiBold'), fontSize: 16, color: '#fff',
  },
  cancelBtn: { paddingVertical: 6 },
  cancelText: { fontFamily: fontFamily('regular'), fontSize: 14 },
  recalcBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  recalcBtnText: { fontFamily: fontFamily('semiBold'), fontSize: 16, color: '#fff' },
  autoCalories: { borderRadius: 8, padding: 8, alignItems: 'center', marginBottom: 8 },
  autoCaloriesText: { fontFamily: fontFamily('semiBold'), fontSize: 14 },
});
