import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';

export interface ZakatAssets {
  uangTunai: number;
  tabungan: number;
  emasGram: number;
  investasi: number;
  piutang: number;
}

export interface ZakatLiabilities {
  hutangJangkaPendek: number;
}

export interface ZakatPayment {
  id: string;
  date: string;
  amount: number;
  note?: string;
}

interface ZakatState {
  assets: ZakatAssets;
  liabilities: ZakatLiabilities;
  goldPricePerGram: number;
  payments: ZakatPayment[];
  hawlStartDate: string | null; // ISO string — when assets first exceeded nisab
  setAssets: (assets: Partial<ZakatAssets>) => void;
  setLiabilities: (liabilities: Partial<ZakatLiabilities>) => void;
  setGoldPrice: (price: number) => void;
  addPayment: (payment: Omit<ZakatPayment, 'id'>) => void;
  updateHawlTracking: (isAboveNisab: boolean) => void;
  resetHawl: () => void;
}

export const useZakatStore = create<ZakatState>()(
  persist(
    (set) => ({
      assets: { uangTunai: 0, tabungan: 0, emasGram: 0, investasi: 0, piutang: 0 },
      liabilities: { hutangJangkaPendek: 0 },
      goldPricePerGram: 1_200_000,
      payments: [],
      hawlStartDate: null,
      setAssets: (a) => set((s) => ({ assets: { ...s.assets, ...a } })),
      setLiabilities: (l) => set((s) => ({ liabilities: { ...s.liabilities, ...l } })),
      setGoldPrice: (price) => set({ goldPricePerGram: price }),
      addPayment: (p) => set((s) => ({
        payments: [{ ...p, id: randomUUID() }, ...s.payments],
        // Reset hawl after payment
        hawlStartDate: new Date().toISOString(),
      })),
      updateHawlTracking: (isAboveNisab) => {
        set((s) => {
          if (isAboveNisab && !s.hawlStartDate) {
            // Assets just crossed nisab — start hawl
            return { hawlStartDate: new Date().toISOString() };
          }
          if (!isAboveNisab && s.hawlStartDate) {
            // Assets dropped below nisab — reset hawl
            return { hawlStartDate: null };
          }
          return {};
        });
      },
      resetHawl: () => set({ hawlStartDate: null }),
    }),
    {
      name: 'amanah-zakat-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
