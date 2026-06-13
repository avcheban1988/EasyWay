import { MainTabBackground } from '@/components/ui/main-tab-background';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <MainTabBackground>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
        <Text style={[styles.subtext, { color: colors.icon }]}>Здесь будут новые возможности: рецепты, анализ фото и статистика.</Text>
      </View>
    </MainTabBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'transparent' },
  title: { ...Typography.display, marginBottom: 12 },
  subtext: { ...Typography.body, textAlign: 'center' },
});
