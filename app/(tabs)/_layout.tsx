import { useState } from 'react';
import { Tabs, Redirect } from 'expo-router';
import { TouchableOpacity, Modal, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme, ThemeMode } from '../../constants/theme';

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'system', label: 'System', icon: '📱' },
  { mode: 'light', label: 'Light', icon: '☀️' },
  { mode: 'dark', label: 'Dark', icon: '🌙' },
];

export default function TabsLayout() {
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const hasCompletedSetup = useAppStore((s) => s.hasCompletedSetup);
  const { colors, mode, setMode } = useTheme();
  const [themeModal, setThemeModal] = useState(false);

  if (!hasOnboarded) {
    return <Redirect href={'/onboarding' as any} />;
  }

  if (!hasCompletedSetup) {
    return <Redirect href={'/setup' as any} />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            headerTitle: 'Amanah',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
            headerRight: () => (
              <TouchableOpacity onPress={() => setThemeModal(true)} style={{ marginRight: 16 }}>
                <Ionicons name="settings-outline" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Transactions',
            tabBarIcon: ({ color, size }) => <Ionicons name="receipt" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="zakat"
          options={{
            title: 'Zakat',
            tabBarIcon: ({ color, size }) => <Ionicons name="moon" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="portfolio"
          options={{
            title: 'Portfolio',
            tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="planner"
          options={{
            title: 'Planner',
            tabBarIcon: ({ color, size }) => <Ionicons name="trending-up" size={size} color={color} />,
          }}
        />
      </Tabs>

      {/* Theme Selection Modal */}
      <Modal visible={themeModal} transparent animationType="fade">
        <TouchableOpacity
          style={modalStyles.backdrop}
          activeOpacity={1}
          onPress={() => setThemeModal(false)}
        >
          <View style={[modalStyles.sheet, { backgroundColor: colors.surface }]}>
            <Text style={[modalStyles.title, { color: colors.text }]}>Appearance</Text>
            {THEME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.mode}
                style={[
                  modalStyles.option,
                  { borderColor: mode === opt.mode ? colors.accent : colors.border },
                ]}
                onPress={() => { setMode(opt.mode); setThemeModal(false); }}
              >
                <Text style={modalStyles.optionIcon}>{opt.icon}</Text>
                <Text style={[modalStyles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
                {mode === opt.mode && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  sheet: { borderRadius: 16, padding: 20, width: '100%', maxWidth: 320 },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  optionIcon: { fontSize: 18, marginRight: 12 },
  optionLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
});
