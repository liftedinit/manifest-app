import { afterEach, describe, expect, test, jest, mock } from 'bun:test';
import React from 'react';
import { screen, cleanup, fireEvent } from '@testing-library/react';
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

const renderWithProps = (props = {}) => {
  const defaultProps = {
    denoms: [],
    isLoading: false,
    isError: null,
    refetchDenoms: jest.fn(),
    onSelectDenom: jest.fn(),
  };
  return renderWithChainProvider(<MyDenoms {...defaultProps} {...props} />);
};

const allDenoms = [mockDenom, mockMfxDenom];

describe('MyDenoms', () => {
  afterEach(cleanup);

  test('renders loading skeleton when isLoading is true', () => {
    renderWithProps({ isLoading: true });
    expect(screen.getByLabelText('skeleton')).toBeInTheDocument();
  });

  test('renders and selects denoms correctly', () => {
    const onSelectDenom = jest.fn();
    renderWithProps({ denoms: allDenoms, onSelectDenom });

    const denom1 = screen.getByText('TEST');
    fireEvent.click(denom1);
    expect(onSelectDenom).toHaveBeenCalledWith(mockDenom);
  });

  test('filters denoms based on search query', () => {
    renderWithProps({ denoms: allDenoms });

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'TEST' } });
    expect(screen.getByText('TEST')).toBeInTheDocument();
    expect(screen.queryByText('MFX')).not.toBeInTheDocument();
  });

  test("displays 'No tokens found' when no denoms match search query", () => {
    renderWithProps({ denoms: allDenoms });

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Denom' } });
    expect(screen.getByText('No tokens found')).toBeInTheDocument();
  });
});
