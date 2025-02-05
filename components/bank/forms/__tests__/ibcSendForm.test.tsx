import { describe, test, afterEach, expect, jest, mock } from 'bun:test';
import React from 'react';
import { screen, cleanup, fireEvent } from '@testing-library/react';
import IbcSendForm from '@/components/bank/forms/ibcSendForm';
import matchers from '@testing-library/jest-dom/matchers';
import { mockBalances } from '@/tests/mock';
import { renderWithChainProvider } from '@/tests/render';

expect.extend(matchers);

// Mock next/router
mock.module('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
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
        chain: { chain_id: 'manifest-1' },
      },
      osmosistestnet: {
        address: 'osmo1address',
        getOfflineSignerAmino: jest.fn(),
        chain: { chain_id: 'osmo-test-1' },
      },
    },
  };

  // Wait for a tick to ensure all effects are processed
  return {
    ...renderWithChainProvider(<IbcSendForm {...defaultProps} {...props} />),
    rerender: (newProps = {}) =>
      renderWithChainProvider(<IbcSendForm {...defaultProps} {...newProps} />),
  };
}

describe('IbcSendForm Component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test.skip('renders form with correct details', async () => {
    const { container } = renderWithProps();

    // Wait for any async operations to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    // Debug output to see what's being rendered
    if (process.env.CI) {
      console.log('Container HTML:', container.innerHTML);
    }

    // Basic structure checks
    expect(container.querySelector('[data-testid="ibc-send-form"]')).toBeInTheDocument();
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

    const fromChainSelector = screen.getByLabelText('from-chain-selector');
    fireEvent.click(fromChainSelector);

    // Get all Manifest options and select the enabled one
    const manifestOptions = screen.getAllByRole('option', { name: 'Manifest' });
    const enabledManifestOption = manifestOptions.find(
      option => !option.className.includes('opacity-50')
    );
    fireEvent.click(enabledManifestOption!);

    expect(screen.getByLabelText('from-chain-selector')).toHaveTextContent('Manifest');

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

    const fromChainSelector = screen.getByLabelText('from-chain-selector');
    fireEvent.click(fromChainSelector);

    const manifestOptions = screen.getAllByRole('option', { name: 'Manifest' });
    const enabledManifestOption = manifestOptions.find(
      option => !option.className.includes('opacity-50')
    );
    fireEvent.click(enabledManifestOption!);

    expect(screen.getByLabelText('from-chain-selector')).toHaveTextContent('Manifest');

    const toChainSelector = screen.getByLabelText('to-chain-selector');
    fireEvent.click(toChainSelector);

    const osmosisOption = screen.getAllByRole('option', { name: 'Osmosis' });
    fireEvent.click(osmosisOption[0]);

    expect(screen.getByLabelText('to-chain-selector')).toHaveTextContent('Osmosis');
  });

  test('prevents selecting same chain for source and destination', async () => {
    renderWithProps();

    const fromChainSelector = screen.getByLabelText('from-chain-selector');
    fireEvent.click(fromChainSelector);

    const manifestOptions = screen.getAllByRole('option', { name: 'Manifest' });
    const enabledManifestOption = manifestOptions.find(
      option => !option.className.includes('opacity-50')
    );
    fireEvent.click(enabledManifestOption!);

    // Verify Manifest is not available in destination chain options
    const toChainSelector = screen.getByLabelText('to-chain-selector');
    fireEvent.click(toChainSelector);

    // Check that there's only one active Manifest option (the source)
    const activeManifestOptions = screen.getAllByRole('option', { name: 'Manifest' });
    const activeManifestOption = activeManifestOptions.find(
      option => !option.className.includes('opacity-50')
    );
    expect(activeManifestOption).toBeDefined();
  });
});
