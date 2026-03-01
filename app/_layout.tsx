import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { initPurchases } from '../utils/purchases';

export default function RootLayout() {
  useEffect(() => {
    initPurchases();
  }, []);

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      </Stack>
    </ErrorBoundary>
  );
}
