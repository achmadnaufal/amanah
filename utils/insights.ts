import { Transaction } from '../store/useFinanceStore';
import { getCategoryById } from '../constants/categories';
import { formatIDR } from './currency';

export interface Insight {
  id: string;
  icon: string;
  title: string;
  body: string;
  type: 'warning' | 'success' | 'info' | 'zakat';
  actionLabel?: string;
  actionTab?: string;
}

interface InsightInput {
  transactions: Transaction[];
  budgets: Record<string, number>;
  isZakatWajib: boolean;
  zakatAmount: number;
}

export function generateInsights(input: InsightInput): Insight[] {
  const { transactions, budgets, isZakatWajib, zakatAmount } = input;
  const insights: Insight[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const thisMonthTxs = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const lastMonth = month === 0 ? 11 : month - 1;
  const lastMonthYear = month === 0 ? year - 1 : year;
  const lastMonthTxs = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth;
  });

  const thisMonthIncome = thisMonthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const thisMonthExpense = thisMonthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const lastMonthExpense = lastMonthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // 1. Spending comparison vs last month
  if (lastMonthExpense > 0 && thisMonthExpense > 0) {
    const changePercent = Math.round(((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100);
    if (changePercent > 20) {
      insights.push({
        id: 'spending-up',
        icon: '📈',
        title: 'Spending Up',
        body: `You spent ${changePercent}% more this month compared to last month (${formatIDR(thisMonthExpense)} vs ${formatIDR(lastMonthExpense)}).`,
        type: 'warning',
        actionLabel: 'View Transactions',
        actionTab: 'transactions',
      });
    } else if (changePercent < -10) {
      insights.push({
        id: 'spending-down',
        icon: '📉',
        title: 'Spending Down',
        body: `Great! You spent ${Math.abs(changePercent)}% less this month compared to last month.`,
        type: 'success',
      });
    }
  }

  // 2. Savings rate
  if (thisMonthIncome > 0) {
    const savingsRate = Math.round(((thisMonthIncome - thisMonthExpense) / thisMonthIncome) * 100);
    if (savingsRate > 0) {
      insights.push({
        id: 'savings-rate',
        icon: '💰',
        title: `Savings Rate: ${savingsRate}%`,
        body: savingsRate >= 30
          ? `Excellent! You're saving ${savingsRate}% of your income this month.`
          : savingsRate >= 15
          ? `Good — you're saving ${savingsRate}% of income. Aim for 20%+ for faster financial freedom.`
          : `You're saving ${savingsRate}% of income. Try to increase this for long-term wealth.`,
        type: savingsRate >= 20 ? 'success' : 'info',
      });
    }
  }

  // 3. Category-specific spending spike
  const thisMonthByCategory: Record<string, number> = {};
  thisMonthTxs.filter((t) => t.type === 'expense').forEach((t) => {
    thisMonthByCategory[t.category] = (thisMonthByCategory[t.category] || 0) + t.amount;
  });

  const lastMonthByCategory: Record<string, number> = {};
  lastMonthTxs.filter((t) => t.type === 'expense').forEach((t) => {
    lastMonthByCategory[t.category] = (lastMonthByCategory[t.category] || 0) + t.amount;
  });

  Object.entries(thisMonthByCategory).forEach(([catId, amount]) => {
    const lastAmount = lastMonthByCategory[catId] || 0;
    if (lastAmount > 0 && amount > lastAmount * 1.4) {
      const cat = getCategoryById(catId);
      const pctIncrease = Math.round(((amount - lastAmount) / lastAmount) * 100);
      insights.push({
        id: `category-spike-${catId}`,
        icon: cat?.icon || '⚠️',
        title: `${cat?.label || catId} Spike`,
        body: `You spent ${pctIncrease}% more on ${cat?.label || catId} this month (${formatIDR(amount)} vs ${formatIDR(lastAmount)}).`,
        type: 'warning',
        actionLabel: 'View Transactions',
        actionTab: 'transactions',
      });
    }
  });

  // 4. Biggest expense category tip
  const sortedCategories = Object.entries(thisMonthByCategory).sort(([, a], [, b]) => b - a);
  if (sortedCategories.length > 0 && thisMonthExpense > 0) {
    const [topCatId, topAmount] = sortedCategories[0];
    const topPct = Math.round((topAmount / thisMonthExpense) * 100);
    if (topPct >= 30) {
      const cat = getCategoryById(topCatId);
      insights.push({
        id: 'top-expense',
        icon: '💡',
        title: 'Spending Tip',
        body: `Your biggest expense is ${cat?.label || topCatId} (${topPct}% of spending). Consider reviewing if there are savings opportunities.`,
        type: 'info',
      });
    }
  }

  // 5. Savings consistency
  const monthKeys: string[] = [];
  for (let i = 0; i < 4; i++) {
    const m = new Date(year, month - i);
    monthKeys.push(`${m.getFullYear()}-${m.getMonth()}`);
  }

  const monthlySavings = monthKeys.map((key) => {
    const [y, m] = key.split('-').map(Number);
    const monthTxs = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
    const inc = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return inc - exp;
  });

  const consecutivePositive = monthlySavings.filter((s) => s > 0).length;
  if (consecutivePositive >= 3) {
    insights.push({
      id: 'savings-streak',
      icon: '🔥',
      title: `${consecutivePositive}-Month Savings Streak!`,
      body: `You've been saving consistently for ${consecutivePositive} months. Keep it up!`,
      type: 'success',
    });
  }

  // 6. Zakat reminder
  if (isZakatWajib) {
    insights.push({
      id: 'zakat-due',
      icon: '🌙',
      title: 'Zakat Reminder',
      body: `Your net assets exceed nisab. Zakat due: ${formatIDR(zakatAmount)}.`,
      type: 'zakat',
      actionLabel: 'Go to Zakat',
      actionTab: 'zakat',
    });
  }

  // 7. Budget alerts
  Object.entries(budgets).forEach(([catId, limit]) => {
    const spent = thisMonthByCategory[catId] || 0;
    const pct = limit > 0 ? (spent / limit) * 100 : 0;
    if (pct >= 80 && pct < 100) {
      const cat = getCategoryById(catId);
      insights.push({
        id: `budget-warning-${catId}`,
        icon: '⚠️',
        title: `${cat?.label || catId} Budget Warning`,
        body: `You've used ${Math.round(pct)}% of your ${cat?.label || catId} budget.`,
        type: 'warning',
      });
    }
  });

  return insights;
}
