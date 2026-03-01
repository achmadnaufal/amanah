import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal,
  TextInput, Alert, Platform,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../constants/theme';
import { ColorScheme } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useFinanceStore, Transaction } from '../../store/useFinanceStore';
import { formatIDR } from '../../utils/currency';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, ALL_CATEGORIES, getCategoryById } from '../../constants/categories';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Transactions() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore();
  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [txDate, setTxDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    if (d.getFullYear() !== filterYear || d.getMonth() !== filterMonth) return false;
    if (filterCategory && t.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const cat = getCategoryById(t.category);
      const matchNote = t.note?.toLowerCase().includes(q);
      const matchCat = cat?.label.toLowerCase().includes(q);
      if (!matchNote && !matchCat) return false;
    }
    return true;
  });

  const grouped: Record<string, Transaction[]> = {};
  filtered.forEach((t) => {
    const key = new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  const openAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingTx(null);
    setTxType('expense');
    setAmount('');
    setCategory('');
    setNote('');
    setTxDate(new Date());
    setModalVisible(true);
  };

  const openEdit = (tx: Transaction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingTx(tx);
    setTxType(tx.type);
    setAmount(tx.amount.toString());
    setCategory(tx.category);
    setNote(tx.note || '');
    setTxDate(new Date(tx.date));
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!amount || !category) return Alert.alert('Missing Fields', 'Please enter an amount and select a category.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (editingTx) {
      updateTransaction(editingTx.id, {
        date: txDate.toISOString(),
        amount: parseInt(amount, 10),
        category,
        type: txType,
        note,
      });
    } else {
      addTransaction({ date: txDate.toISOString(), amount: parseInt(amount, 10), category, type: txType, note });
    }
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Delete?', 'Remove this transaction?', [
      { text: 'Cancel', onPress: () => swipeableRefs.current.get(id)?.close() },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteTransaction(id),
      },
    ]);
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

  const renderRightActions = (txId: string) => (
    <TouchableOpacity style={styles.swipeDelete} onPress={() => handleDelete(txId)}>
      <Text style={styles.swipeDeleteText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Month Filter */}
      <View style={styles.monthBar}>
        <TouchableOpacity onPress={prevMonth}><Text style={styles.arrow}>◀</Text></TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[filterMonth]} {filterYear}</Text>
        <TouchableOpacity onPress={nextMonth}><Text style={styles.arrow}>▶</Text></TouchableOpacity>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes or categories..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips} contentContainerStyle={{ paddingHorizontal: 16 }}>
        <TouchableOpacity
          style={[styles.filterChip, !filterCategory && styles.filterChipActive]}
          onPress={() => setFilterCategory(null)}
        >
          <Text style={[styles.filterChipText, !filterCategory && styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        {ALL_CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.filterChip, filterCategory === c.id && styles.filterChipActive]}
            onPress={() => setFilterCategory(filterCategory === c.id ? null : c.id)}
          >
            <Text style={[styles.filterChipText, filterCategory === c.id && styles.filterChipTextActive]}>
              {c.icon} {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {Object.keys(grouped).length === 0 ? (
          <EmptyState
            icon="📒"
            title="No transactions this month"
            subtitle="Tap the + button to add your first income or expense."
            ctaLabel="Add Transaction"
            onCta={openAdd}
          />
        ) : (
          Object.entries(grouped).map(([date, txs]) => (
            <View key={date}>
              <Text style={styles.dateHeader}>{date}</Text>
              {txs.map((tx) => {
                const cat = getCategoryById(tx.category);
                return (
                  <Swipeable
                    key={tx.id}
                    ref={(ref) => { if (ref) swipeableRefs.current.set(tx.id, ref); }}
                    renderRightActions={() => renderRightActions(tx.id)}
                    overshootRight={false}
                  >
                    <TouchableOpacity onPress={() => openEdit(tx)}>
                      <Card style={styles.txCard}>
                        <View style={styles.txRow}>
                          <Text style={styles.txIcon}>{cat?.icon || '💸'}</Text>
                          <View style={styles.txInfo}>
                            <Text style={styles.txCat}>{cat?.label || tx.category}</Text>
                            {tx.note ? <Text style={styles.txNote}>{tx.note}</Text> : null}
                          </View>
                          <Text style={[styles.txAmount, { color: tx.type === 'income' ? colors.success : colors.error }]}>
                            {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount)}
                          </Text>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  </Swipeable>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add/Edit Transaction Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingTx ? 'Edit Transaction' : 'Add Transaction'}</Text>

            <View style={styles.typeRow}>
              {(['income', 'expense'] as const).map((t) => {
                const isSelected = txType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, isSelected && { backgroundColor: t === 'income' ? colors.success : colors.error }]}
                    onPress={() => { setTxType(t); setCategory(''); }}
                  >
                    <Text style={[styles.typeBtnText, isSelected && { color: '#FFFFFF' }]}>
                      {t === 'income' ? '📈 Income' : '📉 Expense'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Amount (IDR)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            {/* Date Picker */}
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateBtnLabel}>Date: </Text>
              <Text style={styles.dateBtnValue}>
                {txDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={txDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={(_, selectedDate) => {
                  setShowDatePicker(Platform.OS !== 'ios');
                  if (selectedDate) setTxDate(selectedDate);
                }}
                themeVariant={isDark ? 'dark' : 'light'}
              />
            )}
            {showDatePicker && Platform.OS === 'ios' && (
              <Button title="Done" variant="secondary" onPress={() => setShowDatePicker(false)} style={{ marginBottom: 12 }} />
            )}

            <Text style={styles.sectionLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {cats.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setCategory(c.id)}
                  style={[styles.catChip, category === c.id && { borderColor: colors.accent }]}
                >
                  <Text style={styles.catChipText}>{c.icon} {c.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.input}
              placeholder="Note (optional)"
              placeholderTextColor={colors.textMuted}
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

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    monthBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    arrow: { color: colors.accent, fontSize: 18, padding: 4 },
    monthLabel: { color: colors.text, fontSize: 16, fontWeight: '700' },
    searchBar: { paddingHorizontal: 16, paddingTop: 8 },
    searchInput: { backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 14, color: colors.text, borderWidth: 1, borderColor: colors.border, fontSize: 14, lineHeight: 18 },
    filterChips: { maxHeight: 36, marginTop: 8, marginBottom: 4 },
    filterChip: { backgroundColor: 'transparent', borderRadius: 14, paddingHorizontal: 10, paddingTop: 5, paddingBottom: 6, marginRight: 6, borderWidth: 1, borderColor: colors.border, alignItems: 'center' as const, justifyContent: 'center' as const },
    filterChipActive: { borderColor: colors.accent, backgroundColor: colors.accent },
    filterChipText: { color: colors.text, fontSize: 11, lineHeight: 14, includeFontPadding: false, textAlignVertical: 'center' as const },
    filterChipTextActive: { color: '#FFFFFF', fontWeight: '600' },
    dateHeader: { color: colors.textMuted, fontSize: 12, fontWeight: '600', marginTop: 8, marginBottom: 4 },
    txCard: { marginBottom: 8 },
    txRow: { flexDirection: 'row', alignItems: 'center' },
    txIcon: { fontSize: 22, marginRight: 10 },
    txInfo: { flex: 1 },
    txCat: { color: colors.text, fontWeight: '500' },
    txNote: { color: colors.textMuted, fontSize: 12 },
    txAmount: { fontSize: 14, fontWeight: '700' },
    swipeDelete: { backgroundColor: colors.error, justifyContent: 'center', alignItems: 'center', width: 80, borderRadius: 12, marginBottom: 8, marginLeft: 8 },
    swipeDeleteText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: colors.accent, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
    fabText: { fontSize: 28, color: '#FFFFFF', fontWeight: '700', lineHeight: 32 },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modal: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    modalTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
    typeRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
    typeBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', backgroundColor: colors.surfaceAlt },
    typeBtnText: { color: colors.text, fontWeight: '600' },
    input: { backgroundColor: colors.surfaceAlt, borderRadius: 8, padding: 12, color: colors.text, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    dateBtnLabel: { color: colors.textMuted, fontSize: 14 },
    dateBtnValue: { color: colors.accent, fontSize: 14, fontWeight: '600' },
    sectionLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 6 },
    catChip: { backgroundColor: colors.surfaceAlt, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderWidth: 1, borderColor: colors.border },
    catChipText: { color: colors.text, fontSize: 13 },
    modalBtns: { flexDirection: 'row', marginTop: 8 },
  });
