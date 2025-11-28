import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import Constants from 'expo-constants';
import React, { useEffect } from 'react';

import { MealPlanProvider } from '@/components/MealPlanContext';
import { ThemeProvider as CustomThemeProvider } from '@/components/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import GeminiService from '@/services/GeminiService';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    try {
      const extra = (Constants.expoConfig && (Constants.expoConfig.extra as any)) || (Constants.manifest && (Constants.manifest.extra as any));
      const geminiKey = extra?.GEMINI_API_KEY;
      if (geminiKey) {
        try {
          GeminiService.setApiKey(geminiKey);
          console.log('Gemini API key loaded from expo.extra');
        } catch (err) {
          console.warn('Failed to set Gemini API key from expo.extra', err);
        }
      }
    } catch (e) {
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <CustomThemeProvider>
        <MealPlanProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </MealPlanProvider>
      </CustomThemeProvider>
    </ThemeProvider>
  );
}
