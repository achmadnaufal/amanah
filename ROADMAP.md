# Amanah — Development Roadmap

## Phase 1 — Polish MVP (Week 1-2)
_Goal: Make it look and feel like a real app_

- [ ] Fix iOS Simulator testing (Xcode install in progress)
- [ ] Add proper app icon (crescent moon + gold design)
- [ ] Add splash screen
- [ ] Onboarding flow (3 screens: welcome, set target, currency preference)
- [ ] Multi-currency support (IDR default, USD/MYR/SGD toggle)
- [ ] Transaction categories with emoji icons
- [ ] Swipe-to-delete on transactions
- [ ] Monthly budget setting with overspend alert
- [ ] Empty state illustrations (no transactions yet, etc.)
- [ ] Haptic feedback on actions

## Phase 2 — Core Features (Week 3-4)
_Goal: Make it genuinely useful_

- [ ] Recurring transactions (salary auto-log monthly)
- [ ] Zakat reminder (Ramadan alert, annual reminder)
- [ ] Portfolio price update (manual or via free API)
- [ ] PDF/CSV export (one-time purchase unlock)
- [ ] Search & filter transactions
- [ ] Monthly spending breakdown chart (pie chart by category)
- [ ] Net worth history chart (line chart over months)
- [ ] Budget vs actual comparison
- [ ] Dark/light theme toggle
- [ ] Hijri calendar view

## Phase 3 — Monetization (Week 5-6)
_Goal: Ship to App Store and earn_

- [ ] In-app purchase (RevenueCat) — one-time IDR 49,000
  - Unlocks: PDF export, advanced charts, widgets
- [ ] Apple App Store submission
  - App icon, screenshots (6.7", 6.1", iPad)
  - App Store description (EN + ID)
  - Keywords: halal finance, zakat calculator, Islamic finance
  - Privacy policy page (no data collected)
- [ ] Google Play submission (same codebase via Expo)
- [ ] App Store pricing: IDR 49,000 (~$3) one-time
- [ ] Promo: free during Ramadan, paid after Eid

## Phase 4 — Growth (Month 2+)
_Goal: Build audience and improve_

- [ ] iOS widget (net worth + daily expense)
- [ ] Apple Watch companion (quick add transaction)
- [ ] iCloud sync (optional, privacy-preserving)
- [ ] Localisation: Bahasa Indonesia, Arabic, Malay
- [ ] Push notifications (zakat reminder, budget alerts, monthly summary)
- [ ] Community feedback via GitHub Issues
- [ ] Landing page at amanah.app (or use achmadnaufal.github.io/amanah)

## GitHub Repo Plan

### Immediate
- [x] Write proper README.md with screenshots, features, install guide
- [ ] Add LICENSE (MIT)
- [x] Add CONTRIBUTING.md
- [ ] Add GitHub Actions CI (lint + type check on PR)
- [ ] Create issues for each Phase 1 task
- [ ] Add app screenshots to README once iOS Simulator works

### Labels
- `enhancement` — new features
- `bug` — broken things
- `phase-1` / `phase-2` / `phase-3`
- `good first issue` — for open source contributors

## Revenue Projection (conservative)
Assuming App Store launch post-Eid (April 2026):

| Month | Downloads | Conversion (5%) | Revenue |
|-------|-----------|-----------------|---------|
| Apr   | 500       | 25              | IDR 1.2M |
| May   | 800       | 40              | IDR 2M |
| Jun   | 1,200     | 60              | IDR 2.9M |
| Q3    | 5,000     | 250             | IDR 12.2M |

Halal passive income that grows with ratings and reviews.

## Tech Debt to Address

- [ ] Proper error boundaries
- [ ] Offline-first data sync architecture
- [ ] Performance: memoize expensive calculations
- [ ] Accessibility: VoiceOver support
- [ ] Unit tests for zakat calculation logic (critical — must be accurate)
- [ ] Change bundle ID from `com.anonymous.amanah` before App Store submission
