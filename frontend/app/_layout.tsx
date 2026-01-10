import { useEffect, useState } from 'react';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useAuthStore } from '../src/stores';
import { LoadingSpinner } from '../src/components/ui/LoadingSpinner';
import FloatingAIButton from '../src/components/FloatingAIButton';

// Custom light theme matching our app colors
const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B35',
    background: '#FFFFFF',
    card: '#F9FAFB',
    text: '#111827',
    border: '#E5E7EB',
    notification: '#EF4444',
  },
};

export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setIsReady(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (isReady) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isReady, isAuthenticated]);

  if (!isReady || isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={CustomLightTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="plans/create" />
            <Stack.Screen name="plans/[id]/index" />
            <Stack.Screen name="plans/[id]/chat" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="plans/[id]/map" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="plans/[id]/route" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="plans/[id]/activities/create" options={{ presentation: 'modal' }} />
            <Stack.Screen name="plans/[id]/activities/[activityId]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="plans/[id]/expenses/index" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="plans/[id]/expenses/create" options={{ presentation: 'modal' }} />
            <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="join" options={{ presentation: 'modal' }} />
            <Stack.Screen name="settings/password" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
          {/* AI Assistant Floating Button - available across all screens */}
          {isAuthenticated && <FloatingAIButton />}
          <StatusBar style="dark" />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
