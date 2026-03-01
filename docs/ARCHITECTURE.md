# Architecture Overview

Amanah is a React Native + Expo application using a simple, offline-first architecture. All data is stored locally on-device.

## High-Level Structure

```
┌─────────────────────────────────────────────────┐
│                  expo-router                    │
│           (file-based tab navigation)           │
├──────────┬─────────────┬────────┬───────────────┤
│Dashboard │Transactions │ Zakat  │Portfolio│Planner│
├──────────┴─────────────┴────────┴───────────────┤
│                 Zustand Stores                  │
│  useFinanceStore │ useZakatStore │               │
│                  │ usePlannerStore              │
├─────────────────────────────────────────────────┤
│           AsyncStorage (persistence)            │
├─────────────────────────────────────────────────┤
│                Device Storage                   │
└─────────────────────────────────────────────────┘
```

## Navigation — expo-router

Navigation uses [expo-router](https://expo.github.io/router) with **file-based routing**. All screens live under `app/`:

```
app/
├── _layout.tsx          # Root layout — sets up tab navigator + theme
└── (tabs)/
    ├── index.tsx        # Tab: Dashboard (/)
    ├── transactions.tsx # Tab: Transactions (/transactions)
    ├── zakat.tsx        # Tab: Zakat (/zakat)
    ├── portfolio.tsx    # Tab: Portfolio (/portfolio)
    └── planner.tsx      # Tab: Planner (/planner)
```

The `(tabs)` group creates the bottom tab bar. `_layout.tsx` configures tab icons, colors, and the `Stack` wrapper.

## State Management — Zustand

State is managed with [Zustand](https://github.com/pmndrs/zustand). Each store handles one domain:

### `store/useFinanceStore.ts`
- `transactions[]` — list of income/expense transactions
- `balance` — current total balance
- Actions: `addTransaction`, `deleteTransaction`
- Persisted via `AsyncStorage`

### `store/useZakatStore.ts`
- `totalAssets`, `totalLiabilities`, `goldPricePerGram`
- Actions: `setAssets`, `setLiabilities`, `setGoldPrice`
- Persisted so users don't re-enter values

### `store/usePlannerStore.ts`
- `targetAmount`, `currentNetWorth`, `monthlySavings`, `annualReturnRate`
- Actions: `setTarget`, `setNetWorth`, `setSavings`, `setReturnRate`
- Persisted across sessions

## Persistence — AsyncStorage

Zustand stores use the `persist` middleware with `AsyncStorage` as the storage adapter:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

const useFinanceStore = create(
  persist(
    (set) => ({ ... }),
    {
      name: 'finance-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

All data is serialized as JSON and stored locally. No network requests, no backend.

## Utilities

| File | Purpose |
|------|---------|
| `utils/zakat.ts` | Nisab calculation, zakat amount, wajib check |
| `utils/planner.ts` | Compound interest projection to financial freedom target |
| `utils/currency.ts` | IDR number formatting helpers |

## Constants

| File | Purpose |
|------|---------|
| `constants/colors.ts` | Design tokens — all colors in one place |
| `constants/categories.ts` | Transaction categories with emoji icons |

## Design Tokens

```ts
// constants/colors.ts
export const Colors = {
  primary:    '#1B5E20',  // Islamic green
  accent:     '#F9A825',  // Gold
  background: '#0D1117',  // Dark bg
  surface:    '#161B22',  // Card bg
  surfaceAlt: '#21262D',  // Input bg
  text:       '#E6EDF3',  // Primary text
  textMuted:  '#8B949E',  // Secondary text
};
```

## Platform

- **iOS:** Primary target. Native modules via CocoaPods + Xcode.
- **Android:** Supported via the same codebase (Expo handles bridging).
- **Web:** Metro bundler for web preview (`dist/`).

## Bundle ID

Current: `com.anonymous.amanah`
**Must be changed** before App Store submission (e.g., `com.achmadnaufal.amanah`).
