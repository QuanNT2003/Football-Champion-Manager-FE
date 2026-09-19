/**
 * Utility định dạng tiền tệ duy nhất cho toàn bộ game Football Champion
 * Quy tắc:
 * - Đơn vị tiền tệ chuẩn: € (Euro)
 * - Nếu dưới 1.000: hiển thị số nguyên (ví dụ: €250)
 * - Nếu dưới 1.000.000 (dưới 1M): hiển thị theo K (ví dụ: €65K, €200K, €350K)
 * - Nếu từ 1.000.000 trở lên (từ 1M): hiển thị theo M (ví dụ: €1.2M, €1.3M, €15M)
 * - Nếu từ 1.000.000.000 trở lên (từ 1B): hiển thị theo B (ví dụ: €1.5B)
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currencySymbol: string = '€'
): string {
  if (amount === null || amount === undefined) {
    return `${currencySymbol}0`;
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(num) || num === 0) {
    return `${currencySymbol}0`;
  }

  const isNegative = num < 0;
  const abs = Math.abs(num);
  const prefix = isNegative ? `-${currencySymbol}` : currencySymbol;

  // Dưới 1.000
  if (abs < 1000) {
    return `${prefix}${Math.round(abs).toLocaleString('vi-VN')}`;
  }

  // Dưới 1.000.000 (Dưới 1M) -> render dạng 200k, 300k, 65k
  if (abs < 1_000_000) {
    const valK = abs / 1000;
    const formattedK = valK % 1 === 0 ? valK.toString() : valK.toFixed(1).replace(/\.0$/, '');
    return `${prefix}${formattedK}K`;
  }

  // Dưới 1.000.000.000 (Từ 1M đến dưới 1 tỷ) -> render dạng 1.2M, 1.3M...
  if (abs < 1_000_000_000) {
    const valM = abs / 1_000_000;
    const formattedM = (valM >= 10 ? valM.toFixed(1) : valM.toFixed(2)).replace(/\.?0+$/, '');
    return `${prefix}${formattedM}M`;
  }

  // Từ 1 tỷ trở lên
  const valB = abs / 1_000_000_000;
  const formattedB = valB.toFixed(2).replace(/\.?0+$/, '');
  return `${prefix}${formattedB}B`;
}

/**
 * Định dạng số nguyên có dấu phân cách hàng nghìn (ví dụ: 3,594)
 */
export function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '0';
  const n = typeof num === 'string' ? parseFloat(num) : Number(num);
  if (isNaN(n)) return '0';
  return n.toLocaleString('vi-VN');
}
