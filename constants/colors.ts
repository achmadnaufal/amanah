export const DarkColors = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#F9A825',
  background: '#0D1117',
  surface: '#161B22',
  surfaceAlt: '#21262D',
  text: '#E6EDF3',
  textMuted: '#8B949E',
  success: '#3FB950',
  warning: '#D29922',
  error: '#DA3633',              // Darkened — white text now 4.5:1
  border: '#30363D',
} as const;

export const LightColors = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',       // Darker green — white text 5.1:1
  accent: '#9A6700',             // Darker gold — 4.6:1 on white surface
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceAlt: '#DCDCDC',         // Darker — visible separation + border backup
  text: '#1A1A1A',
  textMuted: '#5A6370',          // 6.1:1 on white
  success: '#15803D',            // 5.0:1 on white
  warning: '#A16207',            // 4.9:1 on white
  error: '#B91C1C',              // 6.5:1 on white
  border: '#D1D5DB',
} as const;

export type ColorScheme = {
  readonly [K in keyof typeof DarkColors]: string;
};

export type ThemeMode = 'system' | 'light' | 'dark';

// Backwards compat — existing imports of `Colors` still work
export const Colors = DarkColors;
