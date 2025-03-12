import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'bun:test';

import { TokenBalance } from '@/components';
import { formatComponent } from '@/tests';
import { mockDenomMeta1 } from '@/tests/data';
import { unsafeConvertTokenBase } from '@/utils';

describe('TokenBalance', () => {
  afterEach(cleanup);

  test('should render the token balance', () => {
    const mockup = render(
      <TokenBalance
        token={{
          amount: '1000000000000000000',
          metadata: mockDenomMeta1,
          display: mockDenomMeta1.display,
          base: unsafeConvertTokenBase(mockDenomMeta1.base),
        }}
      />
    );

    expect(screen.getByText('1T')).toBeInTheDocument();
    expect(screen.getByText('TOKEN1')).toBeInTheDocument();
    expect(document.querySelector('.tooltip')).toBeInTheDocument();
    expect(formatComponent(mockup.asFragment())).toMatchSnapshot();
  });

  test('should render the token balance for small amounts', () => {
    const mockup = render(
      <TokenBalance
        token={{
          amount: '1234567',
          metadata: mockDenomMeta1,
          display: mockDenomMeta1.display,
          base: unsafeConvertTokenBase(mockDenomMeta1.base),
        }}
      />
    );

    expect(screen.getByText('1.234567')).toBeInTheDocument();
    expect(screen.getByText('TOKEN1')).toBeInTheDocument();
  });

  test('should not render the tooltip if balance is the same as tooltip', () => {
    const mockup = render(
      <TokenBalance
        token={{
          amount: '1234567',
          metadata: mockDenomMeta1,
          display: mockDenomMeta1.display,
          base: unsafeConvertTokenBase(mockDenomMeta1.base),
        }}
      />
    );

    expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
  });
});
