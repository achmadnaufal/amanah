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
