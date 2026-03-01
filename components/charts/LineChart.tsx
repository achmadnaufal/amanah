import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Line, Text as SvgText } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { formatIDR } from '../../utils/currency';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, height = 160, color = Colors.accent }) => {
  if (data.length < 2) return null;

  const width = 320;
  const padding = { top: 16, right: 16, bottom: 28, left: 16 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - ((d.value - min) / range) * chartH;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {[0, 0.5, 1].map((frac, i) => {
          const y = padding.top + chartH * (1 - frac);
          return (
            <Line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y}
              stroke={Colors.border} strokeWidth={0.5} />
          );
        })}
        {/* Line */}
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* X-axis labels */}
        {data.map((d, i) => {
          if (data.length > 6 && i % 2 !== 0 && i !== data.length - 1) return null;
          const x = padding.left + (i / (data.length - 1)) * chartW;
          return (
            <SvgText key={i} x={x} y={height - 4} fontSize={9} fill={Colors.textMuted} textAnchor="middle">
              {d.label}
            </SvgText>
          );
        })}
      </Svg>
      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>{formatIDR(min)}</Text>
        <Text style={styles.rangeText}>{formatIDR(max)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 8, marginTop: 4 },
  rangeText: { color: Colors.textMuted, fontSize: 10 },
});
