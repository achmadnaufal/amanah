# Zakat Calculation Logic

This document explains how Amanah calculates Zakat al-Mal (wealth zakat).

## Islamic Basis

Zakat al-Mal is one of the Five Pillars of Islam. A Muslim whose net wealth exceeds the **nisab** threshold for one full lunar year (hawl) is obligated to pay 2.5% of that wealth in zakat.

## Nisab Threshold

The nisab is defined as the equivalent value of **85 grams of gold**:

```
nisab = 85g × current gold price per gram
```

**Default gold price:** IDR 1,200,000/gram (updatable by the user)

**Example:**
```
nisab = 85 × 1,200,000 = IDR 102,000,000
```

## Net Assets Calculation

```
net_assets = total_assets - total_liabilities
```

**Total assets** include: cash, savings, gold, business inventory, receivables, halal investments.

**Total liabilities** include only **short-term debts** (due within the year): installments, credit card balances, personal loans.

Long-term liabilities (e.g., mortgage principal beyond the current year) are **not** deducted per the majority scholarly opinion.

## Zakat Obligation Check

```
is_wajib = net_assets >= nisab
```

## Zakat Amount

```
zakat_amount = net_assets × 2.5%   (if wajib)
zakat_amount = 0                   (if not wajib)
```

## Code Implementation

```ts
// utils/zakat.ts

export const GOLD_PRICE_PER_GRAM_IDR = 1_200_000;
export const NISAB_GOLD_GRAMS = 85;
export const ZAKAT_RATE = 0.025;

export const calculateZakat = (
  totalAssets: number,
  totalLiabilities: number,
  goldPricePerGram: number = GOLD_PRICE_PER_GRAM_IDR
) => {
  const nisab = NISAB_GOLD_GRAMS * goldPricePerGram;
  const netAssets = totalAssets - totalLiabilities;
  const isWajib = netAssets >= nisab;
  const zakatAmount = isWajib ? netAssets * ZAKAT_RATE : 0;
  return { zakatAmount, nisab, netAssets, isWajib };
};
```

## Example Calculation

| Input | Value |
|-------|-------|
| Total assets | IDR 150,000,000 |
| Total liabilities | IDR 20,000,000 |
| Gold price/gram | IDR 1,200,000 |

| Derived | Value |
|---------|-------|
| Nisab | IDR 102,000,000 |
| Net assets | IDR 130,000,000 |
| Wajib? | Yes (130M >= 102M) |
| **Zakat due** | **IDR 3,250,000** |

## Important Notes

1. **Hawl (lunar year):** The app tracks calculation date but does not enforce the 1-year holding period automatically. Users should only count assets held for a full lunar year.

2. **Gold price accuracy:** Update to the current market rate before calculating.

3. **Scholarly variance:** Different scholarly opinions exist on zakatable assets. This implementation follows the widely accepted majority (jumhur) position.

4. **Unit tests:** Zakat logic in `utils/zakat.ts` is marked for unit testing — accuracy is critical for a religious obligation.

## References

- Quran 9:103, 2:43
- Fiqh al-Zakat — Yusuf al-Qaradawi
- AAOIFI Sharia Standards
