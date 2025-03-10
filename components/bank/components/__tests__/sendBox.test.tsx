import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, jest, mock, test } from 'bun:test';
import React from 'react';

import SendBox from '@/components/bank/components/sendBox';
import { mockBalances } from '@/tests/data';
import { renderWithChainProvider } from '@/tests/render';

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
    refetchHistory: () => {},
    osmosisBalances: [],
    isOsmosisBalancesLoading: false,
    refetchOsmosisBalances: () => {},
    resolveOsmosisRefetch: () => {},
  };
  return renderWithChainProvider(<SendBox {...defaultProps} {...props} />);
};

describe('SendBox', () => {
  afterEach(() => {
    cleanup();
    mock.restore();
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
      expect(screen.getByLabelText('to-chain-selector')).toBeInTheDocument();
    });
  });

  test('displays chain selection dropdowns in Cross-Chain Transfer mode', async () => {
    renderWithProps();
    fireEvent.click(screen.getByLabelText('cross-chain-transfer-tab'));

    await waitFor(() => {
      expect(screen.getByLabelText('to-chain-selector')).toBeInTheDocument();
    });
  });
});
