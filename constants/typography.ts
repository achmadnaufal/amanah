import { TextStyle } from 'react-native';

export const Typography: Record<string, TextStyle> = {
  h1: { fontSize: 28, fontWeight: '800' },
  h2: { fontSize: 22, fontWeight: '700' },
  h3: { fontSize: 18, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22 },
  bodySmall: { fontSize: 13 },
  caption: { fontSize: 12 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  amount: { fontSize: 16, fontWeight: '700' },
  amountLarge: { fontSize: 28, fontWeight: '800' },
} as const;
