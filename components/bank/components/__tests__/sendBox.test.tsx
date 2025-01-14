import { test, expect, afterEach, describe, mock, jest } from 'bun:test';
import React from 'react';
import matchers from '@testing-library/jest-dom/matchers';
import { screen, cleanup, waitFor, fireEvent, within } from '@testing-library/react';
import SendBox from '@/components/bank/components/sendBox';
import { mockBalances } from '@/tests/mock';
import { renderWithChainProvider } from '@/tests/render';

expect.extend(matchers);

// Mock next/router
const m = jest.fn();
mock.module('next/router', () => ({
  useRouter: m.mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

// Add this mock before your tests
mock.module('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

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
    // Check initial send form
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    expect(screen.queryByLabelText('to-chain-selector')).not.toBeInTheDocument();

    // Switch to cross-chain transfer
    fireEvent.click(screen.getByLabelText('cross-chain-transfer-tab'));

    // Verify cross-chain elements are present
    await waitFor(() => {
      expect(screen.getByLabelText('from-chain-selector')).toBeInTheDocument();
      expect(screen.getByLabelText('to-chain-selector')).toBeInTheDocument();
    });
  });

  test('displays chain selection dropdowns in Cross-Chain Transfer mode', async () => {
    renderWithProps();
    fireEvent.click(screen.getByLabelText('cross-chain-transfer-tab'));

    await waitFor(() => {
      expect(screen.getByLabelText('from-chain-selector')).toBeInTheDocument();
      expect(screen.getByLabelText('to-chain-selector')).toBeInTheDocument();
    });
  });

  test('selects chains in Cross-Chain Transfer mode', async () => {
    renderWithProps();
    fireEvent.click(screen.getByLabelText('cross-chain-transfer-tab'));

    // Select destination chain
    await waitFor(() => {
      const toChainSelector = screen.getByLabelText('to-chain-selector');
      expect(toChainSelector).toBeInTheDocument();
      fireEvent.click(toChainSelector);
    });

    // Select Osmosis as destination
    await waitFor(() => {
      const toChainDropdown = screen.getByLabelText('to-chain-selector').closest('.dropdown');
      expect(toChainDropdown).toBeInTheDocument();

      // Find and click the Osmosis option within the dropdown
      const osmosisOption = within(toChainDropdown!).getByText('Osmosis');
      fireEvent.click(osmosisOption);
    });

    // Verify selection using text content instead of complex matchers
    await waitFor(() => {
      const selectedChain = screen.getByLabelText('to-chain-selector');
      const chainText = selectedChain.textContent;
      expect(chainText?.includes('Osmosis')).toBe(true);
    });
  });
});
