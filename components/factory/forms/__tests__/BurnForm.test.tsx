import { describe, test, afterEach, expect, jest, mock } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import BurnForm from '@/components/factory/forms/BurnForm';
import matchers from '@testing-library/jest-dom/matchers';
import { manifestAddr1, mockDenomMeta1, mockMfxDenom } from '@/tests/mock';
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

mock.module('@/hooks/useQueries', () => ({
  useTokenFactoryBalance: jest.fn().mockReturnValue({
    balance: '1000000',
    refetch: jest.fn(),
  }),
}));

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
    expect(screen.getByText('CIRCULATING SUPPLY')).toBeInTheDocument();
  });

  test('renders multi burn when token is mfx', () => {
    renderWithProps({ denom: mockMfxDenom });
    expect(screen.getByLabelText('multi-burn-button')).toBeInTheDocument();
  });

  test('renders not affiliated message when not admin and token is mfx', () => {
    renderWithProps({ isAdmin: false, denom: mockMfxDenom });
    expect(
      screen.getByText('You must be apart of the admin group to burn MFX.')
    ).toBeInTheDocument();
  });

  test('updates amount input correctly', async () => {
    renderWithProps();
    const amountInput = screen.getByPlaceholderText('Enter amount');
    fireEvent.change(amountInput, { target: { value: '100' } });
    await waitFor(() => {
      expect(amountInput).toHaveValue(100);
    });
  });

  test('burn button is disabled when inputs are invalid', async () => {
    renderWithProps();
    const burnButton = screen.getByLabelText(`burn-btn-${mockDenomMeta1.base}`);
    expect(burnButton).toBeDisabled();

    const amountInput = screen.getByPlaceholderText('Enter amount');
    fireEvent.change(amountInput, { target: { value: '-100' } });

    await waitFor(() => {
      expect(burnButton).toBeDisabled();
    });
  });

  test('burn button is enabled when inputs are valid', async () => {
    renderWithProps();
    const amountInput = screen.getByPlaceholderText('Enter amount');
    const recipientInput = screen.getByPlaceholderText('Recipient address');
    const burnButton = screen.getByLabelText(`burn-btn-${mockDenomMeta1.base}`);

    fireEvent.change(amountInput, { target: { value: '100' } });
    fireEvent.change(recipientInput, { target: { value: manifestAddr1 } });

    await waitFor(() => {
      expect(burnButton).toBeEnabled();
    });
  });

  test('burn button is disabled when inputs are invalid', () => {
    renderWithProps();
    const burnButton = screen.getByLabelText(`burn-btn-${mockDenomMeta1.base}`);
    expect(burnButton).toBeDisabled();
  });
});
