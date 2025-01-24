import { test, expect, afterEach, describe, mock, jest } from 'bun:test';
import { screen, cleanup, fireEvent } from '@testing-library/react';
import { HistoryBox } from '../historyBox';
import { renderWithChainProvider } from '@/tests/render';
import { mockTransactions } from '@/tests/mock';
import matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Mock next/router
const m = jest.fn();
mock.module('next/router', () => ({
  useRouter: m.mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

// Mock the hooks
mock.module('@/hooks', () => ({
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
      ],
    },
  }),
}));

describe('HistoryBox', () => {
  afterEach(() => {
    cleanup();
    mock.restore();
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

  test('displays transactions', () => {
    renderWithChainProvider(
      <HistoryBox
        isLoading={false}
        address="address1"
        currentPage={1}
        sendTxs={mockTransactions}
        totalPages={2}
      />
    );
    expect(screen.getByText('You sent TOKEN to address2')).toBeInTheDocument();
    expect(screen.getByText('You received TOKEN from address2')).toBeInTheDocument();
    expect(screen.getByText('You minted TOKEN to address2')).toBeInTheDocument();
    expect(screen.getByText('You were burned TOKEN by address2')).toBeInTheDocument();
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

    const transactionElement = screen
      .getByText('You sent TOKEN to address2')
      .closest('div[role="button"]');

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
    expect(screen.queryByText('-1.00QT TOKEN')).toBeInTheDocument(); // Send
    expect(screen.queryByText('+2.00Q TOKEN')).toBeInTheDocument(); // Receive
    // expect(screen.queryByText('+3.00T TOKEN')).toBeInTheDocument(); // Mint
    // expect(screen.queryByText('-1.20B TOKEN')).toBeInTheDocument(); // Burn
    // expect(screen.queryByText('+5.00M TOKEN')).toBeInTheDocument(); // Payout
    // expect(screen.queryByText('-2.1 TOKEN')).toBeInTheDocument(); // Burn held balance
    // expect(screen.queryByText('+2.3 TOKEN')).toBeInTheDocument(); // Payout
    // expect(screen.queryByText('+2.4 TOKEN')).toBeInTheDocument(); // Payout
    // expect(screen.queryByText('+2.5 TOKEN')).toBeInTheDocument(); // Payout
    // expect(screen.queryByText('+2.6 TOKEN')).toBeInTheDocument(); // Payout
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
});
