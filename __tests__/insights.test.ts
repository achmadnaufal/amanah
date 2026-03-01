import { generateInsights, Insight } from '../utils/insights';
import { Transaction } from '../store/useFinanceStore';

const makeTransaction = (
  overrides: Partial<Transaction> & { date: string; amount: number; category: string; type: 'income' | 'expense' }
): Transaction => ({
  id: Math.random().toString(),
  note: '',
  ...overrides,
});

describe('generateInsights', () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastMonth = month === 0 ? 11 : month - 1;
  const lastMonthYear = month === 0 ? year - 1 : year;

  const thisMonthDate = new Date(year, month, 10).toISOString();
  const lastMonthDate = new Date(lastMonthYear, lastMonth, 10).toISOString();

  it('should return empty array with no transactions', () => {
    const insights = generateInsights({
      transactions: [],
      budgets: {},
      isZakatWajib: false,
      zakatAmount: 0,
    });
    expect(insights).toEqual([]);
  });

  it('should detect spending increase vs last month', () => {
    const transactions: Transaction[] = [
      makeTransaction({ date: thisMonthDate, amount: 2000000, category: 'food', type: 'expense' }),
      makeTransaction({ date: lastMonthDate, amount: 1000000, category: 'food', type: 'expense' }),
    ];
    const insights = generateInsights({ transactions, budgets: {}, isZakatWajib: false, zakatAmount: 0 });
    const spendingUp = insights.find((i) => i.id === 'spending-up');
    expect(spendingUp).toBeDefined();
    expect(spendingUp!.body).toContain('100%');
  });

  it('should detect spending decrease vs last month', () => {
    const transactions: Transaction[] = [
      makeTransaction({ date: thisMonthDate, amount: 500000, category: 'food', type: 'expense' }),
      makeTransaction({ date: lastMonthDate, amount: 1000000, category: 'food', type: 'expense' }),
    ];
    const insights = generateInsights({ transactions, budgets: {}, isZakatWajib: false, zakatAmount: 0 });
    const spendingDown = insights.find((i) => i.id === 'spending-down');
    expect(spendingDown).toBeDefined();
  });

  it('should calculate savings rate', () => {
    const transactions: Transaction[] = [
      makeTransaction({ date: thisMonthDate, amount: 10000000, category: 'salary', type: 'income' }),
      makeTransaction({ date: thisMonthDate, amount: 7000000, category: 'food', type: 'expense' }),
    ];
    const insights = generateInsights({ transactions, budgets: {}, isZakatWajib: false, zakatAmount: 0 });
    const savingsRate = insights.find((i) => i.id === 'savings-rate');
    expect(savingsRate).toBeDefined();
    expect(savingsRate!.title).toContain('30%');
  });

  it('should detect category spending spike', () => {
    const transactions: Transaction[] = [
      makeTransaction({ date: thisMonthDate, amount: 3000000, category: 'food', type: 'expense' }),
      makeTransaction({ date: lastMonthDate, amount: 1000000, category: 'food', type: 'expense' }),
    ];
    const insights = generateInsights({ transactions, budgets: {}, isZakatWajib: false, zakatAmount: 0 });
    const spike = insights.find((i) => i.id === 'category-spike-food');
    expect(spike).toBeDefined();
    expect(spike!.body).toContain('200%');
  });

  it('should show zakat reminder when wajib', () => {
    const insights = generateInsights({
      transactions: [],
      budgets: {},
      isZakatWajib: true,
      zakatAmount: 5000000,
    });
    const zakatInsight = insights.find((i) => i.id === 'zakat-due');
    expect(zakatInsight).toBeDefined();
    expect(zakatInsight!.type).toBe('zakat');
  });

  it('should not show zakat reminder when not wajib', () => {
    const insights = generateInsights({
      transactions: [],
      budgets: {},
      isZakatWajib: false,
      zakatAmount: 0,
    });
    const zakatInsight = insights.find((i) => i.id === 'zakat-due');
    expect(zakatInsight).toBeUndefined();
  });

  it('should show budget warning at 80%+', () => {
    const transactions: Transaction[] = [
      makeTransaction({ date: thisMonthDate, amount: 1600000, category: 'food', type: 'expense' }),
    ];
    const insights = generateInsights({
      transactions,
      budgets: { food: 2000000 },
      isZakatWajib: false,
      zakatAmount: 0,
    });
    const budgetWarning = insights.find((i) => i.id === 'budget-warning-food');
    expect(budgetWarning).toBeDefined();
    expect(budgetWarning!.type).toBe('warning');
  });

  it('should show top expense tip when category dominates spending', () => {
    const transactions: Transaction[] = [
      makeTransaction({ date: thisMonthDate, amount: 5000000, category: 'food', type: 'expense' }),
      makeTransaction({ date: thisMonthDate, amount: 1000000, category: 'transport', type: 'expense' }),
    ];
    const insights = generateInsights({ transactions, budgets: {}, isZakatWajib: false, zakatAmount: 0 });
    const topExpense = insights.find((i) => i.id === 'top-expense');
    expect(topExpense).toBeDefined();
  });
});
