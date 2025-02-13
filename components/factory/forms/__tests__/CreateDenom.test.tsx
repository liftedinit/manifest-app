import { describe, test, afterEach, expect, jest, mock } from 'bun:test';
import React from 'react';
import { screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import CreateDenom from '@/components/factory/forms/CreateDenom';
import { renderWithChainProvider } from '@/tests/render';
import { mockTokenFormData } from '@/tests/mock';

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
