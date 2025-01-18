namespace NumberHelper {
  export function toCurrency(number: number): string {
    return number
      .toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      })
      .replace(/\s+/g, ' ');
  }
}

(globalThis as any).NumberHelper = NumberHelper;
