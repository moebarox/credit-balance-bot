describe('date helpers', () => {
  describe('toMonthYear', () => {
    it('should format date to Indonesian month and year', () => {
      const date = new Date('2024-03-15');
      expect(globalThis.DateHelper.toMonthYear(date)).toBe('Maret 2024');
    });

    it('should accept string date input', () => {
      expect(globalThis.DateHelper.toMonthYear('2023-12-25')).toBe(
        'Desember 2023'
      );
    });
  });

  describe('isLeapYear', () => {
    it('should return true for leap years', () => {
      expect(globalThis.DateHelper.isLeapYear(new Date('2024-01-01'))).toBe(
        true
      );
      expect(globalThis.DateHelper.isLeapYear(new Date('2020-01-01'))).toBe(
        true
      );
    });

    it('should return false for non-leap years', () => {
      expect(globalThis.DateHelper.isLeapYear(new Date('2023-01-01'))).toBe(
        false
      );
      expect(globalThis.DateHelper.isLeapYear(new Date('2022-01-01'))).toBe(
        false
      );
    });

    it('should accept string date input', () => {
      expect(globalThis.DateHelper.isLeapYear('2024-01-01')).toBe(true);
      expect(globalThis.DateHelper.isLeapYear('2023-01-01')).toBe(false);
    });
  });
});
