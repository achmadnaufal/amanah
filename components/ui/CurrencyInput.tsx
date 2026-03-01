import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ label, value, onChange, placeholder }) => {
  const [text, setText] = React.useState(value > 0 ? value.toString() : '');

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
          keyboardType="numeric"
          placeholder={placeholder || '0'}
          placeholderTextColor={Colors.textMuted}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { color: Colors.textMuted, fontSize: 13, marginBottom: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceAlt, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border },
  prefix: { color: Colors.accent, fontWeight: '600', marginRight: 4 },
  input: { flex: 1, color: Colors.text, fontSize: 16, padding: 10 },
});
