import { Typography } from '@/constants/fonts';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { getNextOnboardingRoute } from '@/utils/get-next-route';
import { useRootNavigationState, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { loadProfile } = useUserStore();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    const initializeApp = async () => {
      const { account, token } = useAuthStore.getState();
      if (!account && !token) {
        router.replace('/onboarding/auth');
        return;
      }

      await checkAuth();
      const freshToken = useAuthStore.getState().token;
      if (!freshToken) {
        router.replace('/onboarding/auth');
        return;
      }

      await loadProfile();

      const profile = useUserStore.getState().userProfile;
      if (profile.isOnboarded) {
        router.replace('/(tabs)');
        return;
      }

      const next = getNextOnboardingRoute(profile);
      router.replace(next);
    };

    initializeApp();
  }, [checkAuth, loadProfile, rootNavigationState?.key, router]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.primary }]}>
      <View style={styles.centerBlock}>
        <Image source={require('../assets/images/Logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.textBlock}>
          <Text style={[Typography.display, styles.title]}>EasyWay</Text>
          <Text style={[Typography.caption, styles.subtitle]}>счетчик калорий</Text>
        </View>
      </View>
      <View style={styles.loaderWrap}>
        <ActivityIndicator color="#fff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centerBlock: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 88,
    height: 88,
    marginRight: 16,
  },
  textBlock: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 6,
    opacity: 0.9,
  },
  loaderWrap: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
