import { describe, test, afterEach, expect, jest, mock, beforeEach } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
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
}));

const mockProps = {
  groups: {
    groups: [
      {
        id: '1',
        ipfsMetadata: { title: 'title1' },
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

describe('YourGroups Component', () => {
  afterEach(() => {
    mock.restore();
    cleanup();
  });

  test('renders empty group state correctly', () => {
    renderWithChainProvider(<YourGroups {...{ ...mockProps, groups: { groups: [] } }} />);
    expect(screen.getByText('My groups')).toBeInTheDocument();
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
});
