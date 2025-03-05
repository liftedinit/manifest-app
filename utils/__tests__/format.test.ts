import { describe, expect, test } from 'bun:test';

import { formatLargeNumber } from '@/utils';

describe('formatLargeNumber', () => {
  test('should work', () => {
    expect(formatLargeNumber(1234)).toBe('1,234');
    expect(formatLargeNumber(12345678)).toBe('12.35M');

    // Small
    expect(formatLargeNumber(0.001)).toBe('0.001');
    expect(formatLargeNumber(0.00001)).toBe('0.00001');
    expect(formatLargeNumber(0.0000123456789)).toBe('0.000012');
    expect(formatLargeNumber(0.000000123456789)).toBe('0');

    // And large
    expect(formatLargeNumber(1e15)).toBe('1Q');
    expect(formatLargeNumber(1e18)).toBe('1QT');
    expect(formatLargeNumber(1e19)).toBe('10QT');
    expect(formatLargeNumber(1e20)).toBe('100QT');
    expect(formatLargeNumber(1.2345678e20)).toBe('123.46QT');
    expect(formatLargeNumber(1e24)).toBe('1e24');
    expect(formatLargeNumber(1e60)).toBe('1e60');
    expect(formatLargeNumber(1.23456789e24)).toBe('1.234568e24');
  });
});
