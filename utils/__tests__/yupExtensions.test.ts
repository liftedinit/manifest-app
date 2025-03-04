import { afterEach, beforeEach, describe, expect, jest, mock, test } from 'bun:test';

import Yup from '@/utils/yupExtensions';

describe('yupExtensions', () => {
  describe('unique', () => {
    test('works for unique array', () => {
      const schema = Yup.array().unique();
      expect(schema.isValidSync([1, 2, 3])).toBe(true);
    });

    test('fails for non-unique array', () => {
      const schema = Yup.array().unique();
      expect(schema.isValidSync([1, 1, 3])).toBe(false);
    });

    test('still validates items', () => {
      const schema = Yup.array().of(Yup.string().max(6)).unique();
      expect(schema.isValidSync(['a', 'b', 'c'])).toBe(true);
      expect(schema.isValidSync(['a', 'b', 'c', 'defghij'])).toBe(false);
    });

    test('works for empty array', () => {
      const schema = Yup.array().unique();
      expect(schema.isValidSync([])).toBe(true);
    });

    test('works for undefined array', () => {
      const schema = Yup.array().unique();
      expect(schema.isValidSync(undefined)).toBe(true);
    });

    test('works for array with null values', () => {
      const schema = Yup.array().unique();
      expect(schema.isValidSync([null, 1, '2'])).toBe(true);
      expect(schema.isValidSync([null, null])).toBe(false);
    });

    test('works for array with undefined values', () => {
      const schema = Yup.array().unique();
      expect(schema.isValidSync([undefined, 1, '2'])).toBe(true);
      expect(schema.isValidSync([undefined, undefined])).toBe(true);
    });

    test('works for array with null and undefined values', () => {
      const schema = Yup.array().unique();
      expect(schema.isValidSync([null, undefined, 1, '2'])).toBe(true);
      expect(schema.isValidSync([null, undefined, null])).toBe(false);
    });

    test('works with mixed types', () => {
      const schema = Yup.array().unique();
      expect(schema.isValidSync([2, '2'])).toBe(true);
    });

    test('returns the path to the first duplicate', () => {
      const schema = Yup.array().unique();
      expect(() => schema.validateSync([null, undefined, 1, '2', 1, 3, 1])).toThrow(
        '[4] must be unique'
      );
    });

    test('returns the custom message', () => {
      const schema = Yup.array().unique('Custom message');
      expect(() => schema.validateSync([1, 1, 3])).toThrow('Custom message');
    });

    test('returns the custom message with the path', () => {
      const schema = Yup.array().unique('${path} Custom message');
      expect(() => schema.validateSync([1, 1, 3])).toThrow('[1] Custom message');
    });
  });
});
