import { test, expect, afterEach, describe } from 'bun:test';
import React from 'react';
import matchers from '@testing-library/jest-dom/matchers';
import { render, screen, cleanup, waitFor, fireEvent, within } from '@testing-library/react';
import { HistoryBox } from '@/components/bank/components/historyBox';
import { mockTransactions } from '@/tests/mock';

expect.extend(matchers);

describe('HistoryBox', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders correctly', () => {
    render(<HistoryBox isLoading={false} send={mockTransactions} address="address1" />);
    expect(screen.getByText('Tx History')).toBeInTheDocument();
  });

  test('displays transactions', () => {
    render(<HistoryBox isLoading={false} send={mockTransactions} address="address1" />);
    expect(screen.getByText('Send')).toBeInTheDocument();
    expect(screen.getByText('Receive')).toBeInTheDocument();
  });

  test("displays 'No transactions found' message when there are no transactions", () => {
    render(<HistoryBox isLoading={false} send={[]} address="address1" />);
    expect(screen.getByText('No transactions found for this account!')).toBeInTheDocument();
  });

  test('opens modal when clicking on a transaction', async () => {
    render(<HistoryBox isLoading={false} send={mockTransactions} address="address1" />);
    fireEvent.click(screen.getByText('Send'));
    await waitFor(() => {
      expect(screen.getByLabelText('tx info')).toBeInTheDocument();
      expect(screen.getByText('Transaction Details')).toBeInTheDocument();

      const fromContainer = screen.getByLabelText('from');
      expect(within(fromContainer).getByText('addres...dress1')).toBeInTheDocument();
      const toContainer = screen.getByLabelText('to');
      expect(within(toContainer).getByText('addres...dress2')).toBeInTheDocument();
    });
  });

  test('formats date correctly', () => {
    render(<HistoryBox isLoading={false} send={mockTransactions} address="address1" />);
    expect(screen.getByText('May 1, 2023')).toBeInTheDocument();
  });

  test('formats amount correctly', () => {
    render(<HistoryBox isLoading={false} send={mockTransactions} address="address1" />);
    expect(screen.getByText('1 TOKEN')).toBeInTheDocument();
  });
});
