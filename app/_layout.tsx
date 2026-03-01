import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeProvider } from '../constants/theme';
import { initPurchases } from '../utils/purchases';

export default function RootLayout() {
  useEffect(() => {
    initPurchases();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ErrorBoundary>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="privacy" />
            <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          </Stack>
        </ErrorBoundary>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
