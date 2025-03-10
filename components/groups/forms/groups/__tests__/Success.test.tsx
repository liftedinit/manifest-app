import { cleanup, getDefaultNormalizer, screen } from '@testing-library/react';
import { afterEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';

import Success from '@/components/groups/forms/groups/Success';
import { mockGroupFormData } from '@/tests/data';
import { renderWithChainProvider } from '@/tests/render';

const mockProps = {
  formData: mockGroupFormData,
  prevStep: jest.fn(),
};

describe('Success Component', () => {
  afterEach(cleanup);

  test('renders component with correct details', () => {
    renderWithChainProvider(<Success {...mockProps} />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(
      screen.getByText('Your transaction was successfully signed and broadcasted.')
    ).toBeInTheDocument();
    expect(screen.getByText('Group Information')).toBeInTheDocument();
    expect(screen.getByText('manifest1autho...')).toBeInTheDocument();
    expect(screen.getByText('manifest1efd63...')).toBeInTheDocument();
    expect(screen.getByText('manifest1hj5fv...')).toBeInTheDocument();
    const normalizer = getDefaultNormalizer({ collapseWhitespace: true, trim: true });
    expect(screen.getByText('2 / 2', { normalizer })).toBeInTheDocument();
  });

  test('renders Back to Groups Page button', () => {
    renderWithChainProvider(<Success {...mockProps} />);
    const button = screen.getByText('Back to Groups Page');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });
});
