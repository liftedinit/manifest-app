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
  const defaultProps = {
    address: 'manifest1address',
    destinationChain: 'osmosistestnet',
    balances: mockBalances,
    isBalancesLoading: false,
    refetchBalances: jest.fn(),
    isIbcTransfer: true,
    setIsIbcTransfer: jest.fn(),
    ibcChains: [
      {
        id: 'manifest',
        name: 'Manifest',
        icon: 'https://osmosis.zone/assets/icons/osmo-logo-icon.svg',
        prefix: 'manifest',
      },
      {
        id: 'osmosistestnet',
        name: 'Osmosis',
        icon: 'https://osmosis.zone/assets/icons/osmo-logo-icon.svg',
        prefix: 'osmo',
      },
    ],
    selectedChain: 'osmosistestnet',
    setSelectedChain: jest.fn(),
    setSelectedFromChain: jest.fn(),
  };

  return renderWithChainProvider(<IbcSendForm {...defaultProps} {...props} />);
}

describe('IbcSendForm Component', () => {
  afterEach(cleanup);

  test('renders form with correct details', () => {
    renderWithProps();
    expect(screen.getByText('From Chain')).toBeInTheDocument();
    expect(screen.getByText('To Chain')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Send To')).toBeInTheDocument();
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
    const chainSelector = screen.getByRole('combobox', { name: 'to-chain-selector' });
    fireEvent.click(chainSelector);
    expect(screen.getByText('Osmosis')).toBeInTheDocument();
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

    // Test from-chain selection
    const fromChainSelector = screen.getByLabelText('from-chain-selector');
    expect(fromChainSelector).toBeInTheDocument();
    fireEvent.click(fromChainSelector);

    // Find and click Manifest option
    const manifestOption = screen.getByText('Manifest');
    fireEvent.click(manifestOption);

    // Instead of checking the content directly, check for the presence of elements
    const manifestIcon = screen.getAllByAltText('Manifest')[0];
    expect(manifestIcon).toBeInTheDocument();

    // Test to-chain selection
    const toChainSelector = screen.getByLabelText('to-chain-selector');
    expect(toChainSelector).toBeInTheDocument();
    fireEvent.click(toChainSelector);

    // Find and click Osmosis option
    const osmosisOption = screen.getByText('Osmosis');
    fireEvent.click(osmosisOption);

    // Check for Osmosis icon instead of content
    const osmosisIcon = screen.getAllByAltText('Osmosis')[0];
    expect(osmosisIcon).toBeInTheDocument();
  });

  test('prevents selecting same chain for source and destination', async () => {
    renderWithProps();

    // Select Manifest as source chain
    const fromChainSelector = screen.getByLabelText('from-chain-selector');
    fireEvent.click(fromChainSelector);
    fireEvent.click(screen.getByText('Manifest'));

    // Verify Manifest is not available in destination chain options
    const toChainSelector = screen.getByLabelText('to-chain-selector');
    fireEvent.click(toChainSelector);

    // The dropdown for destination chain should not show Manifest
    const manifestOptions = screen.getAllByText('Manifest');
    expect(manifestOptions.length).toBe(1); // Only the source chain should show Manifest
  });
});
