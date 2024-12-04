import { describe, test, afterEach, expect } from 'bun:test';
import React from 'react';
import { screen, cleanup } from '@testing-library/react';
import Success from '@/components/factory/forms/Success';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import { mockTokenFormData } from '@/tests/mock';

expect.extend(matchers);

const mockProps = {
  formData: mockTokenFormData,
  address: 'cosmos1address',
};

describe('Success Component', () => {
  afterEach(cleanup);

  test('renders component with correct details', () => {
    renderWithChainProvider(<Success {...mockProps} />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(
      screen.getByText('Your token was successfully created and the metadata was set.')
    ).toBeInTheDocument();
    expect(screen.getByText('The full denom of your token is:')).toBeInTheDocument();
    expect(screen.getByText('Token Details')).toBeInTheDocument();
  });

  test('displays token details correctly', () => {
    renderWithChainProvider(<Success {...mockProps} />);
    expect(screen.getByText('NAME')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.name)).toBeInTheDocument();
    expect(screen.getByText('SYMBOL')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.symbol)).toBeInTheDocument();
    expect(screen.getByText('DESCRIPTION')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.description)).toBeInTheDocument();
  });
});
