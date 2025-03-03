import { parseNumberToBigInt } from '../maths';

describe('parseNumberToBigInt', () => {
  test('converts integer string to BigInt', () => {
    expect(parseNumberToBigInt('123')).toBe(123000000n);
  });

  test('converts decimal string to BigInt with default precision', () => {
    expect(parseNumberToBigInt('123.456')).toBe(123456000n);
  });

  test('handles negative numbers', () => {
    expect(parseNumberToBigInt('-123.456')).toBe(-123456000n);
  });

  test('respects custom maxDigits parameter', () => {
    expect(parseNumberToBigInt('123.456', 3)).toBe(123456n);
    expect(parseNumberToBigInt('123.456', 8)).toBe(12345600000n);
  });

  test('handles zero correctly', () => {
    expect(parseNumberToBigInt('0')).toBe(0n);
    expect(parseNumberToBigInt('0.0')).toBe(0n);
  });

  test('handles strings with trailing zeros', () => {
    expect(parseNumberToBigInt('123.450')).toBe(123450000n);
    expect(parseNumberToBigInt('123.450000')).toBe(123450000n);
  });

  test('handles invalid number format', () => {
    expect(parseNumberToBigInt('abc')).toBe(0n);
    expect(parseNumberToBigInt('123abc')).toBe(0n);
  });

  test('handles large integer numbers', () => {
    expect(parseNumberToBigInt('9007199254740991')).toBe(9007199254740991000000n);
    expect(parseNumberToBigInt('12345678901234567890')).toBe(12345678901234567890000000n);
  });

  test('handles large numbers with decimals', () => {
    expect(parseNumberToBigInt('9007199254740991.123456')).toBe(9007199254740991123456n);
    expect(parseNumberToBigInt('12345678901234567890.123456')).toBe(12345678901234567890123456n);
  });
});
