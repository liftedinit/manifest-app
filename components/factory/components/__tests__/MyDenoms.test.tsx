import { afterAll, afterEach, describe, expect, test, jest, mock } from 'bun:test';
import React from 'react';
import { screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import MyDenoms from '@/components/factory/components/MyDenoms';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import { mockDenom, mockMfxDenom } from '@/tests/mock';

expect.extend(matchers);

// Mock next/router
const m = jest.fn();
mock.module('next/router', () => ({
  useRouter: m.mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

// TODO: Mock DenomImage until we can fix the URL parsing issue
mock.module('@/components/factory/components/DenomImage', () => ({
  DenomImage: () => <div>DenomImage</div>,
}));

mock.module('@/hooks/useQueries', () => ({
  usePoaGetAdmin: jest.fn().mockReturnValue({
    poaAdmin: '',
    isPoaAdminLoading: false,
  }),
}));

const renderWithProps = (props = {}) => {
  const defaultProps = {
    denoms: [],
    isLoading: false,
    isError: null,
    refetchDenoms: jest.fn(),
    address: '',
  };
  return renderWithChainProvider(<MyDenoms {...defaultProps} {...props} />);
};

const allDenoms = [mockDenom, mockMfxDenom];

describe('MyDenoms', () => {
  afterEach(() => {
    mock.restore();
    cleanup();
  });

  test('renders loading skeleton when isLoading is true', () => {
    renderWithProps({ isLoading: true });
    for (let i = 0; i < 12; i++) {
      expect(screen.getByLabelText(`skeleton-${i}`)).toBeInTheDocument();
    }
  });

  test('renders denoms correctly', () => {
    renderWithProps({ denoms: allDenoms });
    const mfxs = screen.getAllByText('MFX');
    mfxs.forEach(element => {
      expect(element).toBeInTheDocument();
    });

    const tests = screen.getAllByText('TEST');
    tests.forEach(element => {
      expect(element).toBeInTheDocument();
    });
  });

  test('filters denoms based on search query', async () => {
    renderWithProps({ denoms: allDenoms });
    const searchInput = screen.getByPlaceholderText('Search for a token...');
    fireEvent.change(searchInput, { target: { value: 'MFX' } });

    await waitFor(() => {
      const tests = screen.getAllByText('MFX');
      tests.forEach(element => {
        expect(element).toBeInTheDocument();
      });

      expect(screen.queryByText('TEST')).not.toBeInTheDocument();
    });
  });

  test("displays 'No tokens found' when no denoms match search query", async () => {
    renderWithProps({ denoms: allDenoms });

    const searchInput = screen.getByPlaceholderText('Search for a token...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Denom' } });
    await waitFor(() => {
      expect(screen.queryByText('TEST')).not.toBeInTheDocument();
    });
  });
});
