import { Colors, fontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useRef } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

type TabRoute = {
  key: string;
  title: string;
};

const TABS: (TabRoute & { icon: keyof typeof MaterialIcons.glyphMap })[] = [
  { key: 'index', title: 'Главная', icon: 'home' },
  { key: 'explore', title: 'Рецепты', icon: 'menu-book' },
  { key: 'profile', title: 'Профиль', icon: 'person' },
];

const COLORS = ['#53B175', '#F8A44C', '#D3B0E0'];

export function GlassTabBar({
  state,
  navigation,
}: {
  state: { index: number; routes: TabRoute[] };
  navigation: { emit: (event: any) => void; navigate: (key: string) => void };
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { width: screenWidth } = useWindowDimensions();
  const WRAP_PADDING = 12; // должен совпадать с paddingHorizontal в outerWrap
  const innerWidth = screenWidth - WRAP_PADDING * 2;
  const tabWidth = innerWidth / TABS.length;
  const INDICATOR_MARGIN = 16;
  const indicatorWidth = tabWidth - INDICATOR_MARGIN * 2;

  const slideAnim = useRef(new Animated.Value(0)).current;
  const prevIndexRef = useRef(state.index);

  React.useEffect(() => {
    const target = state.index * tabWidth + INDICATOR_MARGIN;
    // Начальная установка без анимации
    if (prevIndexRef.current !== state.index) {
      Animated.spring(slideAnim, {
        toValue: target,
        useNativeDriver: false,
        tension: 80,
        friction: 10,
      }).start();
      prevIndexRef.current = state.index;
    } else {
      // Ресайз окна — без анимации
      slideAnim.setValue(target);
    }
  }, [state.index, tabWidth, screenWidth, slideAnim]);

  return (
    <View style={styles.outerWrap}>
      <View style={[styles.container, { backgroundColor: 'rgba(225,228,240,0.9)' }]}>
        {/* Ползунок-индикатор */}
        <Animated.View
          style={[
            styles.indicator,
            {
              width: indicatorWidth,
              left: slideAnim,
              backgroundColor: COLORS[state.index % COLORS.length],
            },
          ]}
        />

        <View style={styles.tabsRow}>
          {TABS.map((tab, index) => {
            const isActive = state.index === index;
            const color = isActive ? '#FFFFFF' : colors.icon;

            return (
              <Pressable
                key={tab.key}
                style={styles.tab}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: tab.key,
                    canPreventDefault: true,
                  });
                  if (!event.defaultPrevented) {
                    navigation.navigate(tab.key);
                  }
                }}
              >
                <MaterialIcons name={tab.icon} size={22} color={color} />
                <Text
                  style={[
                    styles.label,
                    {
                      color: isActive ? COLORS[state.index % COLORS.length] : colors.icon,
                      fontFamily: isActive ? fontFamily('semiBold') : fontFamily('regular'),
                    },
                  ]}
                >
                  {tab.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    marginTop: -20,
  },
  container: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingBottom: 8,
    borderTopWidth: 0,
    // Тень для стеклянного эффекта
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  tabsRow: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
  indicator: {
    position: 'absolute',
    top: 6,
    height: 44,
    borderRadius: 12,
    zIndex: -1,
  },
});
