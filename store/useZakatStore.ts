import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  setAssets: (assets: Partial<ZakatAssets>) => void;
  setLiabilities: (liabilities: Partial<ZakatLiabilities>) => void;
  setGoldPrice: (price: number) => void;
  addPayment: (payment: Omit<ZakatPayment, 'id'>) => void;
}

export const useZakatStore = create<ZakatState>()(
  persist(
    (set) => ({
      assets: { uangTunai: 0, tabungan: 0, emasGram: 0, investasi: 0, piutang: 0 },
      liabilities: { hutangJangkaPendek: 0 },
      goldPricePerGram: 1_200_000,
      payments: [],
      setAssets: (a) => set((s) => ({ assets: { ...s.assets, ...a } })),
      setLiabilities: (l) => set((s) => ({ liabilities: { ...s.liabilities, ...l } })),
      setGoldPrice: (price) => set({ goldPricePerGram: price }),
      addPayment: (p) => set((s) => ({ payments: [{ ...p, id: crypto.randomUUID() }, ...s.payments] })),
    }),
    {
      name: 'amanah-zakat-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
