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
  };

  return renderWithChainProvider(<IbcSendForm {...defaultProps} {...props} />);
}

// TODO: Validate form inputs in component
describe('IbcSendForm Component', () => {
  afterEach(cleanup);

  test('renders form with correct details', () => {
    renderWithProps();
    expect(screen.getByText('Token')).toBeInTheDocument();
    expect(screen.getByText('Recipient')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  test('empty balances', () => {
    renderWithProps({ balances: [] });
    expect(screen.getByText('Select Token')).toBeInTheDocument();
  });

  test('updates token dropdown correctly', () => {
    renderWithProps();
    const dropdownLabelContainer = screen.getByLabelText('dropdown-label');
    fireEvent.click(within(dropdownLabelContainer).getByText('TOKEN 1'));

    const balanceContainer = screen.getByLabelText('Token 1');
    expect(within(balanceContainer).getByText('TOKEN 1')).toBeInTheDocument();
    expect(within(balanceContainer).queryByText('TOKEN 2')).not.toBeInTheDocument();
  });

  test('updates recipient input correctly', () => {
    renderWithProps();
    const recipientInput = screen.getByPlaceholderText('Recipient address');
    fireEvent.change(recipientInput, { target: { value: 'cosmos1recipient' } });
    expect(recipientInput).toHaveValue('cosmos1recipient');
  });

  test('updates amount input correctly', () => {
    renderWithProps();
    const amountInput = screen.getByPlaceholderText('Enter amount');
    fireEvent.change(amountInput, { target: { value: '100' } });
    expect(amountInput).toHaveValue('100');
  });

  // // TODO: Make this test pass
  // test('send button is disabled when inputs are invalid', () => {
  //   renderWithProps();
  //   const sendButton = screen.getByLabelText('send-btn');
  //   expect(sendButton).toBeDisabled();
  // });

  // TODO: Fix inputs to be valid
  test('send button is enabled when inputs are valid', () => {
    renderWithProps();
    fireEvent.change(screen.getByPlaceholderText('Recipient address'), {
      target: { value: 'cosmos1recipient' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter amount'), {
      target: { value: '100' },
    });
    const dropdownLabelContainer = screen.getByLabelText('dropdown-label');
    fireEvent.click(within(dropdownLabelContainer).getByText('TOKEN 1'));
    const sendButton = screen.getByText('Send');
    expect(sendButton).toBeEnabled();
  });
});
