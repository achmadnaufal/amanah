import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';

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
  budgets: Record<string, number>; // category -> monthly budget amount
  recurringTemplates: RecurringTemplate[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void;
  deleteTransaction: (id: string) => void;
  setBudget: (category: string, amount: number) => void;
  removeBudget: (category: string) => void;
  addRecurringTemplate: (template: Omit<RecurringTemplate, 'id'>) => void;
  deleteRecurringTemplate: (id: string) => void;
  applyRecurringTransactions: () => void;
  getMonthlyIncome: (year: number, month: number) => number;
  getMonthlyExpense: (year: number, month: number) => number;
  getMonthlyExpenseByCategory: (year: number, month: number) => Record<string, number>;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getNetWorth: () => number;
}

export interface RecurringTemplate {
  id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  note?: string;
  dayOfMonth: number;
  lastApplied?: string; // YYYY-MM
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      budgets: {},
      recurringTemplates: [],
      addTransaction: (tx) => {
        const newTx: Transaction = { ...tx, id: randomUUID() };
        set((state) => ({ transactions: [newTx, ...state.transactions] }));
      },
      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) => t.id === id ? { ...t, ...updates } : t),
        }));
      },
      deleteTransaction: (id) => {
        set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
      },
      setBudget: (category, amount) => {
        set((state) => ({ budgets: { ...state.budgets, [category]: amount } }));
      },
      removeBudget: (category) => {
        set((state) => {
          const { [category]: _, ...rest } = state.budgets;
          return { budgets: rest };
        });
      },
      addRecurringTemplate: (template) => {
        set((state) => ({
          recurringTemplates: [...state.recurringTemplates, { ...template, id: randomUUID() }],
        }));
      },
      deleteRecurringTemplate: (id) => {
        set((state) => ({
          recurringTemplates: state.recurringTemplates.filter((t) => t.id !== id),
        }));
      },
      applyRecurringTransactions: () => {
        const now = new Date();
        const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const state = get();
        const toApply = state.recurringTemplates.filter(
          (t) => t.lastApplied !== currentKey && now.getDate() >= t.dayOfMonth
        );
        if (toApply.length === 0) return;
        const newTransactions = toApply.map((t) => ({
          id: randomUUID(),
          date: new Date(now.getFullYear(), now.getMonth(), t.dayOfMonth).toISOString(),
          amount: t.amount,
          category: t.category,
          type: t.type,
          note: t.note ? `${t.note} (recurring)` : '(recurring)',
        }));
        set((state) => ({
          transactions: [...newTransactions, ...state.transactions],
          recurringTemplates: state.recurringTemplates.map((t) =>
            toApply.find((a) => a.id === t.id) ? { ...t, lastApplied: currentKey } : t
          ),
        }));
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
      getMonthlyExpenseByCategory: (year, month) => {
        const result: Record<string, number> = {};
        get().transactions
          .filter((t) => {
            const d = new Date(t.date);
            return t.type === 'expense' && d.getFullYear() === year && d.getMonth() === month;
          })
          .forEach((t) => {
            result[t.category] = (result[t.category] || 0) + t.amount;
          });
        return result;
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
