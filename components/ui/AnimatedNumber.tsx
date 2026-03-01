import React, { useEffect, useRef } from 'react';
import { Animated, TextStyle } from 'react-native';
import { formatIDR } from '../../utils/currency';

interface AnimatedNumberProps {
  value: number;
  style?: TextStyle;
  duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, style, duration = 800 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(0);
  const textRef = useRef<any>(null);

  useEffect(() => {
    animatedValue.setValue(displayValue.current);
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value: v }) => {
      displayValue.current = v;
      if (textRef.current) {
        textRef.current.setNativeProps({ text: formatIDR(Math.round(v)) });
      }
    });

    return () => animatedValue.removeListener(listener);
  }, [value]);

  return (
    <Animated.Text ref={textRef} style={style}>
      {formatIDR(value)}
    </Animated.Text>
  );
};
