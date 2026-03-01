import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NetWorthSnapshot {
  month: string; // YYYY-MM
  value: number;
}

interface NetWorthHistoryState {
  snapshots: NetWorthSnapshot[];
  recordSnapshot: (currentNetWorth: number) => void;
  getTrend: () => { changePercent: number; direction: 'up' | 'down' | 'flat' } | null;
}

export const useNetWorthHistoryStore = create<NetWorthHistoryState>()(
  persist(
    (set, get) => ({
      snapshots: [],

      recordSnapshot: (currentNetWorth: number) => {
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const existing = get().snapshots;

        // Update or add snapshot for current month
        const hasCurrentMonth = existing.some((s) => s.month === monthKey);
        if (hasCurrentMonth) {
          set({
            snapshots: existing.map((s) =>
              s.month === monthKey ? { ...s, value: currentNetWorth } : s
            ),
          });
        } else {
          set({
            snapshots: [...existing, { month: monthKey, value: currentNetWorth }]
              .sort((a, b) => a.month.localeCompare(b.month)),
          });
        }
      },

      getTrend: () => {
        const snaps = get().snapshots;
        if (snaps.length < 2) return null;
        const current = snaps[snaps.length - 1];
        const previous = snaps[snaps.length - 2];
        if (previous.value === 0) return { changePercent: 0, direction: 'flat' as const };
        const change = ((current.value - previous.value) / Math.abs(previous.value)) * 100;
        const direction = change > 0.5 ? 'up' as const : change < -0.5 ? 'down' as const : 'flat' as const;
        return { changePercent: Math.round(change * 10) / 10, direction };
      },
    }),
    {
      name: 'amanah-networth-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
