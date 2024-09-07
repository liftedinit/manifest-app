import { describe, test, afterEach, expect, jest } from 'bun:test';
import React from 'react';
import { screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import TokenDetailsForm from '@/components/factory/forms/TokenDetailsForm';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import { mockTokenFormData } from '@/tests/mock';

expect.extend(matchers);

const mockProps = {
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  formData: mockTokenFormData,
  dispatch: jest.fn(),
  address: 'cosmos1address',
};

describe('TokenDetailsForm Component', () => {
  afterEach(cleanup);

  test('renders form with correct details', () => {
    renderWithChainProvider(<TokenDetailsForm {...mockProps} />);
    expect(screen.getByLabelText('Subdenom')).toBeInTheDocument();
    expect(screen.getByLabelText('Display')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Symbol')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('URI')).toBeInTheDocument();
    expect(screen.getByLabelText('URI Hash')).toBeInTheDocument();
  });

  test('updates form fields correctly', async () => {
    renderWithChainProvider(<TokenDetailsForm {...mockProps} />);

    const displayInput = screen.getByLabelText('Display');
    fireEvent.change(displayInput, { target: { value: 'New Display' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'display',
        value: 'New Display',
      });
    });

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'name',
        value: 'New Name',
      });
    });

    const symbolInput = screen.getByLabelText('Symbol');
    fireEvent.change(symbolInput, { target: { value: 'NS' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'symbol',
        value: 'NS',
      });
    });

    const descriptionInput = screen.getByLabelText('Description');
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'description',
        value: 'New Description',
      });
    });

    const uriInput = screen.getByLabelText('URI');
    fireEvent.change(uriInput, { target: { value: 'http://newuri.com' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'uri',
        value: 'http://newuri.com',
      });
    });

    const uriHashInput = screen.getByLabelText('URI Hash');
    fireEvent.change(uriHashInput, { target: { value: 'newurihash' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'uriHash',
        value: 'newurihash',
      });
    });
  });

  test('next button is enabled when form is valid', async () => {
    renderWithChainProvider(<TokenDetailsForm {...mockProps} />);
    const nextButton = screen.getByText('Next: Confirmation');
    await waitFor(() => {
      expect(nextButton).toBeEnabled();
    });
  });
});
