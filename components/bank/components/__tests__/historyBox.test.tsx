import { test, expect, afterEach, describe, mock } from 'bun:test';
import { screen, cleanup, fireEvent } from '@testing-library/react';
import { HistoryBox } from '../historyBox';
import { renderWithChainProvider } from '@/tests/render';
import { mockTransactions } from '@/tests/mock';
import matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

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
  useGetFilteredTxAndSuccessfulProposals: () => ({
    sendTxs: mockTransactions,
    totalPages: 2,
    isLoading: false,
    isError: false,
  }),
}));

describe('HistoryBox', () => {
  afterEach(() => {
    cleanup();
    mock.restore();
  });

  test('renders correctly', () => {
    renderWithChainProvider(<HistoryBox isLoading={false} address="address1" />);
    expect(screen.getByText('Transaction History')).toBeInTheDocument();
  });

  test('displays transactions', () => {
    renderWithChainProvider(<HistoryBox isLoading={false} address="address1" />);
    expect(screen.getByText('Sent')).toBeInTheDocument();
    expect(screen.getByText('Received')).toBeInTheDocument();

    const minted = screen.getAllByText('Minted');
    const burned = screen.getAllByText('Burned');

    expect(minted.length).toBe(6);
    expect(burned.length).toBe(2);
  });

  test('opens modal when clicking on a transaction', () => {
    renderWithChainProvider(<HistoryBox isLoading={false} address="address1" />);

    const transactionElement = screen.getByText('Sent').closest('div[role="button"]');

    if (transactionElement) {
      fireEvent.click(transactionElement);
      expect(screen.getByLabelText('tx_info_modal')).toBeInTheDocument();
    }
  });

  test('formats amount correctly', () => {
    renderWithChainProvider(<HistoryBox isLoading={false} address="address1" />);
    expect(screen.queryByText('-1.00QT TOKEN')).toBeInTheDocument(); // Send
    expect(screen.queryByText('+2.00Q TOKEN')).toBeInTheDocument(); // Receive
    expect(screen.queryByText('+3.00T TOKEN')).toBeInTheDocument(); // Mint
    expect(screen.queryByText('-1.20B TOKEN')).toBeInTheDocument(); // Burn
    expect(screen.queryByText('+5.00M TOKEN')).toBeInTheDocument(); // Payout
    expect(screen.queryByText('-2.1 TOKEN')).toBeInTheDocument(); // Burn held balance
    expect(screen.queryByText('+2.3 TOKEN')).toBeInTheDocument(); // Payout
    expect(screen.queryByText('+2.4 TOKEN')).toBeInTheDocument(); // Payout
    expect(screen.queryByText('+2.5 TOKEN')).toBeInTheDocument(); // Payout
    expect(screen.queryByText('+2.6 TOKEN')).toBeInTheDocument(); // Payout
  });

  test('displays loading state', () => {
    renderWithChainProvider(<HistoryBox isLoading={true} address="address1" />);
    expect(screen.getByLabelText('skeleton')).toBeInTheDocument();
  });
});
