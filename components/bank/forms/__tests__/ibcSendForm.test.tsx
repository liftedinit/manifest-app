import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, jest, mock, test } from 'bun:test';
import React from 'react';

import IbcSendForm from '@/components/bank/forms/ibcSendForm';
import { mockBalances } from '@/tests/data';
import { renderWithChainProvider } from '@/tests/render';

// Mock next/router
mock.module('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

// Add this mock before the tests
mock.module('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
  __esModule: true,
}));

function renderWithProps(props = {}) {
  const defaultChains = [
    {
      id: 'manifest',
      name: 'Manifest',
      icon: 'https://osmosis.zone/assets/icons/osmo-logo-icon.svg',
      prefix: 'manifest',
      chainID: 'manifest-1',
    },
    {
      id: 'osmosistestnet',
      name: 'Osmosis',
      icon: 'https://osmosis.zone/assets/icons/osmo-logo-icon.svg',
      prefix: 'osmo',
      chainID: 'osmo-test-1',
    },
  ];

  const defaultProps = {
    address: 'manifest1address',
    destinationChain: defaultChains[1],
    balances: mockBalances,
    isBalancesLoading: false,
    refetchBalances: jest.fn(),
    refetchHistory: jest.fn(),
    isIbcTransfer: true,
    ibcChains: defaultChains,
    selectedFromChain: defaultChains[0],
    setSelectedFromChain: jest.fn(),
    selectedToChain: defaultChains[1],
    setSelectedToChain: jest.fn(),
    osmosisBalances: [],
    isOsmosisBalancesLoading: false,
    refetchOsmosisBalances: jest.fn(),
    resolveOsmosisRefetch: jest.fn(),
    availableToChains: defaultChains,
    chains: {
      manifest: {
        address: 'manifest1address',
        getOfflineSignerAmino: jest.fn(),
      },
      osmosistestnet: {
        address: 'osmo1address',
        getOfflineSignerAmino: jest.fn(),
      },
    },
  };

  const rendered = renderWithChainProvider(
    <div data-testid="ibc-send-form">
      <IbcSendForm {...defaultProps} {...props} />
    </div>
  );

  // Wait for component to be mounted
  return {
    ...rendered,
    findForm: () => rendered.findByTestId('ibc-send-form'),
  };
}

describe('IbcSendForm Component', () => {
  afterEach(() => {
    cleanup();
    mock.restore();
  });

  test('renders form with correct details', async () => {
    const { findForm } = renderWithProps();
    const form = await findForm();
    expect(form).toBeInTheDocument();
    expect(screen.getByLabelText('to-chain-selector')).toBeInTheDocument();
  });

  test('empty balances', async () => {
    renderWithProps({ balances: [] });
    expect(screen.queryByText('Amount')).not.toBeInTheDocument();
    expect(screen.queryByText('Send To')).not.toBeInTheDocument();
    expect(screen.queryByText('Chain')).not.toBeInTheDocument();
  });

  test('updates token dropdown correctly', () => {
    renderWithProps();
    const tokenSelector = screen.getByLabelText('token-selector');
    fireEvent.click(tokenSelector);
    expect(tokenSelector).toHaveTextContent('TOKEN 1');
  });

  test('updates recipient input correctly', () => {
    renderWithProps();
    const recipientInput = screen.getByPlaceholderText('Enter address');
    fireEvent.change(recipientInput, { target: { value: 'manifest1recipient' } });
    expect(recipientInput).toHaveValue('manifest1recipient');
  });

  test('updates chain selector correctly', () => {
    renderWithProps();
    const toChainSelector = screen.getByLabelText('to-chain-selector');
    fireEvent.click(toChainSelector);
    const osmosisOption = screen.getAllByRole('option', { name: 'Osmosis' });
    fireEvent.click(osmosisOption[0]);
    expect(screen.getByLabelText('to-chain-selector')).toHaveTextContent('Osmosis');
  });

  test('updates amount input correctly', () => {
    renderWithProps();
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '100' } });
    expect(amountInput).toHaveValue('100');
  });

  test('send button is disabled when inputs are invalid', () => {
    renderWithProps();
    const sendButton = screen.getByLabelText('send-btn');
    expect(sendButton).toBeDisabled();
  });

  test('send button is enabled when inputs are valid', () => {
    renderWithProps();
    fireEvent.change(screen.getByPlaceholderText('Enter address'), {
      target: { value: 'manifest1recipient' },
    });
    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '100' },
    });
    const tokenSelector = screen.getByLabelText('token-selector');
    fireEvent.click(tokenSelector);
    const dropdownItems = screen.getAllByText('TOKEN 1');
    fireEvent.click(dropdownItems[dropdownItems.length - 1]);
    const sendButton = screen.getByRole('button', { name: 'send-btn' });
    expect(sendButton).not.toBeDisabled();
  });

  test('handles chain selection correctly', async () => {
    renderWithProps();
    const toChainSelector = screen.getByLabelText('to-chain-selector');
    fireEvent.click(toChainSelector);
    const osmosisOption = screen.getAllByRole('option', { name: 'Osmosis' });
    fireEvent.click(osmosisOption[0]);
    expect(screen.getByLabelText('to-chain-selector')).toHaveTextContent('Osmosis');
  });
  // cant select from chain anymore hardcoded to manifest
  test.skip('prevents selecting same chain for source and destination', async () => {
    const { findForm } = renderWithProps();
    await findForm();
    const toChainSelector = screen.getByLabelText('to-chain-selector');
    await act(async () => {
      fireEvent.click(toChainSelector);
    });
    await act(async () => {
      const toChainOptions = await screen.findAllByRole('option', {
        hidden: true,
      });
      const manifestInToChain = toChainOptions.find(option => {
        const link = option.querySelector('a');
        return link && link.textContent?.includes('Manifest');
      });
      expect(manifestInToChain?.querySelector('a')).toHaveStyle({ pointerEvents: 'none' });
      expect(manifestInToChain?.querySelector('a')).toHaveClass('opacity-50');
    });
  });
});
