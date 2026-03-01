import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Modal } from 'react-native';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { CurrencyInput } from '../../components/ui/CurrencyInput';
import { Button } from '../../components/ui/Button';
import { useZakatStore } from '../../store/useZakatStore';
import { formatIDR } from '../../utils/currency';
import { calculateZakat, NISAB_GOLD_GRAMS } from '../../utils/zakat';

export default function ZakatScreen() {
  const { assets, liabilities, goldPricePerGram, payments, setAssets, setLiabilities, setGoldPrice, addPayment } = useZakatStore();
  const [payModal, setPayModal] = useState(false);
  const [payNote, setPayNote] = useState('');

  const goldValue = assets.emasGram * goldPricePerGram;
  const totalAssets = assets.uangTunai + assets.tabungan + goldValue + assets.investasi + assets.piutang;
  const { zakatAmount, nisab, netAssets, isWajib } = calculateZakat(totalAssets, liabilities.hutangJangkaPendek, goldPricePerGram);

  const handlePay = () => {
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
              placeholderTextColor={Colors.textMuted}
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
      <Card style={{ borderColor: isWajib ? Colors.accent : Colors.border }}>
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
          <Text style={[styles.resultValue, { color: isWajib ? Colors.accent : Colors.textMuted }]}>
            {isWajib ? '✅ Zakat Due' : '⏳ Below Nisab'}
          </Text>
        </View>
        {isWajib && (
          <>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Zakat (2.5%):</Text>
              <Text style={[styles.resultValue, { color: Colors.accent, fontSize: 20, fontWeight: '800' }]}>{formatIDR(zakatAmount)}</Text>
            </View>
            <Button title="Record Zakat Payment" onPress={() => setPayModal(true)} style={{ marginTop: 8 }} />
          </>
        )}
      </Card>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>📜 Payment History</Text>
          {payments.map((p) => (
            <View key={p.id} style={styles.payRow}>
              <View>
                <Text style={styles.payDate}>{new Date(p.date).toLocaleDateString('en-US')}</Text>
                {p.note ? <Text style={styles.payNote}>{p.note}</Text> : null}
              </View>
              <Text style={[styles.resultValue, { color: Colors.accent }]}>{formatIDR(p.amount)}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Pay Modal */}
      <Modal visible={payModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Record Zakat Payment</Text>
            <Text style={styles.modalAmount}>{formatIDR(zakatAmount)}</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Note (optional)"
              placeholderTextColor={Colors.textMuted}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  sectionTitle: { color: Colors.text, fontWeight: '700', fontSize: 15, marginBottom: 12 },
  hint: { color: Colors.textMuted, fontSize: 12 },
  goldRow: { flexDirection: 'row', marginBottom: 12 },
  inputLabel: { color: Colors.textMuted, fontSize: 13, marginBottom: 4 },
  gramInput: { backgroundColor: Colors.surfaceAlt, borderRadius: 8, padding: 10, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  goldValue: { color: Colors.accent, fontSize: 16, fontWeight: '700', padding: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8 },
  totalLabel: { color: Colors.textMuted, fontWeight: '600' },
  totalValue: { color: Colors.text, fontWeight: '700', fontSize: 16 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resultLabel: { color: Colors.textMuted },
  resultValue: { color: Colors.text, fontWeight: '600' },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  payDate: { color: Colors.text, fontSize: 14 },
  payNote: { color: Colors.textMuted, fontSize: 12 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20 },
  modalTitle: { color: Colors.text, fontWeight: '700', fontSize: 16, textAlign: 'center', marginBottom: 8 },
  modalAmount: { color: Colors.accent, fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  noteInput: { backgroundColor: Colors.surfaceAlt, borderRadius: 8, padding: 12, color: Colors.text, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
});
