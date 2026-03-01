import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../constants/theme';
import { ColorScheme } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
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
import { useNetWorthHistoryStore } from '../../store/useNetWorthHistoryStore';
import { LineChart } from '../../components/charts/LineChart';
import { usePurchaseStore } from '../../store/usePurchaseStore';
import { generateInsights, Insight } from '../../utils/insights';

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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const { transactions, getMonthlyIncome, getMonthlyExpense, getMonthlyExpenseByCategory, budgets, setBudget, removeBudget, applyRecurringTransactions, getBudgetPace } = useFinanceStore();
  const { targetAmount, monthlySavings, annualReturnRate } = usePlannerStore();
  const { assets, liabilities, goldPricePerGram } = useZakatStore();

  // Apply recurring transactions on mount
  useEffect(() => {
    applyRecurringTransactions();
  }, []);

  // Budget modal state
  const [budgetModal, setBudgetModal] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');

  const handleSaveBudget = () => {
    if (!budgetCategory || !budgetAmount) return Alert.alert('Missing Fields', 'Please select a category and enter an amount.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBudget(budgetCategory, parseInt(budgetAmount, 10));
    setBudgetModal(false);
    setBudgetCategory('');
    setBudgetAmount('');
  };

  const handleRemoveBudget = (catId: string) => {
    Alert.alert('Remove Budget?', 'This will remove the budget limit for this category.', [
      { text: 'Cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeBudget(catId) },
    ]);
  };

  const netWorth = useNetWorth();
  const { snapshots, recordSnapshot, getTrend } = useNetWorthHistoryStore();
  const isPro = usePurchaseStore((s) => s.isPro);

  // Record net worth snapshot on mount
  useEffect(() => {
    recordSnapshot(netWorth);
  }, [netWorth]);

  const trend = useMemo(() => getTrend(), [snapshots]);

  // Chart data — show last 3 months free, full history for Pro
  const chartData = useMemo(() => {
    const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const displaySnapshots = isPro ? snapshots : snapshots.slice(-3);
    return displaySnapshots.map((s) => {
      const [, m] = s.month.split('-');
      return { label: MONTHS_SHORT[parseInt(m, 10) - 1], value: s.value };
    });
  }, [snapshots, isPro]);

  const monthlyIncome = getMonthlyIncome(year, month);
  const monthlyExpense = getMonthlyExpense(year, month);
  const recentTx = transactions.slice(0, 5);

  const totalAssets = assets.uangTunai + assets.tabungan + (assets.emasGram * goldPricePerGram) + assets.investasi + assets.piutang;
  const { zakatAmount, isWajib } = calculateZakat(totalAssets, liabilities.hutangJangkaPendek, goldPricePerGram);
  const { progressPercent, yearsToGoal } = calculateFinancialFreedom(netWorth, targetAmount, monthlySavings, annualReturnRate);

  // Generate insights
  const insights = useMemo(() => generateInsights({
    transactions,
    budgets,
    isZakatWajib: isWajib,
    zakatAmount,
  }), [transactions, budgets, isWajib, zakatAmount]);

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

  // Budget alerts with pace
  const budgetAlerts = useMemo(() => {
    return Object.entries(budgets)
      .map(([catId, limit]) => {
        const spent = expenseByCategory[catId] || 0;
        const cat = getCategoryById(catId);
        const pace = getBudgetPace(catId, year, month);
        return {
          catId, limit, spent,
          label: cat?.label || catId,
          icon: cat?.icon || '💰',
          pct: limit > 0 ? (spent / limit) * 100 : 0,
          pace,
        };
      });
  }, [budgets, expenseByCategory, year, month]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Assalamu'alaikum 👋</Text>
        <Text style={styles.date}>{dateStr}</Text>
        <Text style={styles.hijri}>{hijriStr}</Text>
      </View>

      {/* Smart Insights Carousel */}
      {insights.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.insightsScroll}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {insights.map((insight) => {
            const bgColor = insight.type === 'warning' ? colors.warning
              : insight.type === 'success' ? colors.success
              : insight.type === 'zakat' ? colors.accent
              : colors.primaryLight;
            return (
              <View key={insight.id} style={[styles.insightCard, { borderLeftColor: bgColor }]}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightBody}>{insight.body}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Net Worth */}
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.cardLabel}>Net Worth</Text>
          {trend && (
            <Text style={{ color: trend.direction === 'up' ? colors.success : trend.direction === 'down' ? colors.error : colors.textMuted, fontSize: 12, fontWeight: '600' }}>
              {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '─'} {Math.abs(trend.changePercent)}%
            </Text>
          )}
        </View>
        <Text style={[styles.bigAmount, { color: netWorth >= 0 ? colors.success : colors.error }]}>
          {formatIDR(netWorth)}
        </Text>
      </Card>

      {/* Net Worth History Chart */}
      {chartData.length >= 2 && (
        <Card>
          <Text style={styles.cardLabel}>Net Worth History</Text>
          <LineChart data={chartData} color={colors.accent} />
          {!isPro && snapshots.length > 3 && (
            <Text style={styles.subText}>Showing last 3 months. Upgrade to Pro for full history.</Text>
          )}
        </Card>
      )}

      {/* Monthly Summary */}
      <Card>
        <Text style={styles.cardLabel}>This Month</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: colors.success }]}>{formatIDR(monthlyIncome)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, { color: colors.error }]}>{formatIDR(monthlyExpense)}</Text>
          </View>
        </View>
        {monthlyIncome > 0 && (
          <ProgressBar
            progress={(monthlyExpense / monthlyIncome) * 100}
            label="Spending vs Income"
            showPercent
            color={monthlyExpense > monthlyIncome ? colors.error : colors.warning}
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
      <Card>
        <View style={styles.budgetHeader}>
          <Text style={styles.cardLabel}>Budget Tracking</Text>
          <TouchableOpacity onPress={() => setBudgetModal(true)}>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>+ Set Budget</Text>
          </TouchableOpacity>
        </View>
        {budgetAlerts.length === 0 ? (
          <Text style={styles.emptyText}>No budgets set. Tap "+ Set Budget" to start tracking spending limits.</Text>
        ) : (
          budgetAlerts.map((b) => {
            const isOver = b.pct > 100;
            const isWarning = b.pct > 80 && b.pct <= 100;
            const underBudget = b.pct > 0 && b.pct <= 80;
            return (
              <TouchableOpacity key={b.catId} style={styles.budgetItem} onLongPress={() => handleRemoveBudget(b.catId)}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetLabel}>{b.icon} {b.label}</Text>
                  <Text style={[styles.budgetSpent, isOver && { color: colors.error }]}>
                    {formatIDR(b.spent)} / {formatIDR(b.limit)}
                  </Text>
                </View>
                <ProgressBar
                  progress={b.pct}
                  color={isOver ? colors.error : isWarning ? colors.warning : colors.success}
                />
                {/* Smart pace alert */}
                {b.pace && b.pace.daysLeft > 0 && (
                  <Text style={[styles.paceText, { color: b.pace.willExceed ? colors.error : colors.textMuted }]}>
                    {b.pace.willExceed
                      ? `At ${formatIDR(Math.round(b.pace.dailyRate))}/day, you'll exceed by ${formatIDR(Math.round(b.pace.projectedTotal - b.limit))}`
                      : `${formatIDR(Math.round(b.pace.dailyRate))}/day · ${b.pace.daysLeft} days left`
                    }
                  </Text>
                )}
                {isOver && (
                  <Text style={{ color: colors.error, fontSize: 11, marginTop: 2 }}>
                    Over budget by {formatIDR(b.spent - b.limit)}
                  </Text>
                )}
                {/* End-of-month celebration */}
                {underBudget && b.pace && b.pace.daysLeft <= 3 && b.pace.daysLeft >= 0 && (
                  <Text style={{ color: colors.success, fontSize: 11, marginTop: 2 }}>
                    Great job! You're staying under budget this month.
                  </Text>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </Card>

      {/* Financial Freedom */}
      <Card>
        <Text style={styles.cardLabel}>Financial Freedom</Text>
        <ProgressBar progress={progressPercent} showPercent color={colors.accent} />
        <Text style={styles.subText}>
          {progressPercent < 100
            ? `Target: ${formatIDR(targetAmount)} · Est. ${yearsToGoal} years to go`
            : 'Goal Reached!'}
        </Text>
      </Card>

      {/* Zakat Reminder */}
      {isWajib && (
        <Card style={{ borderColor: colors.accent }}>
          <Text style={[styles.cardLabel, { color: colors.accent }]}>Zakat Due</Text>
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
                <Text style={[styles.txAmount, { color: tx.type === 'income' ? colors.success : colors.error }]}>
                  {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount)}
                </Text>
              </View>
            );
          })
        )}
      </Card>
      {/* Budget Management Modal */}
      <Modal visible={budgetModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Set Monthly Budget</Text>

            <Text style={styles.sectionLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {EXPENSE_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setBudgetCategory(c.id)}
                  style={[styles.catChip, budgetCategory === c.id && { borderColor: colors.accent }]}
                >
                  <Text style={styles.catChipText}>{c.icon} {c.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.budgetInput}
              placeholder="Monthly budget amount (IDR)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={budgetAmount}
              onChangeText={setBudgetAmount}
            />

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Cancel" variant="secondary" onPress={() => setBudgetModal(false)} style={{ flex: 1 }} />
              <Button title="Save" onPress={handleSaveBudget} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16 },
    header: { marginBottom: 16 },
    greeting: { fontSize: 22, fontWeight: '700', color: colors.text },
    date: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
    hijri: { color: colors.accent, fontSize: 13 },
    cardLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    bigAmount: { fontSize: 28, fontWeight: '800' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryItem: { flex: 1 },
    summaryItemLabel: { color: colors.textMuted, fontSize: 12 },
    summaryAmount: { fontSize: 16, fontWeight: '700', marginTop: 2 },
    subText: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
    zakatText: { color: colors.text, fontSize: 14 },
    emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', padding: 16 },
    txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
    txIcon: { fontSize: 20, marginRight: 10 },
    txInfo: { flex: 1 },
    txCat: { color: colors.text, fontSize: 14, fontWeight: '500' },
    txNote: { color: colors.textMuted, fontSize: 12 },
    txAmount: { fontSize: 14, fontWeight: '700' },
    budgetItem: { marginBottom: 8 },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' },
    budgetLabel: { color: colors.text, fontSize: 13 },
    budgetSpent: { color: colors.textMuted, fontSize: 12 },
    insightsScroll: { marginBottom: 12, marginHorizontal: -16, paddingLeft: 16 },
    insightCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, width: 240, marginRight: 12, borderLeftWidth: 4, borderWidth: 1, borderColor: colors.border },
    insightIcon: { fontSize: 20, marginBottom: 4 },
    insightTitle: { color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: 4 },
    insightBody: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
    paceText: { fontSize: 11, marginTop: 2 },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
    modal: { backgroundColor: colors.surface, borderRadius: 16, padding: 20 },
    modalTitle: { color: colors.text, fontWeight: '700', fontSize: 16, textAlign: 'center', marginBottom: 16 },
    sectionLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 6 },
    catChip: { backgroundColor: colors.surfaceAlt, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderWidth: 1, borderColor: colors.border },
    catChipText: { color: colors.text, fontSize: 13 },
    budgetInput: { backgroundColor: colors.surfaceAlt, borderRadius: 8, padding: 12, color: colors.text, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  });
