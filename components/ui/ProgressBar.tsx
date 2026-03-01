import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercent?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, showPercent, color }) => {
  const pct = Math.min(Math.max(progress, 0), 100);
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color || Colors.accent }]} />
      </View>
      {showPercent && <Text style={styles.pct}>{pct.toFixed(1)}%</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 6 },
  label: { color: Colors.textMuted, fontSize: 12, marginBottom: 4 },
  track: { height: 8, backgroundColor: Colors.surfaceAlt, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  pct: { color: Colors.accent, fontSize: 12, marginTop: 2, textAlign: 'right' },
});
