# Feature Documentation

Detailed description of each screen and its functionality in Amanah.

---

## 1. Dashboard (`app/(tabs)/index.tsx`)

The home screen provides a financial snapshot at a glance.

**What it shows:**
- **Net Worth** — total assets minus liabilities (large, prominent figure)
- **Monthly Summary** — income vs. expense for the current month
- **Recent Transactions** — last 5 transactions with category icon, amount, and date
- **Quick Add Button** — floating action button to log a new transaction

**Design intent:** The user opens the app and immediately knows where they stand financially. No scrolling required for the key number.

---

## 2. Transactions (`app/(tabs)/transactions.tsx`)

Full transaction ledger with add/delete capability.

**What it shows:**
- Chronological list of all transactions
- Each entry: category emoji, description, amount (green = income, red = expense), date

**Actions:**
- **Add transaction** — form with: amount, category, description, date, type (income/expense)
- **Swipe to delete** — removes transaction and recalculates balance _(Phase 1)_

**Categories** (defined in `constants/categories.ts`):
- Income: Salary, Investment Return, Gift, etc.
- Expense: Groceries, Rent, Transport, Health, Education, etc.

---

## 3. Zakat Calculator (`app/(tabs)/zakat.tsx`)

Helps users calculate their annual zakat obligation accurately.

**Inputs:**
- Total assets (cash, savings, gold, receivables)
- Total liabilities (debts due within the year)
- Gold price per gram (IDR, defaults to 1,200,000 — updatable)

**Outputs:**
- **Nisab threshold** — 85g × gold price per gram
- **Net assets** — assets minus liabilities
- **Zakat status** — wajib (obligatory) if net assets >= nisab
- **Zakat amount** — 2.5% of net assets (if wajib)

See [ZAKAT.md](ZAKAT.md) for the full calculation methodology.

---

## 4. Halal Portfolio (`app/(tabs)/portfolio.tsx`)

Track halal-screened investments in one place.

**Supported asset types:**
- Halal stocks (sharia-screened equities)
- REITs (real estate investment trusts)
- Sukuk (Islamic bonds — no riba)
- Gold (physical or paper)
- Cash & savings (halal bank accounts)

**What it shows:**
- List of holdings with: asset name, quantity, purchase price, current value
- Total portfolio value
- Asset allocation breakdown (pie chart planned in Phase 2)

**Manual entry:** Users enter prices manually. Phase 2 adds optional free API price updates.

**Islamic filter:** Excludes conventional bonds, dividend stocks from haram industries (alcohol, gambling, tobacco, conventional banking), and riba-based instruments.

---

## 5. Financial Freedom Planner (`app/(tabs)/planner.tsx`)

Calculates how long until the user reaches their financial independence target.

**Inputs:**
- Current net worth (IDR)
- Monthly savings contribution (IDR)
- Financial freedom target (IDR) — default: 3.6B
- Annual halal return rate (%) — default: 7%

**Outputs:**
- **Years and months to goal**
- **Progress bar** (% of target reached)
- **Projected year** of financial freedom

See [FINANCIAL_FREEDOM.md](FINANCIAL_FREEDOM.md) for the compound interest methodology.

---

## Planned Features

| Feature | Phase |
|---------|-------|
| Onboarding flow (3 screens) | 1 |
| Multi-currency (IDR/USD/MYR/SGD) | 1 |
| Monthly budget with overspend alert | 1 |
| Zakat annual reminder (Ramadan) | 2 |
| PDF/CSV export | 2 |
| Pie chart by category | 2 |
| Net worth history line chart | 2 |
| Hijri calendar view | 2 |
