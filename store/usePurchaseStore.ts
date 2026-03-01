import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PurchaseState {
  isPro: boolean;
  setPro: (value: boolean) => void;
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set) => ({
      isPro: false,
      setPro: (value) => set({ isPro: value }),
    }),
    {
      name: 'amanah-purchase-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
