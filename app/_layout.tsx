import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    // Основные варианты TikTok Sans — используем готовые ttf из папки static
    'TikTokSans': require('../assets/fonts/TikTok_Sans/static/TikTokSans-Regular.ttf'),
    'TikTokSans-Light': require('../assets/fonts/TikTok_Sans/static/TikTokSans-Light.ttf'),
    'TikTokSans-Medium': require('../assets/fonts/TikTok_Sans/static/TikTokSans-Medium.ttf'),
    'TikTokSans-SemiBold': require('../assets/fonts/TikTok_Sans/static/TikTokSans-SemiBold.ttf'),
    'TikTokSans-Bold': require('../assets/fonts/TikTok_Sans/static/TikTokSans-Bold.ttf'),
    'TikTokSans-ExtraBold': require('../assets/fonts/TikTok_Sans/static/TikTokSans-ExtraBold.ttf'),
    'TikTokSans-Black': require('../assets/fonts/TikTok_Sans/static/TikTokSans-Black.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return (
    <View style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-food"
            options={{
              headerShown: false,
              presentation: 'transparentModal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </View>
  );
}
