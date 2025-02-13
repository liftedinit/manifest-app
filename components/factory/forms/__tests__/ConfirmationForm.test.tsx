import { afterEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import ConfirmationForm from '@/components/factory/forms/ConfirmationForm';
import { renderWithChainProvider } from '@/tests/render';
import { mockTokenFormData } from '@/tests/mock';

function renderWithProps(props = {}) {
  const mockProps = {
    nextStep: jest.fn(),
    prevStep: jest.fn(),
    formData: mockTokenFormData,
    address: 'cosmos1address',
  };

  return renderWithChainProvider(<ConfirmationForm {...mockProps} {...props} />);
}

describe('ConfirmationForm Component', () => {
  afterEach(cleanup);

  test('renders form with correct details', () => {
    renderWithProps();
    expect(screen.getByText('Ticker')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.symbol)).toBeInTheDocument();

    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.description)).toBeInTheDocument();

    expect(screen.getByText('Logo URL')).toBeInTheDocument();
    expect(screen.getByText(`${mockTokenFormData.uri}`)).toBeInTheDocument();
  });
});
