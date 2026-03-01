import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  hasOnboarded: boolean;
  setOnboarded: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      setOnboarded: () => set({ hasOnboarded: true }),
    }),
    {
      name: 'amanah-app-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
