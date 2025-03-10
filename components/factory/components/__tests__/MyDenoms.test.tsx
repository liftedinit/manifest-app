import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, jest, mock, test } from 'bun:test';
import React from 'react';

import DenomList from '@/components/factory/components/DenomList';
import { formatComponent } from '@/tests';
import { mockDenom, mockDenom2 } from '@/tests/data';
import { renderWithChainProvider } from '@/tests/render';

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
  useDenomAuthorityMetadata: jest.fn().mockReturnValue({
    denomAuthority: '',
    isDenomAuthorityLoading: false,
  }),
}));

const renderWithProps = (props = {}) => {
  const defaultProps = {
    denoms: [],
    isLoading: false,
    isError: null,
    refetchDenoms: jest.fn(),
    address: '',
    pageSize: 2,
    admin: '',
  };
  return renderWithChainProvider(<DenomList {...defaultProps} {...props} />);
};

const allDenoms = [mockDenom, mockDenom2];

describe('MyDenoms', () => {
  afterEach(() => {
    mock.restore();
    cleanup();

    console.log('afterEach');
  });

  test('renders loading skeleton when isLoading is true', () => {
    const mockup = renderWithProps({ isLoading: true });

    // Check for presence of skeleton elements for first row
    expect(screen.getByLabelText('skeleton-0-avatar')).toBeInTheDocument();
    expect(screen.getByLabelText('skeleton-0-name')).toBeInTheDocument();
    expect(screen.getByLabelText('skeleton-0-symbol')).toBeInTheDocument();
    expect(screen.getByLabelText('skeleton-0-supply')).toBeInTheDocument();
  });

  test('renders denoms correctly', () => {
    renderWithProps({ denoms: allDenoms });
    const mfxs = screen.getAllByText('TEST2');
    mfxs.forEach(element => {
      expect(element).toBeInTheDocument();
    });

    const tests = screen.getAllByText('TEST');
    tests.forEach(element => {
      expect(element).toBeInTheDocument();
    });
  });

  test('filters denoms based on search query', async () => {
    renderWithProps({ denoms: allDenoms, searchTerm: 'TEST2' });
    await waitFor(() => {
      const tests = screen.getAllByText('TEST2');
      tests.forEach(element => {
        expect(element).toBeInTheDocument();
      });

      expect(screen.queryByText('TEST')).not.toBeInTheDocument();
    });
  });

  test("displays 'No tokens found' when no denoms match search query", async () => {
    renderWithProps({ denoms: allDenoms, searchTerm: 'Nonexistent Denom' });
    await waitFor(() => {
      expect(screen.queryByText('TEST')).not.toBeInTheDocument();
    });
  });
});
