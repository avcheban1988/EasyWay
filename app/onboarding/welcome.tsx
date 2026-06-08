import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRootNavigationState, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    let cancelled = false;
    const animation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished && !cancelled) {
        router.replace('/onboarding/auth');
      }
    });

    return () => {
      cancelled = true;
      animation.stop();
    };
  }, [fadeAnim, rootNavigationState?.key, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconContainer}>
          <Image
            source={require('../../assets/icons/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: colors.text }]}>Добро пожаловать в EasyWay</Text>
        </View>
        <Image
          source={require('../../assets/icons/loader.gif')}
          style={styles.loaderGif}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  loaderGif: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'TikTokSans',
    textAlign: 'center',
    marginBottom: 12,
  },
  loaderHint: {
    marginTop: 20,
    fontSize: 14,
    fontFamily: 'TikTokSans',
  },
});