import { test, expect, afterEach, describe } from 'bun:test';
import React from 'react';
import matchers from '@testing-library/jest-dom/matchers';
import { fireEvent, render, screen, cleanup, within } from '@testing-library/react';
import TokenList from '@/components/bank/components/tokenList';
import { CombinedBalanceInfo } from '@/pages/bank';

const mockBalances: CombinedBalanceInfo[] = [
  {
    denom: 'utoken1',
    amount: '1000',
    metadata: {
      display: 'Token 1',
      symbol: 'TK1',
      denom_units: [
        { denom: 'utoken1', exponent: 0, aliases: ['utoken1'] },
        { denom: 'token1', exponent: 6, aliases: ['token1'] },
      ],
    },
    description: 'My First Token',
    base: 'token1',
    name: 'Token 1',
    uri: 'https://token1.com',
    uri_hash: 'hash1',
  },
  {
    denom: 'utoken2',
    amount: '2000',
    metadata: {
      display: 'Token 2',
      symbol: 'TK2',
      denom_units: [
        { denom: 'utoken2', exponent: 0, aliases: ['utoken2'] },
        { denom: 'token2', exponent: 6, aliases: ['token2'] },
      ],
    },
    description: 'My Second Token',
    base: 'token2',
    name: 'Token 2',
    uri: 'https://token2.com',
    uri_hash: 'hash2',
  },
];

expect.extend(matchers);

describe('TokenList', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders correctly', () => {
    render(<TokenList balances={mockBalances} isLoading={false} />);
    expect(screen.getByText('Your assets')).toBeInTheDocument();
  });

  test('displays loading skeleton when isLoading is true', () => {
    render(<TokenList balances={undefined} isLoading={true} />);
    expect(screen.getByLabelText('skeleton-loader')).toBeInTheDocument();
  });

  test('displays empty state when there are no balances', () => {
    render(<TokenList balances={[]} isLoading={false} />);
    expect(screen.getByText('No assets found')).toBeInTheDocument();
  });

  test('filters balances based on search term', () => {
    render(<TokenList balances={mockBalances} isLoading={false} />);
    const searchInput = screen.getByPlaceholderText('Search for a token...');
    fireEvent.change(searchInput, { target: { value: 'token1' } });

    expect(screen.getByText('Token 1', { selector: 'p.font-semibold' })).toBeInTheDocument();
    expect(screen.queryByText('Token 2', { selector: 'p.font-semibold' })).not.toBeInTheDocument();
  });

  test('opens modal with correct denomination information', () => {
    render(<TokenList balances={mockBalances} isLoading={false} />);
    const balanceRow = screen.getByText('Token 1', { selector: 'p.font-semibold' });
    fireEvent.click(balanceRow);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText('My first token')).toBeInTheDocument();
  });

  test('displays correct balance for each token', () => {
    render(<TokenList balances={mockBalances} isLoading={false} />);
    expect(screen.getByText('0.001 TK1')).toBeInTheDocument();
    expect(screen.getByText('0.002 TK2')).toBeInTheDocument();
  });

  test('displays correct base denomination for each token', () => {
    render(<TokenList balances={mockBalances} isLoading={false} />);
    expect(screen.getByText('utoken1')).toBeInTheDocument();
    expect(screen.getByText('utoken2')).toBeInTheDocument();
  });
});
