/** Convert a scale string like "1/2" or a number to a decimal */
export function toDecimal(scale: string | number): number {
  if (typeof scale === 'number') return scale;
  const parts = scale.split('/');
  if (parts.length === 2) {
    return parseFloat(parts[0]) / parseFloat(parts[1]);
  }
  return parseFloat(scale);
}

/** Format a decimal number into a readable fraction/mixed-number string */
export function formatQuantity(value: number): string {
  if (value === 0) return '0';

  const whole = Math.floor(value);
  const decimal = value - whole;

  const fractions: [number, string][] = [
    [1 / 8, '⅛'],
    [1 / 4, '¼'],
    [1 / 3, '⅓'],
    [3 / 8, '⅜'],
    [1 / 2, '½'],
    [5 / 8, '⅝'],
    [2 / 3, '⅔'],
    [3 / 4, '¾'],
    [7 / 8, '⅞'],
  ];

  // Find closest fraction within tolerance
  let bestMatch = '';
  let bestDiff = 0.04;
  for (const [frac, symbol] of fractions) {
    const diff = Math.abs(decimal - frac);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestMatch = symbol;
    }
  }

  if (decimal < 0.04) {
    return whole > 0 ? whole.toString() : '0';
  }

  if (bestMatch) {
    return whole > 0 ? `${whole} ${bestMatch}` : bestMatch;
  }

  // Fallback: round to 2 decimal places
  return parseFloat(value.toFixed(2)).toString();
}

/** Scale a quantity by a given factor (string fraction or number) */
export function scaleQuantity(
  original: number | null,
  factor: string | number
): number | null {
  if (original === null) return null;
  return original * toDecimal(factor);
}
