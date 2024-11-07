import { describe, test, afterEach, expect, jest } from 'bun:test';
import React from 'react';
import { screen, cleanup, fireEvent, within } from '@testing-library/react';
import IbcSendForm from '@/components/bank/forms/ibcSendForm';
import matchers from '@testing-library/jest-dom/matchers';
import { mockBalances } from '@/tests/mock';
import { renderWithChainProvider } from '@/tests/render';

expect.extend(matchers);

function renderWithProps(props = {}) {
  const defaultProps = {
    address: 'manifest1address',
    destinationChain: 'osmosis',
    balances: mockBalances,
    isBalancesLoading: false,
    refetchBalances: jest.fn(),
    isIbcTransfer: true,
    setIsIbcTransfer: jest.fn(),
    ibcChains: [
      {
        id: 'osmosis',
        name: 'Osmosis',
        icon: 'https://osmosis.zone/assets/icons/osmo-logo-icon.svg',
        prefix: 'osmo',
      },
    ],
    selectedChain: 'osmosis',
    setSelectedChain: jest.fn(),
  };

  return renderWithChainProvider(<IbcSendForm {...defaultProps} {...props} />);
}

describe('IbcSendForm Component', () => {
  afterEach(cleanup);

  test('renders form with correct details', () => {
    renderWithProps();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Send To')).toBeInTheDocument();
    expect(screen.getByText('Chain')).toBeInTheDocument();
  });

  test('empty balances', () => {
    renderWithProps({ balances: [] });
    const tokenSelector = screen.getByText('Select');
    expect(tokenSelector).toBeInTheDocument();
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
    const chainSelector = screen.getByLabelText('chain-selector');
    fireEvent.click(chainSelector);
    expect(chainSelector).toHaveTextContent('Osmosis');
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
});
