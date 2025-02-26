import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, jest, mock, test } from 'bun:test';
import React from 'react';

import { MaxButton } from '@/components';
import { mockBalances, mockMfxBalance } from '@/tests/mock';

describe('MaxButton', () => {
  afterEach(cleanup);

  test('works', () => {
    const token = mockBalances[0];

    let amount = 0;
    const wrapper = render(
      <MaxButton token={token} setTokenAmount={a => (amount = parseFloat(a))} />
    );

    expect(amount).toBe(0);
    expect(screen.getByText('MAX')).toBeInTheDocument();
    screen.getByText('MAX').click();
    expect(amount).toBe(0.001);
  });

  test('works for MFX', () => {
    const token = mockMfxBalance;

    let amount = 0;
    const wrapper = render(
      <MaxButton token={token} setTokenAmount={a => (amount = parseFloat(a))} />
    );

    expect(amount).toBe(0);
    expect(screen.getByText('MAX')).toBeInTheDocument();
    screen.getByText('MAX').click();
    expect(amount).toBe(1.9);
  });
});
