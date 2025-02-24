import { test, expect, afterEach, describe } from 'bun:test';
import { isMfxToken, MFX_TOKEN_BASE, unsafeConvertTokenBase } from '@/utils';

describe('isMfxToken', () => {
  test('works', () => {
    expect(isMfxToken(MFX_TOKEN_BASE)).toBe(true);
    expect(isMfxToken(unsafeConvertTokenBase('not-mfx'))).toBe(false);
  });
});
