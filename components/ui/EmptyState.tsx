import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../constants/theme';
import { ColorScheme } from '../../constants/colors';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle, ctaLabel, onCta }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {ctaLabel && onCta && (
        <TouchableOpacity style={styles.cta} onPress={onCta}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
    icon: { fontSize: 48, marginBottom: 16 },
    title: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
    cta: { marginTop: 20, backgroundColor: colors.primaryLight, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
    ctaText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  });
