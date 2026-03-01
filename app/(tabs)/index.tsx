import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { DonutChart } from '../../components/charts/DonutChart';
import { useFinanceStore } from '../../store/useFinanceStore';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useZakatStore } from '../../store/useZakatStore';
import { formatIDR } from '../../utils/currency';
import { calculateZakat } from '../../utils/zakat';
import { calculateFinancialFreedom } from '../../utils/planner';
import { getCategoryById, EXPENSE_CATEGORIES } from '../../constants/categories';
import { useNetWorth } from '../../utils/netWorth';

const CATEGORY_COLORS = ['#F9A825', '#3FB950', '#58A6FF', '#D29922', '#BC8CFF', '#39D353', '#F85149', '#8B949E', '#FF7B72', '#79C0FF', '#D2A8FF'];

const HIJRI_MONTHS = ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Awwal','Jumada al-Thani','Rajab','Sha\'ban','Ramadan','Shawwal','Dhul Qa\'dah','Dhul Hijjah'];

function toHijri(date: Date): string {
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const ll = l - 10631 * n + 354;
  const j = Math.floor((10985 - ll) / 5316) * Math.floor((50 * ll) / 17719) + Math.floor(ll / 5670) * Math.floor((43 * ll) / 15238);
  const lll = ll - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * lll) / 709);
  const day = lll - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return `${day} ${HIJRI_MONTHS[month - 1]} ${year} AH`;
}

