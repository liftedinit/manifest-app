import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, jest, mock, test } from 'bun:test';
import React from 'react';

import GroupProposals from '@/components/groups/components/groupControls';
import { clearAllMocks, mockModule, mockRouter } from '@/tests';
import { mockGroup, mockGroup2, mockProposals } from '@/tests/data';
import { renderWithChainProvider } from '@/tests/render';

const mockProps = {
  group: {
    policies: [
      {
        address: 'test_policy_address',
        title: 'Test Policy',
        description: 'Test Policy Description',
      },
    ],
  },
  isLoading: false,
};

describe('ProposalsForPolicy Component', () => {
  beforeEach(() => {
    mockRouter();

    // Mock useQueries hooks
    mockModule('@/hooks/useQueries', () => ({
      useGroupsByMember: jest.fn().mockReturnValue({
        groupByMemberData: { groups: [mockGroup, mockGroup2] },
        isGroupByMemberLoading: false,
        isGroupByMemberError: false,
        refetchGroupByMember: jest.fn(),
      }),
      useProposalsByPolicyAccount: jest.fn().mockReturnValue({
        proposals: mockProposals['test_policy_address'],
        isProposalsLoading: false,
        isProposalsError: false,
        refetchProposals: jest.fn(),
      }),
      useTallyCount: jest.fn().mockReturnValue({
        tally: {
          tally: {
            yes_count: '10',
            no_count: '5',
            abstain_count: '2',
            no_with_veto_count: '1',
          },
        },
        isTallyLoading: false,
        isTallyError: false,
        refetchTally: jest.fn(),
      }),
      useMultipleTallyCounts: jest.fn().mockReturnValue({
        tallies: [
          { proposalId: 1n, tally: undefined },
          { proposalId: 2n, tally: undefined },
        ],
        isTalliesLoading: false,
        isTalliesError: false,
        refetchTallies: jest.fn(),
      }),
      useVotesByProposal: jest.fn().mockReturnValue({
        votes: [],
        refetchVotes: jest.fn(),
      }),
    }));
  });
  afterEach(() => {
    clearAllMocks();
    cleanup();
  });

  test('renders loading state correctly', () => {
    mockModule.force('@/hooks/useQueries', () => ({
      useProposalsByPolicyAccount: jest.fn().mockReturnValue({
        proposals: [],
        isProposalsLoading: true,
        isProposalsError: false,
        refetchProposals: jest.fn(),
      }),
    }));
    renderWithChainProvider(<GroupProposals {...mockProps} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('renders error state correctly', () => {
    mockModule.force('@/hooks/useQueries', () => ({
      useProposalsByPolicyAccount: jest.fn().mockReturnValue({
        proposals: [],
        isProposalsLoading: false,
        isProposalsError: true,
        refetchProposals: jest.fn(),
      }),
    }));
    renderWithChainProvider(<GroupProposals {...mockProps} />);
    expect(screen.getByText('Error loading proposals')).toBeInTheDocument();
  });

  test('renders no proposals state correctly', () => {
    mockModule.force('@/hooks/useQueries', () => ({
      useProposalsByPolicyAccount: jest.fn().mockReturnValue({
        proposals: [],
        isProposalsLoading: false,
        isProposalsError: false,
        refetchProposals: jest.fn(),
      }),
    }));
    renderWithChainProvider(<GroupProposals {...mockProps} />);
    expect(screen.getByText('No proposal was found.')).toBeInTheDocument();
  });

  test('renders proposals list correctly', () => {
    mockModule.force('@/hooks/useQueries', () => ({
      useProposalsByPolicyAccount: jest.fn().mockReturnValue({
        proposals: mockProposals['test_policy_address'],
        isProposalsLoading: false,
        isProposalsError: false,
        refetchProposals: jest.fn(),
      }),
    }));
    renderWithChainProvider(<GroupProposals {...mockProps} />);
    expect(screen.getByText('Proposals')).toBeInTheDocument();
    const proposals = mockProposals['test_policy_address'];
    proposals.forEach(proposal => {
      expect(screen.getByText(proposal.title.toLowerCase())).toBeInTheDocument();
    });
  });
});
