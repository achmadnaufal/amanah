import { Tabs } from 'expo-router';
import { Colors } from '../constants/colors';
import { Text } from 'react-native';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="(tabs)/index"
        options={{
          title: 'Dashboard',
          headerTitle: '🌙 Amanah',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="(tabs)/transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📒</Text>,
        }}
      />
      <Tabs.Screen
        name="(tabs)/zakat"
        options={{
          title: 'Zakat',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🌙</Text>,
        }}
      />
      <Tabs.Screen
        name="(tabs)/portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="(tabs)/planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎯</Text>,
        }}
      />
    </Tabs>
  );
}
