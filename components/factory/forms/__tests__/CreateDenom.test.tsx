import { describe, test, afterEach, expect, jest } from 'bun:test';
import React from 'react';
import { screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import CreateDenom from '@/components/factory/forms/CreateDenom';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import { mockTokenFormData } from '@/tests/mock';

expect.extend(matchers);

const mockProps = {
  nextStep: jest.fn(),
  formData: mockTokenFormData,
  dispatch: jest.fn(),
  address: 'cosmos1address',
};

describe('CreateDenom Component', () => {
  afterEach(cleanup);

  test('renders form with correct details', () => {
    renderWithChainProvider(<CreateDenom {...mockProps} />);
    expect(screen.getByText('Create Denom')).toBeInTheDocument();
    expect(screen.getByText('Token Sub Denom')).toBeInTheDocument();
  });

  test('updates subdenom input correctly', async () => {
    renderWithChainProvider(<CreateDenom {...mockProps} />);
    const subdenomInput = screen.getByPlaceholderText('udenom');
    fireEvent.change(subdenomInput, { target: { value: 'utest' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'subdenom',
        value: 'utest',
      });
    });
  });

  test('shows validation error for invalid subdenom', async () => {
    renderWithChainProvider(<CreateDenom {...mockProps} />);
    const subdenomInput = screen.getByPlaceholderText('udenom');
    fireEvent.change(subdenomInput, { target: { value: 'invalid' } });
    fireEvent.blur(subdenomInput);
    await waitFor(() => {
      expect(
        screen.getByText('Subdenom must start with u, a, q, or g, followed by letters and numbers')
      ).toBeInTheDocument();
    });
  });

  test('confirm button is disabled when inputs are invalid', async () => {
    renderWithChainProvider(<CreateDenom {...mockProps} />);
    const confirmButton = screen.getByText('Next: Token Metadata');
    const subdenomInput = screen.getByPlaceholderText('udenom');
    fireEvent.change(subdenomInput, { target: { value: 'invalid' } });
    await waitFor(() => {
      expect(confirmButton).toBeDisabled();
    });
  });

  test('confirm button is enabled when inputs are valid', async () => {
    renderWithChainProvider(<CreateDenom {...mockProps} />);
    const subdenomInput = screen.getByPlaceholderText('udenom');
    fireEvent.change(subdenomInput, { target: { value: 'utest' } });
    await waitFor(() => {
      const confirmButton = screen.getByText('Next: Token Metadata');
      expect(confirmButton).toBeEnabled();
    });
  });
});
