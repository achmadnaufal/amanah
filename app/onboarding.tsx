import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../constants/theme';
import { ColorScheme } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';

const { width } = Dimensions.get('window');

const PAGES = [
  {
    icon: '🌙',
    title: 'Assalamu\'alaikum',
    subtitle: 'Welcome to Amanah — your halal-first personal finance tracker. Track spending, calculate Zakat, and build wealth the Islamic way.',
  },
  {
    icon: '🎯',
    title: 'Set Your Goals',
    subtitle: 'Plan for financial freedom with halal investments. Track your portfolio, savings, and progress toward your target — all riba-free.',
  },
  {
    icon: '🔒',
    title: 'Your Data Stays Yours',
    subtitle: 'All data is stored locally on your device. No cloud, no tracking, no ads. Your finances are private — as they should be.',
  },
];

export default function Onboarding() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [page, setPage] = useState(0);
  const setOnboarded = useAppStore((s) => s.setOnboarded);

  const handleNext = () => {
    if (page < PAGES.length - 1) {
      setPage(page + 1);
    } else {
      setOnboarded();
      router.replace('/(tabs)');
    }
  };

  const current = PAGES[page];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>{current.icon}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.subtitle}>{current.subtitle}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {PAGES.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {page < PAGES.length - 1 ? 'Next' : 'Get Started'}
          </Text>
        </TouchableOpacity>

        {page < PAGES.length - 1 && (
          <TouchableOpacity
            onPress={() => {
              setOnboarded();
              router.replace('/(tabs)');
            }}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between', padding: 32 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    icon: { fontSize: 64, marginBottom: 24 },
    title: { fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 16 },
    subtitle: { fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 },
    footer: { alignItems: 'center', paddingBottom: 32 },
    dots: { flexDirection: 'row', marginBottom: 24 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, marginHorizontal: 4 },
    dotActive: { backgroundColor: colors.accent, width: 24 },
    button: { backgroundColor: colors.primaryLight, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 48, width: width - 64, alignItems: 'center' },
    buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
    skipText: { color: colors.textMuted, fontSize: 14, marginTop: 16 },
  });
