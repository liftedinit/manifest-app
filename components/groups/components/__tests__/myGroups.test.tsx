import { describe, test, afterEach, expect, jest, mock } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import { YourGroups } from '@/components/groups/components/myGroups';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import { mockGroup, mockGroup2 } from '@/tests/mock';

expect.extend(matchers);

// Mock next/router
mock.module('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

// Mock useQueries hooks
mock.module('@/hooks/useQueries', () => ({
  useGroupsByMember: jest.fn().mockReturnValue({
    groupByMemberData: { groups: [mockGroup, mockGroup2] },
    isGroupByMemberLoading: false,
    isGroupByMemberError: false,
    refetchGroupByMember: jest.fn(),
  }),
  useBalance: jest.fn().mockReturnValue({
    balance: { amount: '1000000' },
    isBalanceLoading: false,
    isBalanceError: false,
  }),
  useGetFilteredTxAndSuccessfulProposals: jest.fn().mockReturnValue({
    sendTxs: [],
    totalPages: 1,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

mock.module('@/hooks/useIsMobile', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(false),
}));

const mockProps = {
  groups: {
    groups: [
      {
        id: '1',
        metadata:
          '{"title":"title1","authors":"author1","summary":"summary1","details":"details1"}',
        policies: [{ address: 'policy1', decision_policy: { threshold: '1' } }],
        admin: 'admin1',
        members: [{ member: { address: 'member1' } }],
        total_weight: '1',
      },
    ],
  },
  proposals: { policy1: [] },
  isLoading: false,
};

const mockPropsWithManyGroups = {
  groups: {
    groups: Array(12)
      .fill(null)
      .map((_, index) => ({
        id: `${index + 1}`,
        policies: [{ address: `policy${index + 1}`, decision_policy: { threshold: '1' } }],
        admin: `admin${index + 1}`,
        members: [{ member: { address: `member${index + 1}` } }],
        total_weight: '1',
      })),
  },
  proposals: {},
  isLoading: false,
};

describe('Groups Component', () => {
  afterEach(() => {
    mock.restore();
    cleanup();
  });

  test('renders empty group state correctly', () => {
    renderWithChainProvider(<YourGroups {...{ ...mockProps, groups: { groups: [] } }} />);
    expect(screen.getByText('Groups')).toBeInTheDocument();
  });

  test('renders loading state correctly', () => {
    renderWithChainProvider(<YourGroups {...{ ...mockProps, isLoading: true }} />);
    expect(screen.getAllByTestId('skeleton-row')[0]).toBeInTheDocument();
  });

  test('search functionality works correctly', () => {
    renderWithChainProvider(<YourGroups {...mockProps} />);
    const searchInput = screen.getByPlaceholderText('Search for a group...');
    fireEvent.change(searchInput, { target: { value: 'title1' } });
    // Use getAllByRole to find the specific row with the aria-label
    const groupRows = screen.getAllByRole('button', { name: /Select title1 group/i });
    expect(groupRows).toHaveLength(1);
  });

  test('group selection works correctly', () => {
    renderWithChainProvider(<YourGroups {...mockProps} />);
    // Use getAllByRole to find the specific row with the aria-label
    const groupRow = screen.getAllByRole('button', { name: /Select title1 group/i })[0];
    fireEvent.click(groupRow);
    // Verify that router.push was called with the correct arguments
    const router = require('next/router').useRouter();
    expect(router.push).toHaveBeenCalledWith(
      expect.stringContaining('/groups?policyAddress=policy1'),
      undefined,
      { shallow: true }
    );
  });

  describe('Pagination', () => {
    test('renders pagination controls when there are more items than page size', () => {
      renderWithChainProvider(<YourGroups {...mockPropsWithManyGroups} />);

      expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    });

    test('pagination controls navigate between pages correctly', () => {
      renderWithChainProvider(<YourGroups {...mockPropsWithManyGroups} />);

      // Should start with page 1
      expect(screen.getByRole('button', { name: 'Page 1', current: 'page' })).toBeInTheDocument();

      // Click next page
      fireEvent.click(screen.getByRole('button', { name: /next page/i }));
      expect(screen.getByRole('button', { name: 'Page 2', current: 'page' })).toBeInTheDocument();

      // Click previous page
      fireEvent.click(screen.getByRole('button', { name: /previous page/i }));
      expect(screen.getByRole('button', { name: 'Page 1', current: 'page' })).toBeInTheDocument();
    });

    test('previous button is disabled on first page', () => {
      renderWithChainProvider(<YourGroups {...mockPropsWithManyGroups} />);

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      expect(prevButton).toBeDisabled();
    });

    test('next button is disabled on last page', () => {
      renderWithChainProvider(<YourGroups {...mockPropsWithManyGroups} />);

      // Navigate to last page
      const totalPages = Math.ceil(mockPropsWithManyGroups.groups.groups.length / 8);
      for (let i = 1; i < totalPages; i++) {
        fireEvent.click(screen.getByRole('button', { name: /next page/i }));
      }

      const nextButton = screen.getByRole('button', { name: /next page/i });
      expect(nextButton).toBeDisabled();
    });

    test('direct page selection works correctly', () => {
      renderWithChainProvider(<YourGroups {...mockPropsWithManyGroups} />);

      // Click page 2 button
      fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
      expect(screen.getByRole('button', { name: 'Page 2', current: 'page' })).toBeInTheDocument();
    });

    test('shows correct number of items per page', () => {
      renderWithChainProvider(<YourGroups {...mockPropsWithManyGroups} />);

      // On desktop (non-mobile), should show 8 items per page
      const groupRows = screen.getAllByRole('button', { name: /Select .+? group/i });
      expect(groupRows).toHaveLength(8);
    });
  });
});
