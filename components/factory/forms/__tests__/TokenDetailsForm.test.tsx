import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';

import TokenDetailsForm from '@/components/factory/forms/TokenDetailsForm';
import { mockTokenFormData } from '@/tests/mock';
import { renderWithChainProvider } from '@/tests/render';

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
    expect(screen.getByLabelText('Ticker')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Logo URL')).toBeInTheDocument();
  });

  test('updates form fields correctly', async () => {
    renderWithChainProvider(<TokenDetailsForm {...mockProps} />);

    const tickerInput = screen.getByLabelText('Ticker');
    fireEvent.change(tickerInput, { target: { value: 'FOOBAR' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'display',
        value: 'FOOBAR',
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

    const descriptionInput = screen.getByLabelText('Description');
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'description',
        value: 'New Description',
      });
    });

    const logoUriInput = screen.getByLabelText('Logo URL');
    fireEvent.change(logoUriInput, { target: { value: 'http://newuri.com' } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FIELD',
        field: 'uri',
        value: 'http://newuri.com',
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
