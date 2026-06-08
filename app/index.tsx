import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRootNavigationState, useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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
      await checkAuth();
      const accountEmail = useAuthStore.getState().account?.email ?? null;
      await loadProfile(accountEmail);
      router.replace('/onboarding/welcome');
    };

    initializeApp();
  }, [checkAuth, loadProfile, rootNavigationState?.key, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.tint} />
    </View>
  );
}
