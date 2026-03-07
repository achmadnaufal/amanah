# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [CURRENT] - 2026-03-07
### Added
- `calculateBusinessZakat()`: Zakat al-Tijarah calculation on inventory + receivables minus current liabilities
- `zakatSavingsPlan()`: monthly savings planner to spread annual Zakat obligation over remaining hawl months
- 9 new unit tests covering business Zakat edge cases and savings plan validation
- Edge case handling: negative amounts, invalid month ranges, liabilities exceeding assets
### Improved
- README updated with business Zakat and savings planner usage examples

## [CURRENT] - 2026-03-07
### Added
- Financial Freedom Planner: compound growth projection to independence target with halal return rates
- Halal Portfolio tracker: stocks, sukuk, REITs, gold — no riba instruments
- Zustand state management with AsyncStorage offline persistence
- Dark theme: #0D1117 bg · #1B5E20 green · #F9A825 gold
- Unit tests: zakat, hawl, planner, currency, insights utils

## [CURRENT] - 2026-03-07
### Added
- Zakat Calculator: nisab auto-calc (85g gold × current price), 2.5% zakat on net assets
- Transactions ledger with categories (income/expense)
- Dashboard with net worth overview and monthly summary
