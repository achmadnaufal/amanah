import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants/colors';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercent?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, showPercent, color }) => {
  const pct = Math.min(Math.max(progress, 0), 100);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthInterpolation, backgroundColor: color || Colors.accent }]} />
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
