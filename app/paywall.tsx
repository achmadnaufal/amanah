import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useTheme } from '../constants/theme';
import { ColorScheme } from '../constants/colors';
import { purchasePackage, restorePurchases } from '../utils/purchases';

export default function Paywall() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadOfferings() {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current?.availablePackages) {
          setPackages(offerings.current.availablePackages);
        }
      } catch {
        // Not configured yet
      }
    }
    loadOfferings();
  }, []);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setLoading(true);
    const success = await purchasePackage(pkg);
    setLoading(false);
    if (success) {
      Alert.alert('Welcome to Pro!', 'Thank you for supporting Amanah.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    const success = await restorePurchases();
    setLoading(false);
    if (success) {
      Alert.alert('Restored!', 'Your Pro access has been restored.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('No Purchase Found', 'We couldn\'t find a previous purchase to restore.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.icon}>⭐</Text>
        <Text style={styles.title}>Amanah Pro</Text>
        <Text style={styles.subtitle}>Unlock powerful features to manage your halal finances</Text>

        <View style={styles.features}>
          {[
            'CSV & PDF export',
            'Net worth history chart',
            'Unlimited recurring transactions',
            'Priority support',
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {packages.length > 0 ? (
          packages.map((pkg) => {
            const isHighlight = pkg.packageType === 'LIFETIME';
            return (
              <TouchableOpacity
                key={pkg.identifier}
                style={[styles.purchaseBtn, isHighlight && styles.purchaseBtnHighlight]}
                onPress={() => handlePurchase(pkg)}
                disabled={loading}
              >
                <Text style={[styles.purchaseBtnTitle, isHighlight && { color: '#FFFFFF' }]}>{pkg.product.title}</Text>
                <Text style={[styles.purchaseBtnPrice, isHighlight && { color: '#E6EDF3' }]}>{pkg.product.priceString}</Text>
                {isHighlight && (
                  <Text style={[styles.bestValue, { color: '#E6EDF3' }]}>Best Value</Text>
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.placeholderPackages}>
            <TouchableOpacity style={styles.purchaseBtn} disabled>
              <Text style={styles.purchaseBtnTitle}>Monthly</Text>
              <Text style={styles.purchaseBtnPrice}>IDR 19,900/mo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.purchaseBtn, styles.purchaseBtnHighlight]} disabled>
              <Text style={[styles.purchaseBtnTitle, { color: '#FFFFFF' }]}>Lifetime</Text>
              <Text style={[styles.purchaseBtnPrice, { color: '#E6EDF3' }]}>IDR 149,000</Text>
              <Text style={[styles.bestValue, { color: '#E6EDF3' }]}>Best Value</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {loading && <ActivityIndicator color={colors.accent} style={{ marginBottom: 12 }} />}
        <TouchableOpacity onPress={handleRestore} disabled={loading}>
          <Text style={styles.restoreText}>Restore Purchase</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    closeBtn: { position: 'absolute', top: 56, right: 20, zIndex: 1 },
    closeText: { color: colors.textMuted, fontSize: 24 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    icon: { fontSize: 56, marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '800', color: colors.accent, marginBottom: 8 },
    subtitle: { fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
    features: { width: '100%', marginBottom: 32 },
    featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    featureCheck: { color: colors.success, fontSize: 18, fontWeight: '700', marginRight: 12 },
    featureText: { color: colors.text, fontSize: 15 },
    purchaseBtn: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, width: '100%', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    purchaseBtnHighlight: { borderColor: colors.accent, backgroundColor: colors.primary },
    purchaseBtnTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
    purchaseBtnPrice: { color: colors.accent, fontSize: 14, marginTop: 4 },
    bestValue: { color: colors.accent, fontSize: 11, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
    placeholderPackages: { width: '100%' },
    footer: { alignItems: 'center', paddingBottom: 48 },
    restoreText: { color: colors.textMuted, fontSize: 14 },
  });
