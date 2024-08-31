import { describe, test, afterEach, expect, jest, mock, afterAll } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import ProposalsForPolicy from '@/components/groups/components/groupProposals';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import { mockProposals, mockGroup, mockGroup2 } from '@/tests/mock';

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
  useVotesByProposal: jest.fn().mockReturnValue({
    votes: [],
    refetchVotes: jest.fn(),
  }),
}));

const mockProps = {
  policyAddress: 'test_policy_address',
};

describe('ProposalsForPolicy Component', () => {
  afterEach(() => {
    mock.restore();
    cleanup();
  });

  test('renders loading state correctly', () => {
    mock.module('@/hooks/useQueries', () => ({
      useProposalsByPolicyAccount: jest.fn().mockReturnValue({
        proposals: [],
        isProposalsLoading: true,
        isProposalsError: false,
        refetchProposals: jest.fn(),
      }),
    }));
    renderWithChainProvider(<ProposalsForPolicy {...mockProps} />);
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
  });

  test('renders error state correctly', () => {
    mock.module('@/hooks/useQueries', () => ({
      useProposalsByPolicyAccount: jest.fn().mockReturnValue({
        proposals: [],
        isProposalsLoading: false,
        isProposalsError: true,
        refetchProposals: jest.fn(),
      }),
    }));
    renderWithChainProvider(<ProposalsForPolicy {...mockProps} />);
    expect(screen.getByText('Error loading proposals')).toBeInTheDocument();
  });

  test('renders no proposals state correctly', () => {
    mock.module('@/hooks/useQueries', () => ({
      useProposalsByPolicyAccount: jest.fn().mockReturnValue({
        proposals: [],
        isProposalsLoading: false,
        isProposalsError: false,
        refetchProposals: jest.fn(),
      }),
    }));
    renderWithChainProvider(<ProposalsForPolicy {...mockProps} />);
    expect(screen.getByText('No proposals found for this policy')).toBeInTheDocument();
  });

  // // TODO: We need to rework how this component works.
  // test("renders proposals list correctly", () => {
  //   renderWithChainProvider(<ProposalsForPolicy {...mockProps} />);
  //   expect(screen.getByText("Proposals")).toBeInTheDocument();
  //   Object.keys(mockProposals).forEach((key) => {
  //     const proposals = mockProposals[key];
  //     proposals.forEach((proposal) => {
  //       expect(
  //         screen.getByText(`#${proposal.id.toString()}`),
  //       ).toBeInTheDocument();
  //       expect(
  //         screen.getByText(proposal.title.toLowerCase()),
  //       ).toBeInTheDocument();
  //     });
  //   });
  // });
});
