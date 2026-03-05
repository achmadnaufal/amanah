export const GOLD_PRICE_PER_GRAM_IDR = 1_200_000;
export const NISAB_GOLD_GRAMS = 85;
export const ZAKAT_RATE = 0.025;

export const getNisab = (goldPricePerGram: number = GOLD_PRICE_PER_GRAM_IDR): number => {
  return NISAB_GOLD_GRAMS * goldPricePerGram;
};

export const calculateZakat = (
  totalAssets: number,
  totalLiabilities: number,
  goldPricePerGram: number = GOLD_PRICE_PER_GRAM_IDR
): { zakatAmount: number; nisab: number; netAssets: number; isWajib: boolean } => {
  const nisab = getNisab(goldPricePerGram);
  const netAssets = totalAssets - totalLiabilities;
  const isWajib = netAssets >= nisab;
  const zakatAmount = isWajib ? netAssets * ZAKAT_RATE : 0;
  return { zakatAmount, nisab, netAssets, isWajib };
};

/**
 * Calculate Zakat al-Tijarah (trade/business zakat) on inventory and receivables.
 * Business zakat applies on current assets less current liabilities that have
 * been held for a full hawl (lunar year).
 *
 * @param inventory - Current market value of business inventory (IDR)
 * @param receivables - Trade receivables expected to be collected (IDR)
 * @param currentLiabilities - Short-term business liabilities (IDR)
 * @param goldPricePerGram - Current gold price per gram in IDR
 * @returns Business zakat breakdown
 */
export const calculateBusinessZakat = (
  inventory: number,
  receivables: number,
  currentLiabilities: number,
  goldPricePerGram: number = GOLD_PRICE_PER_GRAM_IDR
): {
  zakatablyAssets: number;
  nisab: number;
  isWajib: boolean;
  zakatAmount: number;
  effectiveRate: number;
} => {
  const nisab = getNisab(goldPricePerGram);
  const zakatablyAssets = Math.max(0, inventory + receivables - currentLiabilities);
  const isWajib = zakatablyAssets >= nisab;
  const zakatAmount = isWajib ? zakatablyAssets * ZAKAT_RATE : 0;
  const effectiveRate = zakatablyAssets > 0 ? zakatAmount / zakatablyAssets : 0;
  return { zakatablyAssets, nisab, isWajib, zakatAmount, effectiveRate };
};

/**
 * Calculate monthly Zakat savings plan.
 * Helps users set aside monthly savings toward their annual Zakat obligation.
 *
 * @param estimatedAnnualZakat - Expected annual Zakat amount (IDR)
 * @param monthsRemaining - Months until Zakat due date (1-12)
 * @returns Monthly savings amount and total plan
 */
export const zakatSavingsPlan = (
  estimatedAnnualZakat: number,
  monthsRemaining: number
): { monthlySavings: number; totalPlan: number; isRealistic: boolean } => {
  if (monthsRemaining <= 0 || monthsRemaining > 12) {
    throw new Error('monthsRemaining must be between 1 and 12');
  }
  if (estimatedAnnualZakat < 0) {
    throw new Error('estimatedAnnualZakat must be non-negative');
  }
  const monthlySavings = Math.ceil(estimatedAnnualZakat / monthsRemaining);
  return {
    monthlySavings,
    totalPlan: monthlySavings * monthsRemaining,
    isRealistic: monthlySavings <= estimatedAnnualZakat * 0.5, // sanity check
  };
};
