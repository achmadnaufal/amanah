import { useFinanceStore } from '../store/useFinanceStore';
import { usePlannerStore } from '../store/usePlannerStore';

export function useNetWorth(): number {
  const cashFlow = useFinanceStore((s) => s.getTotalIncome() - s.getTotalExpense());
  const portfolioTotal = usePlannerStore((s) =>
    s.portfolioAssets.reduce((sum, a) => sum + a.valueIDR, 0)
  );
  return cashFlow + portfolioTotal;
}
