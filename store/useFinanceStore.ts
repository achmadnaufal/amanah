import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  date: string; // ISO string
  amount: number;
  category: string;
  type: 'income' | 'expense';
  note?: string;
}

interface FinanceState {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  getMonthlyIncome: (year: number, month: number) => number;
  getMonthlyExpense: (year: number, month: number) => number;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getNetWorth: () => number;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      addTransaction: (tx) => {
        const newTx: Transaction = { ...tx, id: Date.now().toString() };
        set((state) => ({ transactions: [newTx, ...state.transactions] }));
      },
      deleteTransaction: (id) => {
        set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
      },
      getMonthlyIncome: (year, month) => {
        return get().transactions
          .filter((t) => {
            const d = new Date(t.date);
            return t.type === 'income' && d.getFullYear() === year && d.getMonth() === month;
          })
          .reduce((sum, t) => sum + t.amount, 0);
      },
      getMonthlyExpense: (year, month) => {
        return get().transactions
          .filter((t) => {
            const d = new Date(t.date);
            return t.type === 'expense' && d.getFullYear() === year && d.getMonth() === month;
          })
          .reduce((sum, t) => sum + t.amount, 0);
      },
      getTotalIncome: () => get().transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      getTotalExpense: () => get().transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      getNetWorth: () => get().getTotalIncome() - get().getTotalExpense(),
    }),
    {
      name: 'amanah-finance-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
