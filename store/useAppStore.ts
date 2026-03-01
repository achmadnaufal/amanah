import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../constants/colors';

interface AppState {
  hasOnboarded: boolean;
  hasCompletedSetup: boolean;
  themeMode: ThemeMode;
  setOnboarded: () => void;
  setCompletedSetup: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      hasCompletedSetup: false,
      themeMode: 'system',
      setOnboarded: () => set({ hasOnboarded: true }),
      setCompletedSetup: () => set({ hasCompletedSetup: true }),
      setThemeMode: (mode: ThemeMode) => set({ themeMode: mode }),
    }),
    {
      name: 'amanah-app-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
