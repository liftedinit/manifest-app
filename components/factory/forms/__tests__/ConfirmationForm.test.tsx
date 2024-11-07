import { afterEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import ConfirmationForm from '@/components/factory/forms/ConfirmationForm';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import { mockTokenFormData } from '@/tests/mock';

expect.extend(matchers);

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

  // TODO: Fix hardcoded values in component
  test('renders form with correct details', () => {
    renderWithProps();
    expect(screen.getByText('Token Information')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.name)).toBeInTheDocument();

    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.symbol)).toBeInTheDocument();

    expect(screen.getByText('Subdenom')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.subdenom)).toBeInTheDocument();

    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.description)).toBeInTheDocument();

    expect(screen.getByText('Denom Units')).toBeInTheDocument();
    expect(screen.getByText('Base Denom')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.denomUnits[0].denom)).toBeInTheDocument();

    expect(screen.getByText('Display Denom')).toBeInTheDocument();
    expect(screen.getByText(`${mockTokenFormData.subdenom}`)).toBeInTheDocument();
  });

  // TODO: Fix advanced details in component
  test('toggles advanced details correctly', () => {
    renderWithProps();
    const toggleButton = screen.getByText('Advanced Details');
    fireEvent.click(toggleButton);

    expect(screen.getByText('URI')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.uri)).toBeInTheDocument();

    expect(screen.getByText('URI Hash')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.uriHash)).toBeInTheDocument();
  });
});
