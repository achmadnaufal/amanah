import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ onPress, title, variant = 'primary', style, disabled }) => {
  const bgColor = variant === 'primary' ? Colors.primaryLight : variant === 'danger' ? Colors.error : Colors.surfaceAlt;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, { backgroundColor: bgColor, opacity: disabled ? 0.5 : 1 }, style]}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { borderRadius: 8, padding: 12, alignItems: 'center' },
  text: { color: Colors.text, fontWeight: '600', fontSize: 15 },
});
