import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';

export interface PortfolioAsset {
  id: string;
  type: 'emas' | 'reksa_dana_syariah' | 'sukuk' | 'properti' | 'bisnis' | 'kas';
  label: string;
  valueIDR: number;
  emasGram?: number;
}

interface PlannerState {
  targetAmount: number;
  monthlySavings: number;
  annualReturnRate: number;
  portfolioAssets: PortfolioAsset[];
  setTarget: (amount: number) => void;
  setMonthlySavings: (amount: number) => void;
  setAnnualReturnRate: (rate: number) => void;
  addAsset: (asset: Omit<PortfolioAsset, 'id'>) => void;
  updateAsset: (id: string, updates: Partial<PortfolioAsset>) => void;
  deleteAsset: (id: string) => void;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      targetAmount: 3_600_000_000,
      monthlySavings: 5_000_000,
      annualReturnRate: 0.07,
      portfolioAssets: [],
      setTarget: (amount) => set({ targetAmount: amount }),
      setMonthlySavings: (amount) => set({ monthlySavings: amount }),
      setAnnualReturnRate: (rate) => set({ annualReturnRate: rate }),
      addAsset: (asset) => set((s) => ({ portfolioAssets: [...s.portfolioAssets, { ...asset, id: randomUUID() }] })),
      updateAsset: (id, updates) => set((s) => ({
        portfolioAssets: s.portfolioAssets.map((a) => a.id === id ? { ...a, ...updates } : a)
      })),
      deleteAsset: (id) => set((s) => ({ portfolioAssets: s.portfolioAssets.filter((a) => a.id !== id) })),
    }),
    {
      name: 'amanah-planner-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
