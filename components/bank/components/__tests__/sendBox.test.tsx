import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import React from 'react';

import SendBox from '@/components/bank/components/sendBox';
import { clearAllMocks, formatComponent, mockModule, mockRouter } from '@/tests';
import { mockBalances } from '@/tests/data';
import { renderWithChainProvider } from '@/tests/render';

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
  beforeEach(() => {
    mockRouter();
    // Add this mock before your tests
    mockModule('next/image', () => ({
      default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} alt={props.alt || ''} />;
      },
    }));
  });
  afterEach(() => {
    cleanup();
    clearAllMocks();
  });

  test('renders correctly', () => {
    const mockup = renderWithProps();
    expect(screen.getByLabelText('Send tab')).toBeInTheDocument();
    expect(screen.getByLabelText('Cross chain transfer tab')).toBeInTheDocument();
  });

  test.skip('toggles between Send and Cross-Chain Transfer', async () => {
    const mockup = renderWithProps();

    // Check initial send form
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    expect(screen.queryByLabelText('to-chain-selector')).not.toBeInTheDocument();

    // Switch to cross-chain transfer
    fireEvent.click(screen.getByLabelText('Cross chain transfer tab'));

    // Verify cross-chain elements are present
    await waitFor(() => {
      expect(screen.getAllByLabelText('ibc-send-form')).toBeInTheDocument();
    });

    expect(formatComponent(mockup.asFragment())).toMatchSnapshot();
  });

  test.skip('displays chain selection dropdowns in Cross-Chain Transfer mode', async () => {
    renderWithProps();
    fireEvent.click(screen.getByLabelText('Cross chain transfer tab'));

    await waitFor(() => {
      expect(screen.getByLabelText('to-chain-selector')).toBeInTheDocument();
    });
  });
});
