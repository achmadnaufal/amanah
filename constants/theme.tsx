import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { DarkColors, LightColors, ColorScheme, ThemeMode } from './colors';
import { useAppStore } from '../store/useAppStore';

interface ThemeContextValue {
  readonly colors: ColorScheme;
  readonly isDark: boolean;
  readonly mode: ThemeMode;
  readonly toggle: () => void;
  readonly setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: DarkColors,
  isDark: true,
  mode: 'system',
  toggle: () => {},
  setMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);

  const value = useMemo<ThemeContextValue>(() => {
    const effectiveDark =
      themeMode === 'system'
        ? systemScheme !== 'light'
        : themeMode === 'dark';

    return {
      colors: effectiveDark ? DarkColors : LightColors,
      isDark: effectiveDark,
      mode: themeMode,
      toggle: () => setThemeMode(effectiveDark ? 'light' : 'dark'),
      setMode: setThemeMode,
    };
  }, [themeMode, systemScheme, setThemeMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

// Re-export for convenience
export type { ThemeMode };

// Export context for class components (e.g. ErrorBoundary)
export { ThemeContext };
