import { test, expect, afterEach, describe } from 'bun:test';
import React from 'react';
import matchers from '@testing-library/jest-dom/matchers';
import { screen, cleanup, render, fireEvent } from '@testing-library/react';
import { HistoryBox } from '@/components/bank/components/historyBox';
import { renderWithChainProvider } from '@/tests/render';
import { mockTransactions } from '@/tests/mock';

expect.extend(matchers);

describe('HistoryBox', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders correctly', () => {
    renderWithChainProvider(
      <HistoryBox
        isLoading={false}
        send={mockTransactions}
        address="manifest123akjshjashdjkashjdahskjdhjakshdjkashkdjasjdhadajsdhkajsd"
      />
    );
    expect(screen.getByText('Transaction History')).toBeInTheDocument();
  });

  test('displays transactions', () => {
    renderWithChainProvider(
      <HistoryBox
        isLoading={false}
        send={mockTransactions}
        address="manifest123akjshjashdjkashjdahskjdhjakshdjkashkdjasjdhadajsdhkajsd"
      />
    );
    expect(screen.getByText('+1 TOKEN')).toBeInTheDocument();
  });

  test("displays 'No transactions found' message when there are no transactions", () => {
    renderWithChainProvider(
      <HistoryBox
        isLoading={false}
        send={[]}
        address="manifest123akjshjashdjkashjdahskjdhjakshdjkashkdjasjdhadajsdhkajsd"
      />
    );
    expect(screen.getByText('No transactions found for this account!')).toBeInTheDocument();
  });

  test('opens modal when clicking on a transaction', () => {
    renderWithChainProvider(
      <HistoryBox
        isLoading={false}
        send={mockTransactions}
        address="manifest123akjshjashdjkashjdahskjdhjakshdjkashkdjasjdhadajsdhkajsd"
      />
    );

    const transaction = screen.getByText('+1 TOKEN');
    fireEvent.click(transaction);
    expect(screen.getByLabelText('tx_info_modal')).toBeInTheDocument();
  });

  test('formats amount correctly', () => {
    renderWithChainProvider(
      <HistoryBox
        isLoading={false}
        send={mockTransactions}
        address="manifest123akjshjashdjkashjdahskjdhjakshdjkashkdjasjdhadajsdhkajsd"
      />
    );
    expect(screen.getByText('+1 TOKEN')).toBeInTheDocument();
  });

  test('displays both sent and received transactions', () => {
    const mixedTransactions = [
      ...mockTransactions,
      {
        ...mockTransactions[0],
        data: {
          ...mockTransactions[0].data,
          from_address: 'manifest123akjshjashdjkashjdahskjdhjakshdjkashkdjasjdhadajsdhkajsd',
        },
      },
    ];

    renderWithChainProvider(
      <HistoryBox
        isLoading={false}
        send={mixedTransactions}
        address="manifest123akjshjashdjkashjdahskjdhjakshdjkashkdjasjdhadajsdhkajsd"
      />
    );

    expect(screen.getByText('+1 TOKEN')).toBeInTheDocument();
    expect(screen.getByText('Sent')).toBeInTheDocument();
  });
});
