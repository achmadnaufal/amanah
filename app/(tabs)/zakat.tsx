import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Modal } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../constants/theme';
import { ColorScheme } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { CurrencyInput } from '../../components/ui/CurrencyInput';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useZakatStore } from '../../store/useZakatStore';
import { formatIDR } from '../../utils/currency';
import { calculateZakat, NISAB_GOLD_GRAMS } from '../../utils/zakat';
import { calculateHawlStatus } from '../../utils/hawl';

export default function ZakatScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { assets, liabilities, goldPricePerGram, payments, hawlStartDate, setAssets, setLiabilities, setGoldPrice, addPayment, updateHawlTracking } = useZakatStore();
  const [payModal, setPayModal] = useState(false);
  const [payNote, setPayNote] = useState('');

  const goldValue = assets.emasGram * goldPricePerGram;
  const totalAssets = assets.uangTunai + assets.tabungan + goldValue + assets.investasi + assets.piutang;
  const { zakatAmount, nisab, netAssets, isWajib } = calculateZakat(totalAssets, liabilities.hutangJangkaPendek, goldPricePerGram);

  // Update hawl tracking when nisab status changes
  useEffect(() => {
    updateHawlTracking(isWajib);
  }, [isWajib]);

  const hawlStatus = useMemo(() => calculateHawlStatus(hawlStartDate), [hawlStartDate]);

  const handlePay = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPayment({ date: new Date().toISOString(), amount: zakatAmount, note: payNote });
    setPayModal(false);
    setPayNote('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Gold Price */}
      <Card>
        <Text style={styles.sectionTitle}>⚙️ Gold Price (Manual)</Text>
        <CurrencyInput
          label={`Price per gram (current: ${formatIDR(goldPricePerGram)})`}
          value={goldPricePerGram}
          onChange={setGoldPrice}
        />
        <Text style={styles.hint}>Nisab = {NISAB_GOLD_GRAMS}g gold = {formatIDR(nisab)}</Text>
      </Card>

      {/* Hawl Countdown */}
      {hawlStatus.isTracking && (
        <Card style={{ borderColor: hawlStatus.isComplete ? colors.accent : colors.border }}>
          <Text style={styles.sectionTitle}>Hawl Countdown</Text>
          <View style={{ alignItems: 'center', marginVertical: 12 }}>
            {/* Circular Progress */}
            <View style={{ position: 'relative', width: 140, height: 140, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={140} height={140}>
                <Circle
                  cx={70} cy={70} r={60}
                  stroke={colors.surfaceAlt}
                  strokeWidth={8}
                  fill="none"
                />
                <Circle
                  cx={70} cy={70} r={60}
                  stroke={hawlStatus.isComplete ? colors.accent : colors.success}
                  strokeWidth={8}
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${2 * Math.PI * 60 * (1 - hawlStatus.progressPercent / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                />
              </Svg>
              <View style={{ position: 'absolute', alignItems: 'center' }}>
                {hawlStatus.isComplete ? (
                  <>
                    <Text style={[styles.hawlBigText, { color: colors.accent }]}>Due!</Text>
                    <Text style={styles.hint}>Zakat is now obligatory</Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.hawlBigText, { color: colors.text }]}>{hawlStatus.daysRemaining}</Text>
                    <Text style={styles.hint}>days remaining</Text>
                  </>
                )}
              </View>
            </View>

            {/* Hawl Details */}
            <View style={{ marginTop: 12, width: '100%' }}>
              {hawlStatus.hijriStartDate && (
                <View style={styles.hawlDetailRow}>
                  <Text style={styles.hint}>Started:</Text>
                  <Text style={[styles.hint, { color: colors.text }]}>{hawlStatus.hijriStartDate}</Text>
                </View>
              )}
              <View style={styles.hawlDetailRow}>
                <Text style={styles.hint}>Days elapsed:</Text>
                <Text style={[styles.hint, { color: colors.text }]}>{hawlStatus.daysElapsed} / {hawlStatus.totalDays}</Text>
              </View>
              {hawlStatus.estimatedDueDate && (
                <View style={styles.hawlDetailRow}>
                  <Text style={styles.hint}>Due date (est.):</Text>
                  <Text style={[styles.hint, { color: colors.accent }]}>
                    {hawlStatus.estimatedDueDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>
      )}

      {!hawlStatus.isTracking && (
        <Card>
          <Text style={styles.sectionTitle}>Hawl Tracker</Text>
          <Text style={styles.hint}>
            The hawl (lunar year countdown) will start automatically when your net assets exceed the nisab threshold.
            Once a full Hijri year passes with assets above nisab, Zakat becomes obligatory.
          </Text>
        </Card>
      )}

      {/* Assets */}
      <Card>
        <Text style={styles.sectionTitle}>💰 Assets</Text>
        <CurrencyInput label="Cash on Hand" value={assets.uangTunai} onChange={(v) => setAssets({ uangTunai: v })} />
        <CurrencyInput label="Bank Savings" value={assets.tabungan} onChange={(v) => setAssets({ tabungan: v })} />
        <View style={styles.goldRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Gold (grams)</Text>
            <TextInput
              style={styles.gramInput}
              value={assets.emasGram > 0 ? assets.emasGram.toString() : ''}
              onChangeText={(v) => setAssets({ emasGram: parseFloat(v) || 0 })}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={{ flex: 1, paddingLeft: 8 }}>
            <Text style={styles.inputLabel}>Gold Value</Text>
            <Text style={styles.goldValue}>{formatIDR(goldValue)}</Text>
          </View>
        </View>
        <CurrencyInput label="Halal Investments" value={assets.investasi} onChange={(v) => setAssets({ investasi: v })} />
        <CurrencyInput label="Receivables (collectible)" value={assets.piutang} onChange={(v) => setAssets({ piutang: v })} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Assets:</Text>
          <Text style={styles.totalValue}>{formatIDR(totalAssets)}</Text>
        </View>
      </Card>

      {/* Liabilities */}
      <Card>
        <Text style={styles.sectionTitle}>💳 Liabilities</Text>
        <CurrencyInput label="Short-term Debt" value={liabilities.hutangJangkaPendek} onChange={(v) => setLiabilities({ hutangJangkaPendek: v })} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Net Assets:</Text>
          <Text style={styles.totalValue}>{formatIDR(netAssets)}</Text>
        </View>
      </Card>

      {/* Result */}
      <Card style={{ borderColor: isWajib ? colors.accent : colors.border }}>
        <Text style={styles.sectionTitle}>🌙 Zakat Calculation</Text>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Nisab threshold:</Text>
          <Text style={styles.resultValue}>{formatIDR(nisab)}</Text>
        </View>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Net Assets:</Text>
          <Text style={styles.resultValue}>{formatIDR(netAssets)}</Text>
        </View>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Status:</Text>
          <Text style={[styles.resultValue, { color: isWajib ? colors.accent : colors.textMuted }]}>
            {isWajib ? '✅ Zakat Due' : '⏳ Below Nisab'}
          </Text>
        </View>
        {isWajib && (
          <>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Zakat (2.5%):</Text>
              <Text style={[styles.resultValue, { color: colors.accent, fontSize: 20, fontWeight: '800' }]}>{formatIDR(zakatAmount)}</Text>
            </View>
            <Button title="Record Zakat Payment" onPress={() => setPayModal(true)} style={{ marginTop: 8 }} />
          </>
        )}
      </Card>

      {/* Payment History */}
      <Card>
        <Text style={styles.sectionTitle}>📜 Payment History</Text>
        {payments.length === 0 ? (
          <EmptyState
            icon="🤲"
            title="No Zakat payments yet"
            subtitle="Your Zakat payment history will appear here after you record a payment."
          />
        ) : (
          payments.map((p) => (
            <View key={p.id} style={styles.payRow}>
              <View>
                <Text style={styles.payDate}>{new Date(p.date).toLocaleDateString('en-US')}</Text>
                {p.note ? <Text style={styles.payNote}>{p.note}</Text> : null}
              </View>
              <Text style={[styles.resultValue, { color: colors.accent }]}>{formatIDR(p.amount)}</Text>
            </View>
          ))
        )}
      </Card>

      {/* Pay Modal */}
      <Modal visible={payModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Record Zakat Payment</Text>
            <Text style={styles.modalAmount}>{formatIDR(zakatAmount)}</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Note (optional)"
              placeholderTextColor={colors.textMuted}
              value={payNote}
              onChangeText={setPayNote}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Cancel" variant="secondary" onPress={() => setPayModal(false)} style={{ flex: 1 }} />
              <Button title="Save" onPress={handlePay} style={{ flex: 1 }} />
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
    sectionTitle: { color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 12 },
    hint: { color: colors.textMuted, fontSize: 12 },
    goldRow: { flexDirection: 'row', marginBottom: 12 },
    inputLabel: { color: colors.textMuted, fontSize: 13, marginBottom: 4 },
    gramInput: { backgroundColor: colors.surfaceAlt, borderRadius: 8, padding: 10, color: colors.text, borderWidth: 1, borderColor: colors.border },
    goldValue: { color: colors.accent, fontSize: 16, fontWeight: '700', padding: 10 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
    totalLabel: { color: colors.textMuted, fontWeight: '600' },
    totalValue: { color: colors.text, fontWeight: '700', fontSize: 16 },
    resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    resultLabel: { color: colors.textMuted },
    resultValue: { color: colors.text, fontWeight: '600' },
    payRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
    payDate: { color: colors.text, fontSize: 14 },
    payNote: { color: colors.textMuted, fontSize: 12 },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
    modal: { backgroundColor: colors.surface, borderRadius: 16, padding: 20 },
    modalTitle: { color: colors.text, fontWeight: '700', fontSize: 16, textAlign: 'center', marginBottom: 8 },
    modalAmount: { color: colors.accent, fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
    noteInput: { backgroundColor: colors.surfaceAlt, borderRadius: 8, padding: 12, color: colors.text, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    hawlBigText: { fontSize: 28, fontWeight: '800' },
    hawlDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  });
