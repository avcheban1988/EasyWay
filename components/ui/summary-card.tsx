import { InfoModal } from '@/components/ui/info-modal';
import { Colors, Shadows, Typography, fontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useFoodStore } from '@/store/foodStore';
import { useUserStore } from '@/store/userStore';
import { useWeightStore } from '@/store/weightStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export function SummaryCard() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { account } = useAuthStore();
  const { userProfile, dailyMacros } = useUserStore();
  const { foodEntries } = useFoodStore();
  const { entries: weightEntries, loadEntries } = useWeightStore();

  const [expanded, setExpanded] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpAnimatedOnce, setHelpAnimatedOnce] = useState(false);
  const helpPulse = useRef(new Animated.Value(1)).current;

  const anim = useRef(new Animated.Value(0)).current; // 0 collapsed, 1 expanded

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [expanded, anim]);

  useEffect(() => {
    if (expanded && !helpAnimatedOnce) {
      // longer visible pulsing + glow to attract attention (repeat several times)
      const seq = Animated.sequence([
        Animated.timing(helpPulse, { toValue: 1.25, duration: 600, useNativeDriver: false }),
        Animated.timing(helpPulse, { toValue: 0.9, duration: 300, useNativeDriver: false }),
        Animated.timing(helpPulse, { toValue: 1.18, duration: 500, useNativeDriver: false }),
        Animated.timing(helpPulse, { toValue: 1, duration: 300, useNativeDriver: false }),
      ]);

      // run a few loops so it's noticeable
      Animated.loop(seq, { iterations: 4 }).start(() => setHelpAnimatedOnce(true));
    }
  }, [expanded, helpAnimatedOnce, helpPulse]);

  const name = useMemo(() => {
    if (userProfile.name?.trim()) return userProfile.name.trim();
    if (!account?.email) return 'друг';
    const part = account.email.split('@')[0];
    return part.charAt(0).toUpperCase() + part.slice(1);
  }, [account, userProfile.name]);

  // compute last 7 days sums for macros
  const weekSums = useMemo(() => {
    const sums = { carbs: 0, proteins: 0, fats: 0 };
    const today = new Date();
    const dayAgo = (d: Date, n: number) => {
      const dd = new Date(d);
      dd.setDate(dd.getDate() - n);
      return dd.toISOString().slice(0, 10);
    };
    const last7 = new Set<string>();
    for (let i = 0; i < 7; i++) last7.add(dayAgo(today, i));

    for (const e of foodEntries) {
      if (last7.has(e.date)) {
        sums.carbs += e.carbs;
        sums.proteins += e.proteins;
        sums.fats += e.fats;
      }
    }
    return sums;
  }, [foodEntries]);

  const weeklyTargets = useMemo(() => {
    if (!dailyMacros) return { carbs: 1, proteins: 1, fats: 1 };
    return {
      carbs: Math.max(1, dailyMacros.carbs * 7),
      proteins: Math.max(1, dailyMacros.proteins * 7),
      fats: Math.max(1, dailyMacros.fats * 7),
    };
  }, [dailyMacros]);

  const carbsProgress = Math.min(1, weekSums.carbs / weeklyTargets.carbs);
  const proteinsProgress = Math.min(1, weekSums.proteins / weeklyTargets.proteins);
  const fatsProgress = Math.min(1, weekSums.fats / weeklyTargets.fats);

  const animHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [175, 260],
  });

  const daysUsed = useMemo(() => {
    if (!account) return 0;
    const created = new Date(account.createdAt);
    const diff = Math.ceil((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [account]);

  const daysLabel = useMemo(() => {
    const d = daysUsed;
    if (d % 10 === 1 && d % 100 !== 11) return 'день';
    if ([2,3,4].includes(d % 10) && !(d % 100 >= 12 && d % 100 <= 14)) return 'дня';
    return 'дней';
  }, [daysUsed]);

  const recordedDays = useMemo(() => {
    const set = new Set<string>();
    for (const e of foodEntries) set.add(e.date);
    return set.size;
  }, [foodEntries]);

  const latestWeight = weightEntries[0]?.weight ?? null;
  const prevWeight = weightEntries[1]?.weight ?? null;
  const weightDelta = latestWeight !== null && prevWeight !== undefined ? Math.round((latestWeight - prevWeight) * 10) / 10 : 0;

  return (
    <Animated.View style={[styles.card, Shadows.card, { backgroundColor: colors.card, borderColor: colors.border, height: animHeight }]}> 
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.text }]}>EasyWay</Text>
          <Text style={[styles.greeting, { color: colors.icon }]}>Привет, {name} 👋</Text>
        </View>
        <View style={styles.logoWrap}>
          <Image source={require('../../assets/icons/logo.png')} style={styles.logo} />
        </View>
        
      </View>

      <View style={styles.middle}>
        {expanded && (
          <View style={styles.middleHeader}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={() => setHelpOpen(true)}
              style={styles.helpButton}
              activeOpacity={0.9}
            >
              <Animated.Text
                style={{
                  transform: [{ scale: helpPulse }],
                  fontSize: 16,
                  fontFamily: fontFamily('bold', '24'),
                  color: colors.tint,
                  opacity: helpPulse.interpolate({ inputRange: [0.9, 1.25], outputRange: [0.7, 1] }),
                  textShadowRadius: helpPulse.interpolate({ inputRange: [0.9, 1.25], outputRange: [0, 12] }),
                  textShadowColor: colors.tint,
                }}
              >
                ?
              </Animated.Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity activeOpacity={0.9} onPress={() => setExpanded((v) => !v)} style={styles.expandTouch}>
          {!expanded ? (
            <>
              {/** collapsed order: show bottom stats first, then compact bars */}
              <View style={styles.bottomRow}> 
                <View style={styles.statItemLeft}>
                  <Text style={[styles.statTextItalic, { color: colors.icon }]}>Результаты недели</Text>
                </View>
                <TouchableOpacity style={styles.statItemRight} onPress={() => setInfoOpen(true)}>
                  <Text style={[styles.statTextItalic, { color: colors.icon }]}>Вес: <Text style={[styles.highlight, { color: colors.tint }]}>{latestWeight ?? '—'} kg</Text>{latestWeight !== null && prevWeight !== undefined ? <Text style={{ color: colors.icon }}> ({weightDelta > 0 ? '+' : ''}{weightDelta} kg)</Text> : null}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.compactRow}>
                <View style={styles.compactItem}>
                  <View style={styles.compactBarTrack}>
                    <View style={[styles.compactBarFill, { backgroundColor: '#FF9800', width: `${carbsProgress * 100}%` }]} />
                  </View>
                </View>

                <View style={styles.compactItem}>
                  <View style={styles.compactBarTrack}>
                    <View style={[styles.compactBarFill, { backgroundColor: '#66BB6A', width: `${proteinsProgress * 100}%` }]} />
                  </View>
                </View>

                <View style={styles.compactItem}>
                  <View style={styles.compactBarTrack}>
                    <View style={[styles.compactBarFill, { backgroundColor: '#E53935', width: `${fatsProgress * 100}%` }]} />
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.barRow}>
                <Text style={[styles.barLabel, { color: colors.text }]}>Углеводы</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { backgroundColor: '#FF9800', width: `${carbsProgress * 100}%` }]} />
                </View>
                <Text style={[styles.barValue, { color: colors.icon }]}>{weekSums.carbs} / {weeklyTargets.carbs}</Text>
              </View>

              <View style={styles.barRow}>
                <Text style={[styles.barLabel, { color: colors.text }]}>Белки</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { backgroundColor: '#66BB6A', width: `${proteinsProgress * 100}%` }]} />
                </View>
                <Text style={[styles.barValue, { color: colors.icon }]}>{weekSums.proteins} / {weeklyTargets.proteins}</Text>
              </View>

              <View style={styles.barRow}>
                <Text style={[styles.barLabel, { color: colors.text }]}>Жиры</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { backgroundColor: '#E53935', width: `${fatsProgress * 100}%` }]} />
                </View>
                <Text style={[styles.barValue, { color: colors.icon }]}>{weekSums.fats} / {weeklyTargets.fats}</Text>
              </View>

              <View style={styles.bottomRow}>
                <View style={styles.statItemLeft}>
                  <Text style={[styles.statTextItalic, { color: colors.icon }]}>Результаты недели</Text>
                </View>
                <TouchableOpacity style={styles.statItemRight} onPress={() => setInfoOpen(true)}>
                  <Text style={[styles.statTextItalic, { color: colors.icon }]}>Вес: <Text style={[styles.highlight, { color: colors.tint }]}>{latestWeight ?? '—'} kg</Text>{latestWeight !== null && prevWeight !== undefined ? <Text style={{ color: colors.icon }}> ({weightDelta > 0 ? '+' : ''}{weightDelta} kg)</Text> : null}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Анимированная стрелка */}
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          style={styles.chevronWrap}
          activeOpacity={0.7}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            }}
          >
            <MaterialIcons name="expand-more" size={28} color={colors.icon} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      

      <InfoModal visible={infoOpen} onClose={() => setInfoOpen(false)} title="История веса">
        {weightEntries.length === 0 ? (
          <Text style={{ ...Typography.body, color: colors.text }}>
            Данных ещё нет. Добавьте текущий вес в профиле.
          </Text>
        ) : (
          weightEntries.map((w) => (
            <View key={w.id} style={{ paddingVertical: 6 }}>
              <Text style={{ ...Typography.bodySemiBold, color: colors.text }}>{w.weight} kg</Text>
              <Text style={{ ...Typography.caption, color: colors.icon }}>{w.date}</Text>
            </View>
          ))
        )}
      </InfoModal>

      <InfoModal visible={helpOpen} onClose={() => setHelpOpen(false)} title="О недельных целях">
        <Text style={{ ...Typography.body, color: colors.text }}>
          Здесь показывается суммарное количество углеводов, белков и жиров за последние 7 дней. Цель — приблизиться к недельной норме (сумма дневных целей × 7). Если в какой-то день вы переели или недоели — не переживайте: важна общая картина к концу недели.
        </Text>
      </InfoModal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    ...Typography.title,
  },
  greeting: {
    ...Typography.label,
    fontFamily: Typography.body.fontFamily,
    marginTop: 2,
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  middle: {
    marginVertical: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barLabel: {
    ...Typography.caption,
    width: 90,
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: '#F0F3F7',
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 8,
  },
  barValue: {
    ...Typography.caption,
    width: 90,
    textAlign: 'right',
  },
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  compactItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  compactBarTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#F0F3F7',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  compactBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  compactLabel: {
    ...Typography.caption,
    textAlign: 'center',
  },
  middleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  helpButton: {
    width: 36,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandTouch: {
    // wrapper for bars that toggles expand/collapse
  },
  statItemLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  statItemRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  statTextItalic: {
    ...Typography.label,
    fontFamily: Typography.body.fontFamily,
    fontStyle: 'italic',
  },
  highlight: {
    fontFamily: fontFamily('bold', '24'),
    fontStyle: 'italic',
  },
  bottomRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.caption,
  },
  statValue: {
    ...Typography.bodySemiBold,
    marginTop: 4,
  },
  chevronWrap: {
    alignItems: 'center',
    paddingVertical: 4,
    marginTop: -4,
  },
});

export default SummaryCard;
