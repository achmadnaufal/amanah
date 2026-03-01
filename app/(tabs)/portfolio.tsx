import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { usePlannerStore, PortfolioAsset } from '../../store/usePlannerStore';
import { formatIDR } from '../../utils/currency';

const ASSET_TYPES: { id: PortfolioAsset['type']; label: string; icon: string; color: string }[] = [
  { id: 'emas', label: 'Gold', icon: '🥇', color: '#F9A825' },
  { id: 'reksa_dana_syariah', label: 'Islamic Mutual Fund', icon: '📈', color: '#3FB950' },
  { id: 'sukuk', label: 'Sukuk', icon: '📜', color: '#58A6FF' },
  { id: 'properti', label: 'Property', icon: '🏠', color: '#D29922' },
  { id: 'bisnis', label: 'Business', icon: '🏪', color: '#BC8CFF' },
  { id: 'kas', label: 'Cash / Savings', icon: '💵', color: '#39D353' },
];

export default function Portfolio() {
  const { portfolioAssets, addAsset, deleteAsset, updateAsset } = usePlannerStore();
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [type, setType] = useState<PortfolioAsset['type']>('kas');
  const [label, setLabel] = useState('');
  const [valueStr, setValueStr] = useState('');
  const [emasGramStr, setEmasGramStr] = useState('');

  const total = portfolioAssets.reduce((s, a) => s + a.valueIDR, 0);

  const openAdd = () => {
    setEditId(null); setType('kas'); setLabel(''); setValueStr(''); setEmasGramStr('');
    setModal(true);
  };

  const openEdit = (a: PortfolioAsset) => {
    setEditId(a.id); setType(a.type); setLabel(a.label); setValueStr(a.valueIDR.toString());
    setEmasGramStr(a.emasGram?.toString() || '');
    setModal(true);
  };

  const handleSave = () => {
    const value = parseInt(valueStr.replace(/[^0-9]/g, ''), 10) || 0;
    const emasGram = parseFloat(emasGramStr) || undefined;
    const assetLabel = label || ASSET_TYPES.find(t => t.id === type)?.label || type;
    if (editId) {
      updateAsset(editId, { type, label: assetLabel, valueIDR: value, emasGram });
    } else {
      addAsset({ type, label: assetLabel, valueIDR: value, emasGram });
    }
    setModal(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Asset?', 'This asset will be permanently deleted.', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAsset(id) },
    ]);
  };

  const allocationByType: Record<string, number> = {};
  portfolioAssets.forEach((a) => {
    allocationByType[a.type] = (allocationByType[a.type] || 0) + a.valueIDR;
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Total */}
        <Card>
          <Text style={styles.sectionLabel}>Total Halal Portfolio</Text>
          <Text style={styles.totalAmount}>{formatIDR(total)}</Text>
          <Text style={styles.hint}>✅ Riba-free assets only</Text>
        </Card>

        {/* Allocation */}
        {Object.keys(allocationByType).length > 0 && (
          <Card>
            <Text style={styles.sectionLabel}>Allocation</Text>
            {ASSET_TYPES.filter(at => allocationByType[at.id] > 0).map((at) => {
              const pct = total > 0 ? (allocationByType[at.id] / total * 100).toFixed(1) : '0';
              return (
                <View key={at.id}>
                  <View style={styles.allocRow}>
                    <Text style={styles.allocIcon}>{at.icon}</Text>
                    <Text style={[styles.allocLabel, { color: at.color }]}>{at.label}</Text>
                    <Text style={styles.allocPct}>{pct}%</Text>
                    <Text style={styles.allocValue}>{formatIDR(allocationByType[at.id])}</Text>
                  </View>
                  <View style={styles.allocBarTrack}>
                    <View style={[styles.allocBarFill, { width: `${pct}%` as any, backgroundColor: at.color }]} />
                  </View>
                </View>
              );
            })}
          </Card>
        )}

        {/* Assets List */}
        <Text style={styles.listTitle}>Assets</Text>
        {portfolioAssets.length === 0 ? (
          <Text style={styles.empty}>No assets yet. Add your halal assets.</Text>
        ) : (
          portfolioAssets.map((a) => {
            const at = ASSET_TYPES.find(t => t.id === a.type);
            return (
              <TouchableOpacity key={a.id} onPress={() => openEdit(a)} onLongPress={() => handleDelete(a.id)}>
                <Card>
                  <View style={styles.assetRow}>
                    <Text style={styles.assetIcon}>{at?.icon || '💰'}</Text>
                    <View style={styles.assetInfo}>
                      <Text style={styles.assetLabel}>{a.label}</Text>
                      {a.emasGram ? <Text style={styles.assetSub}>{a.emasGram}g gold</Text> : null}
                    </View>
                    <Text style={[styles.assetValue, { color: at?.color || Colors.accent }]}>{formatIDR(a.valueIDR)}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editId ? 'Edit Asset' : 'Add Asset'}</Text>

            <Text style={styles.inputLabel}>Asset Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {ASSET_TYPES.map((at) => (
                <TouchableOpacity
                  key={at.id}
                  onPress={() => setType(at.id)}
                  style={[styles.typeChip, type === at.id && { borderColor: at.color }]}
                >
                  <Text style={{ color: type === at.id ? at.color : Colors.text }}>{at.icon} {at.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput style={styles.input} placeholder="Label / Name" placeholderTextColor={Colors.textMuted} value={label} onChangeText={setLabel} />

            {type === 'emas' && (
              <TextInput style={styles.input} placeholder="Weight in grams" placeholderTextColor={Colors.textMuted} keyboardType="decimal-pad" value={emasGramStr} onChangeText={setEmasGramStr} />
            )}

            <TextInput style={styles.input} placeholder="Value (IDR)" placeholderTextColor={Colors.textMuted} keyboardType="numeric" value={valueStr} onChangeText={setValueStr} />

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Cancel" variant="secondary" onPress={() => setModal(false)} style={{ flex: 1 }} />
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
  sectionLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  totalAmount: { fontSize: 28, fontWeight: '800', color: Colors.accent },
  hint: { color: Colors.success, fontSize: 12, marginTop: 4 },
  allocRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  allocIcon: { fontSize: 16, marginRight: 6 },
  allocLabel: { flex: 1, fontSize: 13 },
  allocPct: { color: Colors.textMuted, fontSize: 12, marginRight: 8 },
  allocValue: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  allocBarTrack: { height: 6, backgroundColor: Colors.surfaceAlt, borderRadius: 3, marginBottom: 10 },
  allocBarFill: { height: '100%', borderRadius: 3 },
  listTitle: { color: Colors.text, fontWeight: '700', fontSize: 15, marginBottom: 8, marginTop: 4 },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 20 },
  assetRow: { flexDirection: 'row', alignItems: 'center' },
  assetIcon: { fontSize: 22, marginRight: 10 },
  assetInfo: { flex: 1 },
  assetLabel: { color: Colors.text, fontWeight: '500' },
  assetSub: { color: Colors.textMuted, fontSize: 12 },
  assetValue: { fontWeight: '700', fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: Colors.accent, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fabText: { fontSize: 28, color: Colors.background, fontWeight: '700', lineHeight: 32 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  inputLabel: { color: Colors.textMuted, fontSize: 12, marginBottom: 6 },
  input: { backgroundColor: Colors.surfaceAlt, borderRadius: 8, padding: 12, color: Colors.text, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  typeChip: { backgroundColor: Colors.surfaceAlt, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: Colors.border },
});
