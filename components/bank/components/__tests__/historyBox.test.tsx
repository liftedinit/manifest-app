import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { clearAllMocks, formatComponent, mockModule, mockRouter } from '@/tests';
import { mockMultiDenomTransactions, mockTransactions } from '@/tests/data';
import { renderWithChainProvider } from '@/tests/render';

import { HistoryBox } from '../historyBox';

describe('HistoryBox', () => {
  beforeEach(() => {
    mockRouter();

    mockModule('@/hooks', () => ({
      useTokenFactoryDenomsMetadata: () => ({
        metadatas: {
          metadatas: [
            {
              base: 'utoken',
              display: 'TOKEN',
              denom_units: [
                { denom: 'utoken', exponent: 0 },
                { denom: 'token', exponent: 6 },
              ],
            },
            {
              base: 'ufoobar',
              display: 'FOOBAR',
              denom_units: [
                { denom: 'ufoobar', exponent: 0 },
                { denom: 'foobar', exponent: 6 },
              ],
            },
            {
              base: 'umore',
              display: 'MORE',
              denom_units: [
                { denom: 'umore', exponent: 0 },
                { denom: 'more', exponent: 6 },
              ],
            },
          ],
        },
      }),
    }));
  });
  afterEach(() => {
    cleanup();
    clearAllMocks();
  });

  test('renders correctly', () => {
    renderWithChainProvider(
      <HistoryBox
        isLoading={false}
        address="address1"
        currentPage={1}
        sendTxs={mockTransactions}
        totalPages={2}
      />
    );
  });

  test('displays transactions as `address1`', () => {
    renderWithChainProvider(
      <HistoryBox
        isLoading={false}
        address="address1"
        currentPage={1}
        sendTxs={mockTransactions}
        totalPages={2}
      />
    );
    expect(screen.getByText(/You sent/i)).toBeInTheDocument();
    expect(screen.getByText(/You received/i)).toBeInTheDocument();
    expect(screen.getAllByText(/You were burned/i)).toHaveLength(2);
    expect(screen.getAllByText(/You minted/i)).toHaveLength(2);
    expect(screen.getAllByText(/You were minted/i)).toHaveLength(4);
  });

  test('displays transactions as `address2`', () => {
    renderWithChainProvider(
      <HistoryBox
        isLoading={false}
        address="address2"
        currentPage={1}
        sendTxs={mockTransactions}
        totalPages={2}
      />
    );
    expect(screen.getByText(/You sent/i)).toBeInTheDocument();
    expect(screen.getByText(/You received/i)).toBeInTheDocument();
    expect(screen.getAllByText(/You burned/i)).toHaveLength(2);
    expect(screen.getAllByText(/You were minted/i)).toHaveLength(2);
    expect(screen.getAllByText(/You minted/i)).toHaveLength(4);
  });

  test('opens modal when clicking on a transaction', () => {
    renderWithChainProvider(
      <HistoryBox
        isLoading={false}
        address="address1"
        currentPage={1}
        sendTxs={mockTransactions}
        totalPages={2}
      />
    );

    const transactionElement = screen.getByText(/You sent/i).closest('div[role="button"]');

    if (transactionElement) {
      fireEvent.click(transactionElement);
      expect(screen.getByLabelText('tx_info_modal')).toBeInTheDocument();
    }
  });

  test('formats amount correctly', () => {
    renderWithChainProvider(
      <HistoryBox
        isLoading={false}
        address="address1"
        currentPage={1}
        sendTxs={mockTransactions}
        totalPages={2}
      />
    );
    expect(screen.queryByText('1QT TOKEN')).toBeInTheDocument(); // Send
    expect(screen.queryByText('2Q TOKEN')).toBeInTheDocument(); // Receive
    expect(screen.queryByText('3T TOKEN')).toBeInTheDocument(); // Mint
    expect(screen.queryByText('1.2B TOKEN')).toBeInTheDocument(); // Burn
    expect(screen.queryByText('5M TOKEN')).toBeInTheDocument(); // Payout
    expect(screen.queryByText('2.1 TOKEN')).toBeInTheDocument(); // Burn held balance
    expect(screen.queryByText('2.3 TOKEN')).toBeInTheDocument(); // Payout
    expect(screen.queryByText('2.4 TOKEN')).toBeInTheDocument(); // Payout
    expect(screen.queryByText('2.5 TOKEN')).toBeInTheDocument(); // Payout
    expect(screen.queryByText('2.6 TOKEN')).toBeInTheDocument(); // Payout
  });

  test('displays loading state', () => {
    renderWithChainProvider(
      <HistoryBox
        isLoading={true}
        address="address1"
        currentPage={1}
        sendTxs={mockTransactions}
        totalPages={2}
      />
    );
    expect(screen.getByLabelText('skeleton')).toBeInTheDocument();
  });

  test('displays multi denoms as address3', () => {
    renderWithChainProvider(
      <HistoryBox
        isLoading={false}
        address="address3"
        currentPage={1}
        sendTxs={mockMultiDenomTransactions}
        totalPages={2}
      />
    );
    expect(screen.queryByText('123.12M TOKEN')).toBeInTheDocument(); // Send
    expect(screen.queryByText('12.345678 FOOBAR')).toBeInTheDocument(); // Send
    expect(screen.queryByText('5 TOKEN')).toBeInTheDocument(); // Send
    expect(screen.queryByText('0.121212 MORE')).toBeInTheDocument(); // Send
    expect(screen.queryByText(/and 1 more denomination\(s\)/i)).toBeInTheDocument(); // Send
  });

  test('displays multi denoms as address4', () => {
    renderWithChainProvider(
      <HistoryBox
        isLoading={false}
        address="address4"
        currentPage={1}
        sendTxs={mockMultiDenomTransactions}
        totalPages={2}
      />
    );
    expect(screen.queryByText('123.12M TOKEN')).toBeInTheDocument(); // Send
    expect(screen.queryByText('12.345678 FOOBAR')).toBeInTheDocument(); // Send
    expect(screen.queryByText('5 TOKEN')).toBeInTheDocument(); // Send
    expect(screen.queryByText('0.121212 MORE')).toBeInTheDocument(); // Send
    expect(screen.queryByText(/and 1 more denomination\(s\)/i)).toBeInTheDocument(); // Send
  });
});
