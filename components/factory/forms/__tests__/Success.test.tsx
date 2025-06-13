import { cleanup, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import React from 'react';

import Success from '@/components/factory/forms/Success';
import { clearAllMocks, mockModule, mockRouter } from '@/tests';
import { mockTokenFormData } from '@/tests/data';
import { renderWithChainProvider } from '@/tests/render';

const mockProps = {
  formData: mockTokenFormData,
  address: 'cosmos1address',
};

describe('Success Component', () => {
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
    clearAllMocks();
    cleanup();
  });

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
    expect(screen.getByText('TICKER')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.display)).toBeInTheDocument();
    expect(screen.getByText('DESCRIPTION')).toBeInTheDocument();
    expect(screen.getByText(mockTokenFormData.description)).toBeInTheDocument();
  });
});
