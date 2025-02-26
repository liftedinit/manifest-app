import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, jest, mock, test } from 'bun:test';
import React from 'react';

import CreateDenom from '@/components/factory/forms/CreateDenom';
import { mockTokenFormData } from '@/tests/mock';
import { renderWithChainProvider } from '@/tests/render';

const mockProps = {
  nextStep: jest.fn(),
  formData: mockTokenFormData,
  dispatch: jest.fn(),
  address: 'cosmos1address',
};

mock.module('@/utils/transactionUtils', () => ({
  useSimulateDenomCreation: jest.fn().mockReturnValue({
    simulateDenomCreation: jest.fn().mockReturnValue(true),
  }),
}));

describe('CreateDenom Component', () => {
  afterEach(cleanup);

  test('renders form with correct details', () => {
    renderWithChainProvider(<CreateDenom {...mockProps} />);
    expect(screen.getByText('Create Denom')).toBeInTheDocument();
    expect(screen.getByText('Token Sub Denom')).toBeInTheDocument();
  });

  test('updates subdenom input correctly', async () => {
    renderWithChainProvider(<CreateDenom {...mockProps} />);
    const subdenomInput = screen.getByPlaceholderText('token');
    fireEvent.change(subdenomInput, { target: { value: 'utest' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'subdenom',
        value: 'utest',
      });
    });
  });

  test('confirm button is enabled when inputs are valid', async () => {
    renderWithChainProvider(<CreateDenom {...mockProps} />);
    const confirmButton = screen.getByText('Next: Token Metadata');
    const subdenomInput = screen.getByPlaceholderText('token');
    fireEvent.change(subdenomInput, { target: { value: 'utest' } });
    fireEvent.blur(subdenomInput);
    await waitFor(() => {
      expect(confirmButton).toBeEnabled();
    });
  });
});
