import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';

import ConfirmationForm from '@/components/factory/forms/ConfirmationForm';
import { clearAllMocks, mockModule, mockRouter } from '@/tests';
import { mockTokenFormData } from '@/tests/data';
import { renderWithChainProvider } from '@/tests/render';

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
  beforeEach(() => {
    mockRouter();
    mockModule('next/image', () => ({
      default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element,jsx-a11y/alt-text
        return <img alt="" {...props} />;
      },
    }));
  });

  afterEach(() => {
    cleanup();
    clearAllMocks();
  });

  test('renders form with correct details', () => {
    renderWithProps();
    expect(screen.getByText('Ticker')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.symbol)).toBeInTheDocument();

    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.description)).toBeInTheDocument();

    expect(screen.getByText('Logo')).toBeInTheDocument();
    expect(screen.getByText('✓ Valid image')).toBeInTheDocument();
  });
});
