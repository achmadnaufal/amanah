import React from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { usePlannerStore } from '../../store/usePlannerStore';
import { formatIDR } from '../../utils/currency';
import { calculateFinancialFreedom } from '../../utils/planner';
import { useNetWorth } from '../../utils/netWorth';

export default function Planner() {
  const { targetAmount, monthlySavings, annualReturnRate, setTarget, setMonthlySavings, setAnnualReturnRate } = usePlannerStore();
  const netWorth = useNetWorth();

  const result = calculateFinancialFreedom(netWorth, targetAmount, monthlySavings, annualReturnRate);
  const { yearsToGoal, monthsToGoal, progressPercent, projectedYear } = result;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Hero */}
      <Card style={{ borderColor: Colors.accent }}>
        <Text style={styles.heroLabel}>🎯 Financial Freedom Target</Text>
        <Text style={styles.heroAmount}>{formatIDR(targetAmount)}</Text>
        <ProgressBar progress={progressPercent} showPercent color={Colors.accent} />
        <Text style={styles.heroSub}>
          {progressPercent < 100
            ? `On track to reach your goal in ${yearsToGoal} years${monthsToGoal > 0 ? ` ${monthsToGoal} months` : ''} (${projectedYear})`
            : '🎉 Congratulations! Goal reached!'}
        </Text>
      </Card>

      {/* Current State */}
      <Card>
        <Text style={styles.sectionTitle}>📊 Current Status</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Net Worth</Text>
          <Text style={[styles.rowValue, { color: netWorth >= 0 ? Colors.success : Colors.error }]}>{formatIDR(netWorth)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Remaining to Goal</Text>
          <Text style={styles.rowValue}>{formatIDR(Math.max(targetAmount - netWorth, 0))}</Text>
        </View>
      </Card>

      {/* Inputs */}
      <Card>
        <Text style={styles.sectionTitle}>⚙️ Planning Parameters</Text>

        <Text style={styles.inputLabel}>Financial Freedom Target (IDR)</Text>
        <TextInput
          style={styles.input}
          value={targetAmount.toString()}
          onChangeText={(v) => setTarget(parseInt(v.replace(/[^0-9]/g, ''), 10) || 0)}
          keyboardType="numeric"
          placeholderTextColor={Colors.textMuted}
        />

        <Text style={styles.inputLabel}>Monthly Savings / Investment (IDR)</Text>
        <TextInput
          style={styles.input}
          value={monthlySavings.toString()}
          onChangeText={(v) => setMonthlySavings(parseInt(v.replace(/[^0-9]/g, ''), 10) || 0)}
          keyboardType="numeric"
          placeholderTextColor={Colors.textMuted}
        />

        <Text style={styles.inputLabel}>Expected Halal Return Rate (% per year)</Text>
        <TextInput
          style={styles.input}
          value={(annualReturnRate * 100).toFixed(1)}
          onChangeText={(v) => setAnnualReturnRate((parseFloat(v) || 0) / 100)}
          keyboardType="decimal-pad"
          placeholderTextColor={Colors.textMuted}
        />
        <Text style={styles.hint}>Default 7% — typical for Islamic mutual funds</Text>
      </Card>

      {/* Projection */}
      <Card>
        <Text style={styles.sectionTitle}>📈 Projection</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Time needed</Text>
          <Text style={[styles.rowValue, { color: Colors.accent }]}>
            {yearsToGoal > 0 ? `${yearsToGoal} yr ${monthsToGoal} mo` : 'Already reached!'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Target year</Text>
          <Text style={[styles.rowValue, { color: Colors.accent }]}>{projectedYear}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Annual return</Text>
          <Text style={styles.rowValue}>{(annualReturnRate * 100).toFixed(1)}% / year</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Monthly investment</Text>
          <Text style={styles.rowValue}>{formatIDR(monthlySavings)}</Text>
        </View>
      </Card>

      {/* Inspiration */}
      <Card style={{ backgroundColor: Colors.primaryLight, borderColor: Colors.primary }}>
        <Text style={styles.quoteText}>
          💡 "Allah has permitted trade and forbidden riba." — Al-Baqarah: 275
        </Text>
        <Text style={[styles.quoteText, { marginTop: 8, color: Colors.textMuted }]}>
          Disciplined halal investing with tawakkul brings barakah to your wealth.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  heroAmount: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  heroSub: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
  sectionTitle: { color: Colors.text, fontWeight: '700', fontSize: 15, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { color: Colors.textMuted, flex: 1 },
  rowValue: { color: Colors.text, fontWeight: '600' },
  inputLabel: { color: Colors.textMuted, fontSize: 13, marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: Colors.surfaceAlt, borderRadius: 8, padding: 12, color: Colors.text, marginBottom: 4, borderWidth: 1, borderColor: Colors.border, fontSize: 15 },
  hint: { color: Colors.textMuted, fontSize: 12, marginBottom: 8 },
  quoteText: { color: Colors.text, fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
});
