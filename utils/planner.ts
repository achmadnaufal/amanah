export const calculateFinancialFreedom = (
  currentNetWorth: number,
  targetAmount: number,
  monthlySavings: number,
  annualReturnRate: number = 0.07
): { yearsToGoal: number; monthsToGoal: number; progressPercent: number; projectedYear: number } => {
  const monthlyRate = annualReturnRate / 12;
  let balance = currentNetWorth;
  let months = 0;

  if (balance >= targetAmount) {
    return { yearsToGoal: 0, monthsToGoal: 0, progressPercent: 100, projectedYear: new Date().getFullYear() };
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
