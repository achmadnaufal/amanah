import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../constants/theme';
import { ColorScheme } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { useZakatStore } from '../store/useZakatStore';
import { usePlannerStore } from '../store/usePlannerStore';
import { Button } from '../components/ui/Button';
import { formatIDR } from '../utils/currency';
import { EXPENSE_CATEGORIES, getCategoryById } from '../constants/categories';

const STEPS = [
  { icon: '💼', title: 'Set Your Income', subtitle: 'Enter your monthly salary to auto-track each month.' },
  { icon: '🏠', title: 'Set Top Expenses', subtitle: 'Add your biggest recurring monthly expenses.' },
  { icon: '📊', title: 'Set a Budget', subtitle: 'Pick categories to set spending limits.' },
  { icon: '🥇', title: 'Gold Price', subtitle: 'Set the current gold price for accurate Zakat nisab calculation.' },
  { icon: '🎯', title: 'Your Goal', subtitle: 'Set your financial freedom target amount.' },
];

interface ExpenseEntry {
  category: string;
  amount: string;
}

const COMMON_EXPENSES = [
  { category: 'food', suggestedLabel: 'Food & Dining' },
  { category: 'transport', suggestedLabel: 'Transport' },
  { category: 'utilities', suggestedLabel: 'Utilities' },
];

const BUDGET_SUGGESTIONS = [
  { category: 'food', defaultAmount: '2000000' },
  { category: 'transport', defaultAmount: '1000000' },
];

