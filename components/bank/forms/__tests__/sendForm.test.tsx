import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, jest, mock, test } from 'bun:test';
import React from 'react';

import SendForm from '@/components/bank/forms/sendForm';
import { mockBalances } from '@/tests/data';
import { renderWithChainProvider } from '@/tests/render';

mock.module('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

function renderWithProps(props = {}) {
  const defaultProps = {
    address: 'manifest1address',
    balances: mockBalances,
    isBalancesLoading: false,
    refetchBalances: jest.fn(),
    ibcChains: [
      {
        id: 'osmosis',
        name: 'Osmosis',
        icon: 'https://osmosis.zone/assets/icons/osmo-logo-icon.svg',
        prefix: 'osmo',
      },
    ],
  };

  return renderWithChainProvider(<SendForm {...defaultProps} {...props} />);
}

describe('SendForm Component', () => {
  afterEach(() => {
    cleanup();
    mock.restore();
  });

  test('renders form with correct details', () => {
    renderWithProps();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Send To')).toBeInTheDocument();
  });

  test('empty balances', () => {
    renderWithProps({ balances: [] });
    expect(screen.queryByText('Amount')).not.toBeInTheDocument();
    expect(screen.queryByText('Send To')).not.toBeInTheDocument();
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
