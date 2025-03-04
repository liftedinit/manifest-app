import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, jest, mock, test } from 'bun:test';
import React from 'react';

import { TokenList } from '@/components/bank/components/tokenList';
import { renderWithChainProvider } from '@/tests/render';
import { unsafeConvertTokenBase } from '@/utils';
import { CombinedBalanceInfo } from '@/utils/types';

// Mock next/router
mock.module('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

const mockBalances: CombinedBalanceInfo[] = [
  {
    display: 'utoken1',
    amount: '1000',
    base: unsafeConvertTokenBase('token1'),
    metadata: {
      name: 'Token 1',
      uri: 'https://token1.com',
      uri_hash: 'hash1',
      description: 'My First Token',
      base: 'token1',
      display: 'Token 1',
      symbol: 'TK1',
      denom_units: [
        { denom: 'utoken1', exponent: 0, aliases: ['utoken1'] },
        { denom: 'token1', exponent: 6, aliases: ['token1'] },
      ],
    },
  },
  {
    display: 'utoken2',
    amount: '2000',
    base: unsafeConvertTokenBase('token2'),
    metadata: {
      name: 'Token 2',
      uri: 'https://token2.com',
      uri_hash: 'hash2',
      description: 'My Second Token',
      base: 'token2',
      display: 'Token 2',
      symbol: 'TK2',
      denom_units: [
        { denom: 'utoken2', exponent: 0, aliases: ['utoken2'] },
        { denom: 'token2', exponent: 6, aliases: ['token2'] },
      ],
    },
  },
];

describe('TokenList', () => {
  afterEach(() => {
    cleanup();
    mock.restore();
  });

  test('renders correctly', () => {
    renderWithChainProvider(
      <TokenList
        balances={mockBalances}
        isLoading={false}
        refetchBalances={jest.fn()}
        refetchHistory={jest.fn()}
        address={''}
        pageSize={1}
      />
    );
    const token1Row = screen.getByLabelText('utoken1');
    expect(token1Row).toBeInTheDocument();

    const ticker = within(token1Row).getAllByText('TOKEN 1');
    expect(ticker).toHaveLength(2);

    const balance = within(token1Row).getByText('0.001');
    expect(balance).toBeInTheDocument();
  });

  test('displays loading skeleton when isLoading is true', () => {
    renderWithChainProvider(
      <TokenList
        balances={undefined}
        isLoading={true}
        refetchBalances={jest.fn()}
        refetchHistory={jest.fn()}
        address={''}
        pageSize={1}
      />
    );
    expect(screen.getByLabelText('skeleton-loader')).toBeInTheDocument();
  });

  test('displays empty state when there are no balances', () => {
    renderWithChainProvider(
      <TokenList
        balances={[]}
        isLoading={false}
        refetchBalances={jest.fn()}
        refetchHistory={jest.fn()}
        address={''}
        pageSize={1}
      />
    );
    expect(screen.getByText('No tokens found!')).toBeInTheDocument();
  });

  test('filters balances based on search term', () => {
    renderWithChainProvider(
      <TokenList
        balances={mockBalances}
        isLoading={false}
        refetchBalances={jest.fn()}
        refetchHistory={jest.fn()}
        address={''}
        pageSize={1}
        searchTerm={'Token 1'}
      />
    );
    const token1Row = screen.getByLabelText('utoken1');
    const token2Row = screen.queryByLabelText('utoken2');
    expect(token1Row).toBeInTheDocument();
    expect(token2Row).not.toBeInTheDocument();
  });

  test('opens modal with correct denomination information', async () => {
    renderWithChainProvider(
      <TokenList
        balances={mockBalances}
        isLoading={false}
        refetchBalances={jest.fn()}
        refetchHistory={jest.fn()}
        address={''}
        pageSize={1}
      />
    );
    const token1Container = screen.getByLabelText('utoken1');
    const button = within(token1Container).getByLabelText('info-utoken1');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Ticker')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  test('displays correct balance for each token', () => {
    renderWithChainProvider(
      <TokenList
        balances={mockBalances}
        isLoading={false}
        refetchBalances={jest.fn()}
        refetchHistory={jest.fn()}
        address={''}
        pageSize={2}
      />
    );
    expect(screen.getByText('0.001')).toBeInTheDocument();
    expect(screen.getByText('0.002')).toBeInTheDocument();
  });
});
