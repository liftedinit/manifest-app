import { cleanup, getDefaultNormalizer, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';
import React from 'react';

import Success from '@/components/groups/forms/groups/Success';
import { clearAllMocks, mockRouter } from '@/tests';
import { mockGroupFormData } from '@/tests/data';
import { renderWithChainProvider } from '@/tests/render';

const mockProps = {
  formData: mockGroupFormData,
  prevStep: jest.fn(),
};

describe('Success Component', () => {
  beforeEach(() => {
    mockRouter();
  });

  afterEach(() => {
    cleanup();
    clearAllMocks();
  });

  test('renders component with correct details', () => {
    renderWithChainProvider(<Success {...mockProps} />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(
      screen.getByText('Your transaction was successfully signed and broadcasted.')
    ).toBeInTheDocument();
    expect(screen.getByText('Group Information')).toBeInTheDocument();

    // 'manifest1author' is short enough that it doesn't get truncated
    expect(screen.getByText('manifest1author')).toBeInTheDocument();

    // Member addresses use the new middle truncation format:
    // manifestAddr2 = 'manifest1efd63aw40lxf3n4mhf7dzhjkr453axurm6rp3z' -> 'manifest1efd6...rp3z'
    expect(screen.getByText('manifest1efd6...rp3z')).toBeInTheDocument();
    // manifestAddr1 = 'manifest1hj5fveer5cjtn4wd6wstzugjfdxzl0xp8ws9ct' -> 'manifest1hj5f...s9ct'
    expect(screen.getByText('manifest1hj5f...s9ct')).toBeInTheDocument();

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
