# Amanah — Islamic Personal Finance Tracker

[![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB?logo=react)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-SDK%2053-000020?logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Zustand](https://img.shields.io/badge/Zustand-state-orange)](https://zustand-demo.pmnd.rs)
[![AsyncStorage](https://img.shields.io/badge/AsyncStorage-offline--first-green)](https://react-native-async-storage.github.io/async-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A halal-first, privacy-first personal finance tracker built for Muslim professionals. Track income & expenses, calculate Zakat, manage a halal investment portfolio, and plan your path to financial freedom — all on-device, no cloud, no subscriptions.

---

## 📱 Screenshots

> _Coming soon — iOS Simulator screenshots will be added after App Store submission._

| Dashboard | Transactions | Zakat | Portfolio | Planner |
|-----------|-------------|-------|-----------|---------|
| _(soon)_ | _(soon)_ | _(soon)_ | _(soon)_ | _(soon)_ |

---

## ✨ Features

| Screen | Description |
|--------|-------------|
| **Dashboard** | Net worth overview, monthly income vs expense summary, quick-add transaction |
| **Transactions** | Full ledger with categories (income/expense), swipe-to-delete, history |
| **Zakat Calculator** | Auto-calculates nisab (85g gold × current price) and 2.5% zakat on net assets |
| **Halal Portfolio** | Track stocks, sukuk, REITs, and gold holdings — no riba instruments |
| **Financial Freedom Planner** | Compound growth projection to your independence target using halal return rates |

---

## 🛠 Tech Stack

- **Framework:** React Native 0.83 + Expo SDK (latest)
- **Navigation:** expo-router (file-based tabs)
- **State:** Zustand with AsyncStorage persistence
- **Language:** TypeScript (strict)
- **Theme:** Dark — `#0D1117` bg · `#1B5E20` green · `#F9A825` gold
- **Platform:** iOS (primary), Android & Web supported

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Xcode 16+ (for iOS simulator)
- Ruby 3.3 (for CocoaPods — see [docs/SETUP.md](docs/SETUP.md))

### Install

```bash
git clone https://github.com/achmadnaufal/amanah.git
cd amanah
npm install
```

### Run

```bash
# Start Expo dev server
npx expo start

# Run on iOS simulator (iPhone 17 Pro)
npx expo run:ios

# Run on Android
npx expo run:android
```

> ⚠️ If CocoaPods fails, see [docs/SETUP.md](docs/SETUP.md) for the Ruby 3.3 fix.

---

## 📁 Project Structure

```
amanah/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Dashboard
│   │   ├── transactions.tsx   # Transaction ledger
│   │   ├── zakat.tsx          # Zakat calculator
│   │   ├── portfolio.tsx      # Halal portfolio tracker
│   │   └── planner.tsx        # Financial freedom planner
│   └── _layout.tsx            # Root layout + tab navigator
├── store/
│   ├── useFinanceStore.ts     # Transactions + balances (Zustand)
│   ├── useZakatStore.ts       # Zakat inputs state
│   └── usePlannerStore.ts     # Financial freedom state
├── utils/
│   ├── zakat.ts               # Zakat calculation logic
│   ├── planner.ts             # Compound growth math
│   └── currency.ts            # IDR formatting helpers
├── constants/
│   ├── colors.ts              # Design tokens
│   └── categories.ts          # Transaction categories
├── docs/                      # Extended documentation
├── app.json                   # Expo config
└── package.json
```

---

## 🕌 Philosophy

**Halal-first** — Every feature is designed with Islamic finance principles. No interest-bearing instruments, no riba. Zakat is a first-class citizen, not an afterthought.

**Privacy-first** — All data stays on your device. No accounts, no cloud sync, no analytics. Your financial data is yours alone.

**One-time purchase** — No subscriptions. Pay once (IDR 49,000), own it forever. Premium features unlock PDF export, advanced charts, and widgets.

---

## 🗺 Roadmap

See [ROADMAP.md](ROADMAP.md) for the full development plan across 4 phases: Polish MVP → Core Features → App Store Launch → Growth.

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

---

## 📄 License

MIT © [Achmad Naufal](https://github.com/achmadnaufal)

---

## [v1.3.0] New Features (2026-03-05)

### Business Zakat Calculator (Zakat al-Tijarah)

Calculate Zakat on business inventory and trade receivables:

```typescript
import { calculateBusinessZakat } from './utils/zakat';

const result = calculateBusinessZakat(
  80_000_000,  // inventory (IDR)
  40_000_000,  // receivables (IDR)
  10_000_000,  // current liabilities (IDR)
);
// { zakatablyAssets: 110_000_000, isWajib: true, zakatAmount: 2_750_000 }
```

### Zakat Savings Planner

Plan monthly savings toward your annual Zakat obligation:

```typescript
import { zakatSavingsPlan } from './utils/zakat';

const plan = zakatSavingsPlan(12_000_000, 12); // IDR 12M zakat, 12 months
// { monthlySavings: 1_000_000, totalPlan: 12_000_000, isRealistic: true }
```

### Testing

New tests added for business Zakat and savings planner:

```bash
npx jest __tests__/zakat.test.ts
```
