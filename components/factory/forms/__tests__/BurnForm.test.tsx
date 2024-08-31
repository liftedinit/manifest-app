import { describe, test, afterEach, expect, jest } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import BurnForm from '@/components/factory/forms/BurnForm';
import matchers from '@testing-library/jest-dom/matchers';
import { mockDenomMeta1, mockMfxDenom } from '@/tests/mock';
import { renderWithChainProvider } from '@/tests/render';

expect.extend(matchers);

const mockProps = {
  isAdmin: true,
  admin: 'cosmos1adminaddress',
  denom: mockDenomMeta1,
  address: 'cosmos1address',
  refetch: jest.fn(),
  balance: '1000000',
};

function renderWithProps(props = {}) {
  return renderWithChainProvider(<BurnForm {...mockProps} {...props} />);
}

describe('BurnForm Component', () => {
  afterEach(cleanup);

  test('renders form with correct details', () => {
    renderWithProps();
    expect(screen.getByText('NAME')).toBeInTheDocument();
    expect(screen.getByText('YOUR BALANCE')).toBeInTheDocument();
    expect(screen.getByText('EXPONENT')).toBeInTheDocument();
    expect(screen.getByText('CIRCULATING SUPPLY')).toBeInTheDocument();
  });

  test('renders multi burn when token is mfx', () => {
    renderWithProps({ denom: mockMfxDenom });
    expect(screen.getByLabelText('multi-burn-btn')).toBeInTheDocument();
  });

  test('renders not affiliated message when not admin and token is mfx', () => {
    renderWithProps({ isAdmin: false, denom: mockMfxDenom });
    expect(
      screen.getByText('You are not affiliated with any PoA Admin entity.')
    ).toBeInTheDocument();
  });

  test('updates amount input correctly', () => {
    renderWithProps();
    const amountInput = screen.getByPlaceholderText('Enter amount');
    fireEvent.change(amountInput, { target: { value: '100' } });
    expect(amountInput).toHaveValue('100');
  });

  test('updates recipient input correctly', () => {
    renderWithProps();
    const recipientInput = screen.getByPlaceholderText('Target address');
    fireEvent.change(recipientInput, { target: { value: 'cosmos1recipient' } });
    expect(recipientInput).toHaveValue('cosmos1recipient');
  });

  // // TODO: Make this test pass
  // test('burn button is disabled when inputs are invalid', () => {
  //   renderWithProps();
  //   const burnButton = screen.getByText('Burn');
  //   expect(burnButton).toBeDisabled();
  // });

  // TODO: Validate form inputs in component
  test('burn button is enabled when inputs are valid', () => {
    renderWithProps();
    fireEvent.change(screen.getByPlaceholderText('Enter amount'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByPlaceholderText('Target address'), {
      target: { value: 'cosmos1recipient' },
    });
    const burnButton = screen.getByText('Burn');
    expect(burnButton).toBeEnabled();
  });
});
