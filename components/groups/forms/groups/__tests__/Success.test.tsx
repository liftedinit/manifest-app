import { describe, test, afterEach, expect, jest } from 'bun:test';
import React from 'react';
import { screen, cleanup, getDefaultNormalizer } from '@testing-library/react';
import Success from '@/components/groups/forms/groups/Success';
import matchers from '@testing-library/jest-dom/matchers';
import { mockGroupFormData } from '@/tests/mock';
import { renderWithChainProvider } from '@/tests/render';

expect.extend(matchers);

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
    expect(screen.getByText('manifest1autho...author')).toBeInTheDocument();
    expect(screen.getByText('manifest1efd63...m6rp3z')).toBeInTheDocument();
    expect(screen.getByText('manifest1hj5fv...8ws9ct')).toBeInTheDocument();
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
