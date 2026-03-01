import { TextStyle } from 'react-native';
import { Colors } from './colors';

export const Typography: Record<string, TextStyle> = {
  h1: { fontSize: 28, fontWeight: '800', color: Colors.text },
  h2: { fontSize: 22, fontWeight: '700', color: Colors.text },
  h3: { fontSize: 18, fontWeight: '700', color: Colors.text },
  body: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  bodySmall: { fontSize: 13, color: Colors.text },
  caption: { fontSize: 12, color: Colors.textMuted },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  amount: { fontSize: 16, fontWeight: '700' },
  amountLarge: { fontSize: 28, fontWeight: '800' },
} as const;
