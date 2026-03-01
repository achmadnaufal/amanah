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

export interface RecurringSuggestion {
  category: string;
  amount: number;
  type: 'income' | 'expense';
  occurrences: number;
}

interface FinanceState {
  transactions: Transaction[];
  budgets: Record<string, number>; // category -> monthly budget amount
  recurringTemplates: RecurringTemplate[];
  dismissedSuggestions: string[]; // "category:amount" keys
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void;
  deleteTransaction: (id: string) => void;
  setBudget: (category: string, amount: number) => void;
  removeBudget: (category: string) => void;
  addRecurringTemplate: (template: Omit<RecurringTemplate, 'id'>) => void;
  updateRecurringTemplate: (id: string, updates: Partial<Omit<RecurringTemplate, 'id'>>) => void;
  deleteRecurringTemplate: (id: string) => void;
  toggleRecurringTemplate: (id: string) => void;
  applyRecurringTransactions: () => void;
  detectRecurringPatterns: () => RecurringSuggestion[];
  dismissSuggestion: (key: string) => void;
  getMonthlyIncome: (year: number, month: number) => number;
  getMonthlyExpense: (year: number, month: number) => number;
  getMonthlyExpenseByCategory: (year: number, month: number) => Record<string, number>;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getNetWorth: () => number;
  getBudgetPace: (category: string, year: number, month: number) => { dailyRate: number; projectedTotal: number; daysLeft: number; willExceed: boolean } | null;
}

export interface RecurringTemplate {
  id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  note?: string;
  dayOfMonth: number;
  lastApplied?: string; // YYYY-MM
  active: boolean;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      budgets: {},
      recurringTemplates: [],
      dismissedSuggestions: [],
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
          recurringTemplates: [...state.recurringTemplates, { ...template, id: randomUUID(), active: template.active ?? true }],
        }));
      },
      updateRecurringTemplate: (id, updates) => {
        set((state) => ({
          recurringTemplates: state.recurringTemplates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },
      deleteRecurringTemplate: (id) => {
        set((state) => ({
          recurringTemplates: state.recurringTemplates.filter((t) => t.id !== id),
        }));
      },
      toggleRecurringTemplate: (id) => {
        set((state) => ({
          recurringTemplates: state.recurringTemplates.map((t) =>
            t.id === id ? { ...t, active: !t.active } : t
          ),
        }));
      },
      applyRecurringTransactions: () => {
        const now = new Date();
        const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const state = get();
        const toApply = state.recurringTemplates.filter(
          (t) => t.active !== false && t.lastApplied !== currentKey && now.getDate() >= t.dayOfMonth
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
      detectRecurringPatterns: () => {
        const txs = get().transactions;
        const existing = get().recurringTemplates;
        const dismissed = get().dismissedSuggestions;
        // Group transactions by category+amount+type
        const groups: Record<string, { months: Set<string>; type: 'income' | 'expense'; category: string; amount: number }> = {};
        txs.forEach((tx) => {
          const key = `${tx.category}:${tx.amount}:${tx.type}`;
          if (!groups[key]) {
            groups[key] = { months: new Set(), type: tx.type, category: tx.category, amount: tx.amount };
          }
          const d = new Date(tx.date);
          groups[key].months.add(`${d.getFullYear()}-${d.getMonth()}`);
        });
        // Filter: 3+ distinct months, not already a template, not dismissed
        const suggestions: RecurringSuggestion[] = [];
        Object.entries(groups).forEach(([_, group]) => {
          if (group.months.size < 3) return;
          const alreadyExists = existing.some(
            (t) => t.category === group.category && t.amount === group.amount && t.type === group.type
          );
          const dismissKey = `${group.category}:${group.amount}`;
          if (alreadyExists || dismissed.includes(dismissKey)) return;
          suggestions.push({
            category: group.category,
            amount: group.amount,
            type: group.type,
            occurrences: group.months.size,
          });
        });
        return suggestions;
      },
      dismissSuggestion: (key) => {
        set((state) => ({
          dismissedSuggestions: [...state.dismissedSuggestions, key],
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
      getBudgetPace: (category, year, month) => {
        const limit = get().budgets[category];
        if (!limit) return null;
        const spent = get().getMonthlyExpenseByCategory(year, month)[category] || 0;
        const now = new Date();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayOfMonth = now.getFullYear() === year && now.getMonth() === month ? now.getDate() : daysInMonth;
        const dailyRate = dayOfMonth > 0 ? spent / dayOfMonth : 0;
        const daysLeft = daysInMonth - dayOfMonth;
        const projectedTotal = spent + (dailyRate * daysLeft);
        return { dailyRate, projectedTotal, daysLeft, willExceed: projectedTotal > limit };
      },
    }),
    {
      name: 'amanah-finance-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
