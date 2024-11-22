import { test, expect, afterEach, describe, mock } from 'bun:test';
import { screen, cleanup, fireEvent } from '@testing-library/react';
import { HistoryBox } from '../historyBox';
import { renderWithChainProvider } from '@/tests/render';
import { mockTransactions } from '@/tests/mock';

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
  useSendTxIncludingAddressQuery: () => ({
    sendTxs: mockTransactions,
    totalPages: 1,
    isLoading: false,
    isError: false,
  }),
}));

describe('HistoryBox', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders correctly', () => {
    renderWithChainProvider(
      <HistoryBox isLoading={false} send={mockTransactions} address="address1" />
    );
    expect(screen.getByText('Transaction History')).toBeTruthy();
  });

  test('displays transactions', () => {
    renderWithChainProvider(
      <HistoryBox isLoading={false} send={mockTransactions} address="address1" />
    );

    const sentText = screen.getByText('Sent');
    const receivedText = screen.getByText('Received');

    expect(sentText).toBeTruthy();
    expect(receivedText).toBeTruthy();
  });

  test('opens modal when clicking on a transaction', () => {
    renderWithChainProvider(
      <HistoryBox isLoading={false} send={mockTransactions} address="address1" />
    );

    const transactionElement = screen.getByText('Sent').closest('div[role="button"]');

    if (transactionElement) {
      fireEvent.click(transactionElement);
      expect(screen.getByLabelText('tx_info_modal')).toBeTruthy();
    }
  });

  test('formats amount correctly', () => {
    renderWithChainProvider(
      <HistoryBox isLoading={false} send={mockTransactions} address="address1" />
    );

    const sentAmount = screen.queryByText('-1 TOKEN');
    const receivedAmount = screen.queryByText('+2 TOKEN');

    expect(sentAmount).toBeTruthy();
    expect(receivedAmount).toBeTruthy();
  });

  test('displays both sent and received transactions', () => {
    renderWithChainProvider(
      <HistoryBox isLoading={false} send={mockTransactions} address="address1" />
    );

    const sentText = screen.getByText('Sent');
    const receivedText = screen.getByText('Received');

    expect(sentText).toBeTruthy();
    expect(receivedText).toBeTruthy();
  });
});
