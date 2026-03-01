import { calculateFinancialFreedom } from '../utils/planner';

describe('Financial Freedom Calculator', () => {
  it('should return goal reached when currentNetWorth >= targetAmount', () => {
    const result = calculateFinancialFreedom(5_000_000_000, 3_600_000_000, 5_000_000, 0.07);
    expect(result.progressPercent).toBe(100);
    expect(result.yearsToGoal).toBe(0);
    expect(result.monthsToGoal).toBe(0);
  });

  it('should calculate years and months to goal', () => {
    const result = calculateFinancialFreedom(0, 100_000_000, 5_000_000, 0.07);
    expect(result.yearsToGoal).toBeGreaterThan(0);
    expect(result.monthsToGoal).toBeGreaterThanOrEqual(0);
    expect(result.monthsToGoal).toBeLessThan(12);
  });

  it('should calculate progress percentage correctly', () => {
    const result = calculateFinancialFreedom(900_000_000, 3_600_000_000, 5_000_000, 0.07);
    expect(result.progressPercent).toBe(25);
  });

  it('should cap progress at 100%', () => {
    const result = calculateFinancialFreedom(5_000_000_000, 3_600_000_000, 5_000_000, 0.07);
    expect(result.progressPercent).toBe(100);
  });

  it('should handle zero monthly savings', () => {
    const result = calculateFinancialFreedom(1_000_000, 3_600_000_000, 0, 0.07);
    // With just returns and no savings, should still eventually reach goal (in many years)
    expect(result.yearsToGoal).toBeGreaterThan(0);
  });

  it('should handle zero return rate', () => {
    const result = calculateFinancialFreedom(0, 60_000_000, 5_000_000, 0);
    // 60M / 5M = 12 months = 1 year
    expect(result.yearsToGoal).toBe(1);
    expect(result.monthsToGoal).toBe(0);
  });

  it('should calculate projected year correctly', () => {
    const result = calculateFinancialFreedom(0, 60_000_000, 5_000_000, 0);
    const currentYear = new Date().getFullYear();
    expect(result.projectedYear).toBe(currentYear + 1);
  });

  it('should handle starting from zero', () => {
    const result = calculateFinancialFreedom(0, 3_600_000_000, 5_000_000, 0.07);
    expect(result.progressPercent).toBe(0);
    expect(result.yearsToGoal).toBeGreaterThan(0);
  });
});
