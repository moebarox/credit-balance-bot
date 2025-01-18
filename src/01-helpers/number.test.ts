import './number';

describe('number helpers', () => {
  describe('toCurrency', () => {
    it('should format number to Indonesian Rupiah currency', () => {
      expect(globalThis.NumberHelper.toCurrency(1000)).toBe('Rp 1.000');
      expect(globalThis.NumberHelper.toCurrency(1000000)).toBe('Rp 1.000.000');
      expect(globalThis.NumberHelper.toCurrency(1500000)).toBe('Rp 1.500.000');
    });

    it('should handle zero', () => {
      expect(globalThis.NumberHelper.toCurrency(0)).toBe('Rp 0');
    });

    it('should handle negative numbers', () => {
      expect(globalThis.NumberHelper.toCurrency(-1000)).toBe('-Rp 1.000');
      expect(globalThis.NumberHelper.toCurrency(-1000000)).toBe(
        '-Rp 1.000.000'
      );
    });

    it('should handle decimal numbers by rounding them', () => {
      expect(globalThis.NumberHelper.toCurrency(1000.5)).toBe('Rp 1.001');
      expect(globalThis.NumberHelper.toCurrency(1000.4)).toBe('Rp 1.000');
    });
  });
});
