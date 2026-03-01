import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal,
  TextInput, Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useFinanceStore, Transaction } from '../../store/useFinanceStore';
import { formatIDR } from '../../utils/currency';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, getCategoryById } from '../../constants/categories';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Transactions() {
  const { transactions, addTransaction, deleteTransaction } = useFinanceStore();
  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [modalVisible, setModalVisible] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === filterYear && d.getMonth() === filterMonth;
  });

  const grouped: Record<string, Transaction[]> = {};
  filtered.forEach((t) => {
    const key = new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  const handleSave = () => {
    if (!amount || !category) return Alert.alert('Missing Fields', 'Please enter an amount and select a category.');
    addTransaction({ date: new Date().toISOString(), amount: parseInt(amount, 10), category, type: txType, note });
    setModalVisible(false);
    setAmount('');
    setCategory('');
    setNote('');
  };

  const cats = txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const prevMonth = () => {
    if (filterMonth === 0) { setFilterMonth(11); setFilterYear(y => y - 1); }
    else setFilterMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (filterMonth === 11) { setFilterMonth(0); setFilterYear(y => y + 1); }
    else setFilterMonth(m => m + 1);
  };

  return (
    <View style={styles.container}>
      {/* Month Filter */}
      <View style={styles.monthBar}>
        <TouchableOpacity onPress={prevMonth}><Text style={styles.arrow}>◀</Text></TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[filterMonth]} {filterYear}</Text>
        <TouchableOpacity onPress={nextMonth}><Text style={styles.arrow}>▶</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {Object.keys(grouped).length === 0 ? (
          <Text style={styles.empty}>No transactions this month</Text>
        ) : (
          Object.entries(grouped).map(([date, txs]) => (
            <View key={date}>
              <Text style={styles.dateHeader}>{date}</Text>
              {txs.map((tx) => {
                const cat = getCategoryById(tx.category);
                return (
                  <TouchableOpacity
                    key={tx.id}
                    onLongPress={() => Alert.alert('Delete?', 'Remove this transaction?', [
                      { text: 'Cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(tx.id) },
                    ])}
                  >
                    <Card style={styles.txCard}>
                      <View style={styles.txRow}>
                        <Text style={styles.txIcon}>{cat?.icon || '💸'}</Text>
                        <View style={styles.txInfo}>
                          <Text style={styles.txCat}>{cat?.label || tx.category}</Text>
                          {tx.note ? <Text style={styles.txNote}>{tx.note}</Text> : null}
                        </View>
                        <Text style={[styles.txAmount, { color: tx.type === 'income' ? Colors.success : Colors.error }]}>
                          {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount)}
                        </Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Transaction Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Transaction</Text>

            <View style={styles.typeRow}>
              {(['income', 'expense'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, txType === t && { backgroundColor: t === 'income' ? Colors.success : Colors.error }]}
                  onPress={() => { setTxType(t); setCategory(''); }}
                >
                  <Text style={styles.typeBtnText}>{t === 'income' ? '📈 Income' : '📉 Expense'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Amount (IDR)"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.sectionLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {cats.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setCategory(c.id)}
                  style={[styles.catChip, category === c.id && { borderColor: Colors.accent }]}
                >
                  <Text style={styles.catChipText}>{c.icon} {c.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.input}
              placeholder="Note (optional)"
              placeholderTextColor={Colors.textMuted}
              value={note}
              onChangeText={setNote}
            />

            <View style={styles.modalBtns}>
              <Button title="Cancel" variant="secondary" onPress={() => setModalVisible(false)} style={{ flex: 1, marginRight: 8 }} />
              <Button title="Save" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  monthBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  arrow: { color: Colors.accent, fontSize: 18, padding: 4 },
  monthLabel: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15 },
  dateHeader: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  txCard: { marginBottom: 8 },
  txRow: { flexDirection: 'row', alignItems: 'center' },
  txIcon: { fontSize: 22, marginRight: 10 },
  txInfo: { flex: 1 },
  txCat: { color: Colors.text, fontWeight: '500' },
  txNote: { color: Colors.textMuted, fontSize: 12 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: Colors.accent, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabText: { fontSize: 28, color: Colors.background, fontWeight: '700', lineHeight: 32 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  typeRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  typeBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', backgroundColor: Colors.surfaceAlt },
  typeBtnText: { color: Colors.text, fontWeight: '600' },
  input: { backgroundColor: Colors.surfaceAlt, borderRadius: 8, padding: 12, color: Colors.text, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  sectionLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  catChip: { backgroundColor: Colors.surfaceAlt, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderWidth: 1, borderColor: Colors.border },
  catChipText: { color: Colors.text, fontSize: 13 },
  modalBtns: { flexDirection: 'row', marginTop: 8 },
});
