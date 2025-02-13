import { describe, test, afterEach, expect, jest, mock } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import MintForm from '@/components/factory/forms/MintForm';
import { renderWithChainProvider } from '@/tests/render';
import { mockDenomMeta1, mockFakeMfxDenom, mockMfxDenom } from '@/tests/mock';

// Mock next/router
const m = jest.fn();
mock.module('next/router', () => ({
  useRouter: m.mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

const mockProps = {
  isAdmin: true,
  admin: 'cosmos1adminaddress',
  denom: {
    ...mockDenomMeta1,
    balance: '1000000',
    totalSupply: '1000000',
  },
  address: 'cosmos1address',
  refetch: jest.fn(),
  balance: '1000000',
  totalSupply: '1000000',
};

function renderWithProps(props = {}) {
  return renderWithChainProvider(<MintForm {...mockProps} {...props} />);
}

describe('MintForm Component', () => {
  afterEach(cleanup);

  test('renders form with correct details', () => {
    renderWithProps();
    expect(screen.getByText('NAME')).toBeInTheDocument();
    expect(screen.getByText('CIRCULATING SUPPLY')).toBeInTheDocument();
  });

  test('updates amount input correctly', async () => {
    renderWithProps();
    const amountInput = screen.getByLabelText('AMOUNT');
    fireEvent.change(amountInput, { target: { value: '100' } });
    await waitFor(() => {
      expect(amountInput).toHaveValue(100);
    });
  });

  test('updates recipient input correctly', async () => {
    renderWithProps();
    const recipientInput = screen.getByPlaceholderText('Recipient address');
    fireEvent.change(recipientInput, { target: { value: 'cosmos1recipient' } });
    await waitFor(() => {
      expect(recipientInput).toHaveValue('cosmos1recipient');
    });
  });

  test('mint button is disabled when inputs are invalid', async () => {
    renderWithProps();
    const mintButton = screen.getByLabelText(`mint-btn-${mockDenomMeta1.display}`);
    expect(mintButton).toBeDisabled();

    const amountInput = screen.getByLabelText('AMOUNT');
    fireEvent.change(amountInput, { target: { value: '-100' } });

    await waitFor(() => {
      expect(mintButton).toBeDisabled();
    });
  });

  test('mint button is enabled when inputs are valid', async () => {
    renderWithProps();
    const amountInput = screen.getByLabelText('AMOUNT');
    const recipientInput = screen.getByLabelText('RECIPIENT');
    const mintButton = screen.getByLabelText(`mint-btn-${mockDenomMeta1.display}`);

    fireEvent.change(amountInput, { target: { value: '1' } });
    fireEvent.change(recipientInput, {
      target: { value: 'manifest1aucdev30u9505dx9t6q5fkcm70sjg4rh7rn5nf' },
    });

    await waitFor(() => {
      expect(mintButton).toBeEnabled();
    });
  });

  test('fake MFX can be minted', async () => {
    renderWithProps({ isAdmin: false, denom: mockFakeMfxDenom });
    const amountInput = screen.getByLabelText('AMOUNT');
    const recipientInput = screen.getByLabelText('RECIPIENT');
    const mintButton = screen.getByLabelText(`mint-btn-${mockFakeMfxDenom.display}`);

    fireEvent.change(amountInput, { target: { value: '1' } });
    fireEvent.change(recipientInput, {
      target: { value: 'manifest1aucdev30u9505dx9t6q5fkcm70sjg4rh7rn5nf' },
    });

    await waitFor(() => {
      expect(mintButton).toBeEnabled();
    });
  });
});
