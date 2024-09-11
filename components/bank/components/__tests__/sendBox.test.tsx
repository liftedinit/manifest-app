import { test, expect, afterEach, describe } from 'bun:test';
import React from 'react';
import matchers from '@testing-library/jest-dom/matchers';
import { screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import SendBox from '@/components/bank/components/sendBox';
import { mockBalances } from '@/tests/mock';
import { renderWithChainProvider } from '@/tests/render';

expect.extend(matchers);

const renderWithProps = (props = {}) => {
  const defaultProps = {
    address: 'test_address',
    balances: mockBalances,
    isBalancesLoading: false,
    refetchBalances: () => {},
  };
  return renderWithChainProvider(<SendBox {...defaultProps} {...props} />);
};

describe('SendBox', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders correctly', () => {
    renderWithProps();
    expect(screen.getByLabelText('send-tab')).toBeInTheDocument();
    expect(screen.getByLabelText('cross-chain-transfer-tab')).toBeInTheDocument();
  });

  test('toggles between Send and Cross-Chain Transfer', async () => {
    renderWithProps();
    expect(screen.getByText('Amount')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cross-Chain Transfer'));
    await waitFor(() => expect(screen.getByText('Chain')).toBeInTheDocument());
  });

  test('displays chain selection dropdown when in Cross-Chain Transfer mode', async () => {
    renderWithProps();
    fireEvent.click(screen.getByText('Cross-Chain Transfer'));
    await waitFor(() => expect(screen.getByText('Chain')).toBeInTheDocument());
  });

  test('selects a chain in Cross-Chain Transfer mode', async () => {
    renderWithProps();
    const crossChainBtn = screen.getByLabelText('cross-chain-transfer-tab');
    fireEvent.click(crossChainBtn);

    await waitFor(() => {
      const chainSelector = screen.getByLabelText('chain-selector');
      expect(chainSelector).toBeTruthy();
    });

    const chainSelector = screen.getByLabelText('chain-selector');
    fireEvent.click(chainSelector);

    await waitFor(() => {
      const osmosisOption = screen.getByText('Osmosis');
      expect(osmosisOption).toBeTruthy();
    });

    const osmosisOption = screen.getByText('Osmosis');
    fireEvent.click(osmosisOption);

    await waitFor(() => {
      const updatedChainSelector = screen.getByLabelText('chain-selector');
      expect(updatedChainSelector.textContent).toContain('Osmosis');
    });
  });
});
