import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { formatIDR } from '../../utils/currency';

interface Slice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: Slice[];
  size?: number;
  strokeWidth?: number;
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, size = 160, strokeWidth = 20 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  let currentAngle = 0;

  const arcs = data.map((slice) => {
    const angle = (slice.value / total) * 360;
    const startAngle = currentAngle;
    // Clamp to avoid full circle issues
    const endAngle = currentAngle + Math.min(angle, 359.99);
    currentAngle += angle;
    return { ...slice, startAngle, endAngle };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {arcs.map((arc, i) => (
          <Path
            key={i}
            d={describeArc(cx, cy, r, arc.startAngle, arc.endAngle)}
            stroke={arc.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </Svg>
      <View style={styles.legend}>
        {data.map((slice, i) => (
          <View key={i} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>{slice.label}</Text>
            <Text style={styles.legendValue}>{formatIDR(slice.value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  legend: { marginTop: 12, width: '100%' },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendLabel: { flex: 1, color: Colors.text, fontSize: 13 },
  legendValue: { color: Colors.textMuted, fontSize: 12 },
});
