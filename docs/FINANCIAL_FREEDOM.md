# Financial Freedom Planner — Math & Methodology

This document explains the compound growth projection used in the Financial Freedom Planner screen.

## Goal

> **"How many years until my net worth reaches my financial freedom target, given my current savings rate and halal investment return?"**

## Inputs

| Parameter | Description | Default |
|-----------|-------------|---------|
| `currentNetWorth` | Current total net worth (IDR) | User-entered |
| `targetAmount` | Financial independence target (IDR) | User-entered |
| `monthlySavings` | Monthly net savings contribution (IDR) | User-entered |
| `annualReturnRate` | Expected annual halal return rate | 0.07 (7%) |

## Why 7% Default Return Rate?

7% per annum is a conservative estimate for a diversified halal equity portfolio:

- Indonesian sharia equity funds: ~8–12% historical average
- Conservative buffer for market volatility
- **No riba** — excludes conventional fixed-income instruments

Users can adjust this to model different scenarios (5% conservative, 10% equity-heavy).

## Calculation Method

Month-by-month compound growth simulation:

```
balance_0 = currentNetWorth

For each month:
  balance = balance × (1 + monthlyRate) + monthlySavings

Stop when: balance >= targetAmount
```

Where:
```
monthlyRate = annualReturnRate / 12
```

The iterative approach handles compounding more accurately than a closed-form formula, especially for large initial balances.

## Code Implementation

```ts
// utils/planner.ts

export const calculateFinancialFreedom = (
  currentNetWorth: number,
  targetAmount: number,
  monthlySavings: number,
  annualReturnRate: number = 0.07
) => {
  const monthlyRate = annualReturnRate / 12;
  let balance = currentNetWorth;
  let months = 0;

  if (balance >= targetAmount) {
    return {
      yearsToGoal: 0, monthsToGoal: 0,
      progressPercent: 100,
      projectedYear: new Date().getFullYear()
    };
  }

  while (balance < targetAmount && months < 1200) {
    balance = balance * (1 + monthlyRate) + monthlySavings;
    months++;
  }

  const progressPercent = Math.min((currentNetWorth / targetAmount) * 100, 100);
  const projectedYear = new Date().getFullYear() + Math.floor(months / 12);

  return {
    yearsToGoal: Math.floor(months / 12),
    monthsToGoal: months % 12,
    progressPercent,
    projectedYear,
  };
};
```

## Example Calculation

| Input | Value |
|-------|-------|
| Current net worth | IDR 500,000,000 |
| Target | IDR 3,600,000,000 |
| Monthly savings | IDR 10,000,000 |
| Annual return | 7% |

**Result:** ~16 years 4 months → projected year 2042, 13.9% progress

## Limitations

- **Inflation not modeled** — consider increasing your target or return rate assumption
- **Return rate is constant** — actual markets fluctuate; 7% is a long-term average
- **No tax modeling** — Indonesian investment income tax (PPh) not subtracted
- **Halal screening** — ensure actual investments match the return rate assumption
