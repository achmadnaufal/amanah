import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../constants/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ onPress, title, variant = 'primary', style, disabled }) => {
  const { colors } = useTheme();
  const isSecondary = variant === 'secondary';
  const bgColor = variant === 'primary' ? colors.primaryLight : variant === 'danger' ? colors.error : colors.surfaceAlt;
  const textColor = isSecondary ? colors.text : '#FFFFFF';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, { backgroundColor: bgColor, opacity: disabled ? 0.5 : 1 }, style]}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { borderRadius: 8, padding: 12, alignItems: 'center' },
  text: { fontWeight: '600', fontSize: 15 },
});
