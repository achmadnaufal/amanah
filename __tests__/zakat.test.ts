import { calculateZakat, getNisab, NISAB_GOLD_GRAMS, ZAKAT_RATE, GOLD_PRICE_PER_GRAM_IDR } from '../utils/zakat';

describe('Zakat Calculator', () => {
  describe('getNisab', () => {
    it('should calculate nisab as 85g × gold price', () => {
      expect(getNisab(1_000_000)).toBe(85_000_000);
    });

    it('should use default gold price when none provided', () => {
      expect(getNisab()).toBe(NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM_IDR);
    });
  });

  describe('calculateZakat', () => {
    const goldPrice = 1_200_000;
    const nisab = 85 * goldPrice; // 102,000,000

    it('should return isWajib=true when net assets >= nisab', () => {
      const result = calculateZakat(150_000_000, 0, goldPrice);
      expect(result.isWajib).toBe(true);
      expect(result.zakatAmount).toBe(150_000_000 * ZAKAT_RATE);
    });

    it('should return isWajib=false when net assets < nisab', () => {
      const result = calculateZakat(50_000_000, 0, goldPrice);
      expect(result.isWajib).toBe(false);
      expect(result.zakatAmount).toBe(0);
    });

    it('should subtract liabilities from assets', () => {
      // 120M assets - 30M liabilities = 90M net < 102M nisab
      const result = calculateZakat(120_000_000, 30_000_000, goldPrice);
      expect(result.netAssets).toBe(90_000_000);
      expect(result.isWajib).toBe(false);
    });

    it('should calculate exactly 2.5% zakat on net assets', () => {
      const result = calculateZakat(200_000_000, 0, goldPrice);
      expect(result.zakatAmount).toBe(200_000_000 * 0.025);
      expect(result.zakatAmount).toBe(5_000_000);
    });

    it('should handle zero assets', () => {
      const result = calculateZakat(0, 0, goldPrice);
      expect(result.isWajib).toBe(false);
      expect(result.zakatAmount).toBe(0);
      expect(result.netAssets).toBe(0);
    });

    it('should handle negative net assets (more liabilities than assets)', () => {
      const result = calculateZakat(10_000_000, 20_000_000, goldPrice);
      expect(result.isWajib).toBe(false);
      expect(result.zakatAmount).toBe(0);
      expect(result.netAssets).toBe(-10_000_000);
    });

    it('should return correct nisab in result', () => {
      const result = calculateZakat(200_000_000, 0, goldPrice);
      expect(result.nisab).toBe(nisab);
    });

    it('should handle edge case: net assets exactly at nisab', () => {
      const result = calculateZakat(nisab, 0, goldPrice);
      expect(result.isWajib).toBe(true);
      expect(result.zakatAmount).toBe(nisab * ZAKAT_RATE);
    });

    it('should work with different gold prices', () => {
      const highGold = 2_000_000;
      const highNisab = 85 * highGold; // 170,000,000
      const result = calculateZakat(150_000_000, 0, highGold);
      expect(result.nisab).toBe(highNisab);
      expect(result.isWajib).toBe(false); // 150M < 170M
    });
  });
});
