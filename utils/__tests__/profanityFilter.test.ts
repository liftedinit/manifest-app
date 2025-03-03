import { describe, expect, test } from 'bun:test';

import { containsProfanity } from '@/utils/profanityFilter';

describe('containsProfanity', () => {
  test('should return true if the string contains profanity', () => {
    expect(containsProfanity('hello asshole')).toBe(true);
    expect(containsProfanity('fück the world')).toBe(true);
  });

  test('should return false if the string does not contain profanity', () => {
    expect(containsProfanity('hello world')).toBe(false);
    expect(containsProfanity('banal')).toBe(false);
    expect(containsProfanity('fork')).toBe(false);
    expect(containsProfanity('brass')).toBe(false);
  });
});