export default function Dashboard() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const { transactions, getMonthlyIncome, getMonthlyExpense, getMonthlyExpenseByCategory, budgets, applyRecurringTransactions } = useFinanceStore();
  const { targetAmount, monthlySavings, annualReturnRate } = usePlannerStore();
  const { assets, liabilities, goldPricePerGram } = useZakatStore();

  // Apply recurring transactions on mount
  useEffect(() => {
    applyRecurringTransactions();
  }, []);

  const netWorth = useNetWorth();
  const monthlyIncome = getMonthlyIncome(year, month);
  const monthlyExpense = getMonthlyExpense(year, month);
  const recentTx = transactions.slice(0, 5);

  const totalAssets = assets.uangTunai + assets.tabungan + (assets.emasGram * goldPricePerGram) + assets.investasi + assets.piutang;
  const { zakatAmount, isWajib } = calculateZakat(totalAssets, liabilities.hutangJangkaPendek, goldPricePerGram);
  const { progressPercent, yearsToGoal } = calculateFinancialFreedom(netWorth, targetAmount, monthlySavings, annualReturnRate);

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const hijriStr = toHijri(now);

  // Spending by category for donut chart
  const expenseByCategory = useMemo(() => getMonthlyExpenseByCategory(year, month), [transactions, year, month]);
  const donutData = useMemo(() => {
    return Object.entries(expenseByCategory).map(([catId, amount], i) => {
      const cat = getCategoryById(catId);
      return {
        label: cat ? `${cat.icon} ${cat.label}` : catId,
        value: amount,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      };
    }).sort((a, b) => b.value - a.value);
  }, [expenseByCategory]);

  // Budget alerts
  const budgetAlerts = useMemo(() => {
    return Object.entries(budgets)
      .map(([catId, limit]) => {
        const spent = expenseByCategory[catId] || 0;
        const cat = getCategoryById(catId);
        return { catId, limit, spent, label: cat?.label || catId, icon: cat?.icon || '💰', pct: limit > 0 ? (spent / limit) * 100 : 0 };
      })
      .filter((b) => b.pct > 0);
  }, [budgets, expenseByCategory]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Assalamu'alaikum 👋</Text>
        <Text style={styles.date}>{dateStr}</Text>
        <Text style={styles.hijri}>{hijriStr}</Text>
      </View>

      {/* Net Worth */}
      <Card>
        <Text style={styles.cardLabel}>Net Worth</Text>
        <Text style={[styles.bigAmount, { color: netWorth >= 0 ? Colors.success : Colors.error }]}>
          {formatIDR(netWorth)}
        </Text>
      </Card>

      {/* Monthly Summary */}
      <Card>
        <Text style={styles.cardLabel}>This Month</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: Colors.success }]}>{formatIDR(monthlyIncome)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, { color: Colors.error }]}>{formatIDR(monthlyExpense)}</Text>
          </View>
        </View>
        {monthlyIncome > 0 && (
          <ProgressBar
            progress={(monthlyExpense / monthlyIncome) * 100}
            label="Spending vs Income"
            showPercent
            color={monthlyExpense > monthlyIncome ? Colors.error : Colors.warning}
          />
        )}
      </Card>

      {/* Spending Donut Chart */}
      {donutData.length > 0 && (
        <Card>
          <Text style={styles.cardLabel}>Spending Breakdown</Text>
          <DonutChart data={donutData} />
        </Card>
      )}

      {/* Budget Tracking */}
      {budgetAlerts.length > 0 && (
        <Card>
          <Text style={styles.cardLabel}>Budget Tracking</Text>
          {budgetAlerts.map((b) => (
            <View key={b.catId} style={styles.budgetItem}>
              <View style={styles.budgetHeader}>
                <Text style={styles.budgetLabel}>{b.icon} {b.label}</Text>
                <Text style={[styles.budgetSpent, b.pct > 100 && { color: Colors.error }]}>
                  {formatIDR(b.spent)} / {formatIDR(b.limit)}
                </Text>
              </View>
              <ProgressBar
                progress={b.pct}
                color={b.pct > 100 ? Colors.error : b.pct > 80 ? Colors.warning : Colors.success}
              />
            </View>
          ))}
        </Card>
      )}

      {/* Financial Freedom */}
      <Card>
        <Text style={styles.cardLabel}>Financial Freedom</Text>
        <ProgressBar progress={progressPercent} showPercent color={Colors.accent} />
        <Text style={styles.subText}>
          {progressPercent < 100
            ? `Target: ${formatIDR(targetAmount)} · Est. ${yearsToGoal} years to go`
            : 'Goal Reached!'}
        </Text>
      </Card>

      {/* Zakat Reminder */}
      {isWajib && (
        <Card style={{ borderColor: Colors.accent }}>
          <Text style={[styles.cardLabel, { color: Colors.accent }]}>Zakat Due</Text>
          <Text style={styles.zakatText}>
            Your Zakat al-Mal is {formatIDR(zakatAmount)}. Time to give.
          </Text>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <Text style={styles.cardLabel}>Recent Transactions</Text>
        {recentTx.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet. Add one in the Transactions tab.</Text>
        ) : (
          recentTx.map((tx) => {
            const cat = getCategoryById(tx.category);
            return (
              <View key={tx.id} style={styles.txRow}>
                <Text style={styles.txIcon}>{cat?.icon || '💸'}</Text>
                <View style={styles.txInfo}>
                  <Text style={styles.txCat}>{cat?.label || tx.category}</Text>
                  {tx.note ? <Text style={styles.txNote}>{tx.note}</Text> : null}
                </View>
                <Text style={[styles.txAmount, { color: tx.type === 'income' ? Colors.success : Colors.error }]}>
                  {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount)}
                </Text>
              </View>
            );
          })
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  header: { marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '700', color: Colors.text },
  date: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  hijri: { color: Colors.accent, fontSize: 13 },
  cardLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  bigAmount: { fontSize: 28, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryItem: { flex: 1 },
  summaryItemLabel: { color: Colors.textMuted, fontSize: 12 },
  summaryAmount: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  subText: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  zakatText: { color: Colors.text, fontSize: 14 },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', padding: 16 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  txIcon: { fontSize: 20, marginRight: 10 },
  txInfo: { flex: 1 },
  txCat: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  txNote: { color: Colors.textMuted, fontSize: 12 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  budgetItem: { marginBottom: 8 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  budgetLabel: { color: Colors.text, fontSize: 13 },
  budgetSpent: { color: Colors.textMuted, fontSize: 12 },
});
