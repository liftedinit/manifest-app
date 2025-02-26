import { afterEach, describe, expect, test } from 'bun:test';

import { MFX_TOKEN_BASE, isMfxToken, unsafeConvertTokenBase } from '@/utils';

describe('isMfxToken', () => {
  test('works', () => {
    expect(isMfxToken(MFX_TOKEN_BASE)).toBe(true);
    expect(isMfxToken(unsafeConvertTokenBase('not-mfx'))).toBe(false);
  });
});
