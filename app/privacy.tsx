import React from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';

export default function Privacy() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.updated}>Last updated: March 2026</Text>

      <Text style={styles.heading}>Data Storage</Text>
      <Text style={styles.body}>
        All your financial data is stored locally on your device using AsyncStorage.
        We do not collect, transmit, or store any of your personal or financial information
        on external servers.
      </Text>

      <Text style={styles.heading}>No Analytics or Tracking</Text>
      <Text style={styles.body}>
        Amanah does not use any analytics SDKs, tracking pixels, or advertising identifiers.
        Your usage of the app is completely private.
      </Text>

      <Text style={styles.heading}>No Account Required</Text>
      <Text style={styles.body}>
        You do not need to create an account or provide any personal information to use Amanah.
        The app works entirely offline.
      </Text>

      <Text style={styles.heading}>In-App Purchases</Text>
      <Text style={styles.body}>
        If you choose to purchase Amanah Pro, the transaction is processed by Apple or Google
        through their respective app stores. We do not have access to your payment information.
        Purchase status is verified through RevenueCat, which receives only an anonymous app user ID.
      </Text>

      <Text style={styles.heading}>Data Deletion</Text>
      <Text style={styles.body}>
        Since all data is stored locally, uninstalling the app will permanently delete all your data.
        There is nothing to delete on our end.
      </Text>

      <Text style={styles.heading}>Contact</Text>
      <Text style={styles.body}>
        If you have questions about this privacy policy, please contact us at
        support@amanah-app.com.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 48 },
  back: { color: Colors.accent, fontSize: 16, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  updated: { color: Colors.textMuted, fontSize: 13, marginBottom: 24 },
  heading: { fontSize: 17, fontWeight: '700', color: Colors.text, marginTop: 20, marginBottom: 8 },
  body: { fontSize: 15, color: Colors.textMuted, lineHeight: 22 },
});
