import { Colors, fontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GoalType, useUserStore } from '@/store/userStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';

const GOALS: {
  id: GoalType;
  title: string;
  color: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
}[] = [
  {
    id: 'lose',
    title: 'Похудеть',
    color: '#53B175',
    iconName: 'trending-down',
  },
  {
    id: 'maintain',
    title: 'Поддержать вес',
    color: '#F8A44C',
    iconName: 'balance',
  },
  {
    id: 'gain',
    title: 'Набрать массу',
    color: '#F7A593',
    iconName: 'fitness-center',
  },
  {
    id: 'manual',
    title: 'Свои БЖУ',
    color: '#D3B0E0',
    iconName: 'calculate',
  },
];

const PADDING = 20;
const CARD_GAP = 12;

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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

export default function GoalScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userProfile, setGoal } = useUserStore();
  const goal = userProfile.goal;

  const { width: screenWidth } = useWindowDimensions();
  const CARD_WIDTH = (screenWidth - PADDING * 2 - CARD_GAP) / 2;

  const handleSelect = (id: GoalType) => {
    setGoal(id);
    if (id === 'manual') {
      router.push('/onboarding/manual-macros');
    } else {
      router.replace('/onboarding/anthropometry');
    }
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
        <View style={{ flex: 1 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Цели</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Давайте настроим приложение под ваши цели
          </Text>
        </View>

        <View style={styles.grid}>
          {GOALS.map((item, index) => {
            const isSelected = goal === item.id;
            const bgColor = hexToRgba(item.color, 0.3);
            const borderColor = hexToRgba(item.color, 0.7);
            const isRight = index % 2 === 1;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  {
                    width: CARD_WIDTH,
                    marginBottom: CARD_GAP,
                    backgroundColor: isSelected ? item.color : bgColor,
                    borderColor: isSelected ? item.color : borderColor,
                    borderWidth: isSelected ? 2 : 1.5,
                  },
                  isRight && { marginLeft: CARD_GAP },
                ]}
                onPress={() => handleSelect(item.id)}
                activeOpacity={0.85}
              >
                <View style={styles.cardContent}>
                  <View style={styles.iconWrap}>
                    <MaterialIcons
                      name={item.iconName}
                      size={32}
                      color={isSelected ? '#FFFFFF' : item.color}
                    />
                  </View>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: isSelected ? '#FFFFFF' : item.color },
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
    paddingHorizontal: PADDING,
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
  content: {
    flex: 1,
    paddingHorizontal: PADDING,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PADDING,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: fontFamily('bold'),
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamily('regular'),
    fontSize: 16,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    maxWidth: 165,
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
});