export default function SetupWizard() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const setCompletedSetup = useAppStore((s) => s.setCompletedSetup);
  const { addRecurringTemplate, setBudget } = useFinanceStore();
  const { setGoldPrice } = useZakatStore();
  const { setTarget, setMonthlySavings } = usePlannerStore();

  const [step, setStep] = useState(0);

  // Step 1: Income
  const [salaryAmount, setSalaryAmount] = useState('');

  // Step 2: Expenses
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(
    COMMON_EXPENSES.map((e) => ({ category: e.category, amount: '' }))
  );

  // Step 3: Budgets
  const [budgetEntries, setBudgetEntries] = useState(
    BUDGET_SUGGESTIONS.map((b) => ({ category: b.category, amount: b.defaultAmount }))
  );

  // Step 4: Gold price
  const [goldPrice, setGoldPriceLocal] = useState('1700000');

  // Step 5: Goal
  const [goalAmount, setGoalAmount] = useState('');

  const updateExpense = (index: number, amount: string) => {
    setExpenses((prev) =>
      prev.map((e, i) => (i === index ? { ...e, amount } : e))
    );
  };

  const updateBudgetEntry = (index: number, amount: string) => {
    setBudgetEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, amount } : e))
    );
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finishSetup();
    }
  };

  const handleSkip = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finishSetup();
    }
  };

  const finishSetup = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Apply income recurring template
    const salary = parseInt(salaryAmount, 10);
    if (salary > 0) {
      addRecurringTemplate({
        amount: salary,
        category: 'salary',
        type: 'income',
        note: 'Monthly salary',
        dayOfMonth: 1,
        active: true,
      });
    }

    // Apply expense recurring templates
    expenses.forEach((e) => {
      const amt = parseInt(e.amount, 10);
      if (amt > 0) {
        addRecurringTemplate({
          amount: amt,
          category: e.category,
          type: 'expense',
          note: '',
          dayOfMonth: 1,
          active: true,
        });
      }
    });

    // Apply budgets
    budgetEntries.forEach((b) => {
      const amt = parseInt(b.amount, 10);
      if (amt > 0) {
        setBudget(b.category, amt);
      }
    });

    // Apply gold price
    const gp = parseInt(goldPrice, 10);
    if (gp > 0) {
      setGoldPrice(gp);
    }

    // Apply goal
    const goal = parseInt(goalAmount, 10);
    if (goal > 0) {
      setTarget(goal);
      // Default monthly savings to ~10% of salary if salary set
      if (salary > 0) {
        setMonthlySavings(Math.round(salary * 0.2));
      }
    } else if (salary > 0) {
      // Smart default: 10x annual salary
      setTarget(salary * 12 * 10);
      setMonthlySavings(Math.round(salary * 0.2));
    }

    setCompletedSetup();
    router.replace('/(tabs)');
  };

  const current = STEPS[step];

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <View>
            <Text style={styles.inputLabel}>Monthly Salary (IDR)</Text>
            <View style={styles.inputRow}>
              <Text style={styles.prefix}>Rp</Text>
              <TextInput
                style={styles.input}
                value={salaryAmount}
                onChangeText={setSalaryAmount}
                keyboardType="numeric"
                placeholder="e.g. 10000000"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            {salaryAmount ? (
              <Text style={styles.hint}>Will auto-create a recurring income of {formatIDR(parseInt(salaryAmount, 10) || 0)} on the 1st of each month.</Text>
            ) : null}
          </View>
        );

      case 1:
        return (
          <View>
            {expenses.map((e, i) => {
              const cat = getCategoryById(e.category);
              return (
                <View key={e.category} style={styles.expenseRow}>
                  <Text style={styles.expenseLabel}>{cat?.icon} {cat?.label}</Text>
                  <View style={styles.inputRow}>
                    <Text style={styles.prefix}>Rp</Text>
                    <TextInput
                      style={styles.input}
                      value={e.amount}
                      onChangeText={(v) => updateExpense(i, v)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>
              );
            })}
            <Text style={styles.hint}>These will become recurring expense templates.</Text>
          </View>
        );

      case 2:
        return (
          <View>
            {budgetEntries.map((b, i) => {
              const cat = getCategoryById(b.category);
              return (
                <View key={b.category} style={styles.expenseRow}>
                  <Text style={styles.expenseLabel}>{cat?.icon} {cat?.label} monthly limit</Text>
                  <View style={styles.inputRow}>
                    <Text style={styles.prefix}>Rp</Text>
                    <TextInput
                      style={styles.input}
                      value={b.amount}
                      onChangeText={(v) => updateBudgetEntry(i, v)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>
              );
            })}
            <Text style={styles.hint}>You'll see alerts when spending approaches these limits.</Text>
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={styles.inputLabel}>Gold Price per Gram (IDR)</Text>
            <View style={styles.inputRow}>
              <Text style={styles.prefix}>Rp</Text>
              <TextInput
                style={styles.input}
                value={goldPrice}
                onChangeText={setGoldPriceLocal}
                keyboardType="numeric"
                placeholder="1700000"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <Text style={styles.hint}>
              Nisab = 85g gold = {formatIDR(85 * (parseInt(goldPrice, 10) || 0))}.{'\n'}
              Update this periodically for accurate Zakat calculation.
            </Text>
          </View>
        );

      case 4: {
        const salary = parseInt(salaryAmount, 10) || 0;
        const suggestedGoal = salary > 0 ? salary * 12 * 10 : 3_600_000_000;
        return (
          <View>
            <Text style={styles.inputLabel}>Financial Freedom Target (IDR)</Text>
            <View style={styles.inputRow}>
              <Text style={styles.prefix}>Rp</Text>
              <TextInput
                style={styles.input}
                value={goalAmount}
                onChangeText={setGoalAmount}
                keyboardType="numeric"
                placeholder={suggestedGoal.toString()}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            {salary > 0 && (
              <TouchableOpacity onPress={() => setGoalAmount(suggestedGoal.toString())}>
                <Text style={[styles.hint, { color: colors.accent }]}>
                  Suggested: {formatIDR(suggestedGoal)} (10x annual income). Tap to use.
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.hint}>This is the amount that would let you live off halal investments.</Text>
          </View>
        );
      }

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress */}
        <View style={styles.progressRow}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.progressDot, i <= step && { backgroundColor: colors.accent }]} />
          ))}
        </View>

        {/* Step Header */}
        <View style={styles.header}>
          <Text style={styles.stepIcon}>{current.icon}</Text>
          <Text style={styles.stepTitle}>{current.title}</Text>
          <Text style={styles.stepSubtitle}>{current.subtitle}</Text>
        </View>

        {/* Step Content */}
        <View style={styles.stepContent}>
          {renderStepContent()}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button title={step < STEPS.length - 1 ? 'Next' : 'Finish Setup'} onPress={handleNext} />
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>{step < STEPS.length - 1 ? 'Skip' : 'Skip & Finish'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1, padding: 24 },
    progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
    progressDot: { width: 32, height: 4, borderRadius: 2, backgroundColor: colors.surfaceAlt },
    header: { alignItems: 'center', marginBottom: 32 },
    stepIcon: { fontSize: 48, marginBottom: 16 },
    stepTitle: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 8 },
    stepSubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
    stepContent: { flex: 1 },
    inputLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 8 },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
    prefix: { color: colors.accent, fontWeight: '600', marginRight: 4 },
    input: { flex: 1, color: colors.text, fontSize: 16, padding: 12 },
    hint: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 },
    expenseRow: { marginBottom: 12 },
    expenseLabel: { color: colors.text, fontSize: 14, fontWeight: '500', marginBottom: 4 },
    footer: { padding: 24, paddingBottom: 48 },
    skipBtn: { alignItems: 'center', marginTop: 12 },
    skipText: { color: colors.textMuted, fontSize: 14 },
  });
