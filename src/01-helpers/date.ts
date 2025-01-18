namespace DateHelper {
  export function toMonthYear(date: Date | string): string {
    return new Date(date).toLocaleString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
  }

  export function isLeapYear(date: Date | string): boolean {
    return new Date(date).getFullYear() % 4 === 0;
  }
}

(globalThis as any).DateHelper = DateHelper;
