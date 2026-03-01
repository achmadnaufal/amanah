import { formatIDR, parseIDR } from '../utils/currency';

describe('Currency Utils', () => {
  describe('formatIDR', () => {
    it('should format positive amounts', () => {
      const result = formatIDR(1_000_000);
      expect(result).toContain('1.000.000');
    });

    it('should format zero', () => {
      const result = formatIDR(0);
      expect(result).toContain('0');
    });

    it('should format negative amounts', () => {
      const result = formatIDR(-500_000);
      expect(result).toContain('500.000');
    });
  });

  describe('parseIDR', () => {
    it('should parse formatted string to number', () => {
      expect(parseIDR('Rp 1.000.000')).toBe(1000000);
    });

    it('should return 0 for empty string', () => {
      expect(parseIDR('')).toBe(0);
    });

    it('should handle strings with no digits', () => {
      expect(parseIDR('abc')).toBe(0);
    });
  });
});
