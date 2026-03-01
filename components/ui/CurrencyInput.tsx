import React, { useEffect, useRef, useMemo } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../constants/theme';
import { ColorScheme } from '../../constants/colors';

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ label, value, onChange, placeholder }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [text, setText] = React.useState(value > 0 ? value.toString() : '');
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setText(value > 0 ? value.toString() : '');
    }
  }, [value]);

  const handleChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setText(cleaned);
    onChange(parseInt(cleaned, 10) || 0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Text style={styles.prefix}>Rp</Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChange}
          onFocus={() => { isFocused.current = true; }}
          onBlur={() => { isFocused.current = false; }}
          keyboardType="numeric"
          placeholder={placeholder || '0'}
          placeholderTextColor={colors.textMuted}
        />
      </View>
    </View>
  );
};

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: { marginBottom: 12 },
    label: { color: colors.textMuted, fontSize: 13, marginBottom: 4 },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border },
    prefix: { color: colors.accent, fontWeight: '600', marginRight: 4 },
    input: { flex: 1, color: colors.text, fontSize: 16, padding: 10 },
  });
