import {
  ProposalExecutorResult,
  ProposalStatus,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, jest, mock, spyOn, test } from 'bun:test';
import React from 'react';

import { mockMembers, mockProposals, mockTally, mockVotes } from '@/tests/mock';
import { renderWithChainProvider } from '@/tests/render';

import VoteDetailsModal from '../voteDetailsModal';

// Mock next/router
const m = jest.fn();
mock.module('next/router', () => ({
  useRouter: m.mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

mock.module('@cosmos-kit/react', () => ({
  useChain: jest.fn().mockReturnValue({
    address: mockProposals['test_policy_address'][0].proposers[0],
    chain: { fees: null },
  }),
}));

const defaultUseProposalById = {
  proposal: mockProposals['test_policy_address'][0],
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
};

const defaultUseTallyCount = {
  tally: mockTally,
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
};

const defaultUseVotesByProposal = {
  votes: mockVotes,
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
};

mock.module('@/hooks', () => ({
  useProposalById: jest.fn().mockReturnValue(defaultUseProposalById),
  useTallyCount: jest.fn().mockReturnValue(defaultUseTallyCount),
  useVotesByProposal: jest.fn().mockReturnValue(defaultUseVotesByProposal),
}));

const mockProposal = mockProposals['test_policy_address'][0];

describe('VoteDetailsModal', () => {
  const defaultProps = {
    policyAddress: 'test_policy_address',
    proposals: mockProposals['test_policy_address'],
    proposalId: 1n,
    showVoteModal: true,
    onClose: jest.fn(),
  };

  afterEach(() => {
    mock.restore();
    cleanup();
  });

  test('renders the component with provided props', () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    expect(screen.getByText(`#${mockProposal.id.toString()}`)).toBeInTheDocument();
    expect(screen.getByText(mockProposal.title)).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText(mockProposal.summary)).toBeInTheDocument();
  });

  test('renders the tally chart', () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    expect(screen.getByLabelText('chart-tally')).toBeInTheDocument();
  });

  test('renders voting countdown timer', () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    expect(screen.getByLabelText('countdown-timer')).toBeInTheDocument();
  });

  test('renders copy proposal button', () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    expect(screen.getByLabelText('copy-button')).toBeInTheDocument();
  });

  test('renders expanded messages modal', () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('expand-messages'));
    expect(screen.getByText('Proposal Messages')).toBeInTheDocument();
  });

  test('do not render expanded tally button when there are no votes', () => {
    const spy = spyOn(require('@/hooks'), 'useVotesByProposal').mockImplementation(() => ({
      votes: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    }));
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    expect(screen.queryByTestId('expand-tally')).not.toBeInTheDocument();
    spy.mockImplementation(jest.fn().mockReturnValue(defaultUseVotesByProposal));
  });

  test('conditionally renders execute button when proposal is accepted', () => {
    const spy = spyOn(require('@/hooks'), 'useProposalById').mockImplementation(() => ({
      proposal: { ...mockProposal, status: ProposalStatus.PROPOSAL_STATUS_ACCEPTED },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    }));
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    expect(screen.getByText('Execute')).toBeInTheDocument();
    spy.mockImplementation(jest.fn().mockReturnValue(defaultUseProposalById));
  });

  test('conditionally renders vote button when proposal is open and user has not voted', () => {
    const spy = spyOn(require('@/hooks'), 'useVotesByProposal').mockImplementation(() => ({
      votes: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    }));
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    const voteButton = screen.getByText('Vote');
    expect(voteButton).toBeInTheDocument();
    expect(voteButton.innerText).toBe('Vote');
    spy.mockImplementation(jest.fn().mockReturnValue(defaultUseVotesByProposal));
  });

  test('conditionally renders withdraw button when user is proposer and has not voted', () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    const withdrawButton = screen.getByText('Withdraw');
    expect(withdrawButton).toBeInTheDocument();
  });

  test('does not render withdraw button when user is not the proposer', () => {
    const spy = spyOn(require('@/hooks'), 'useProposalById').mockImplementation(() => ({
      proposal: { ...mockProposal, proposers: ['random_address'] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    }));
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    const withdrawButton = screen.queryByText('Withdraw');
    expect(withdrawButton).not.toBeInTheDocument();
    spy.mockImplementation(jest.fn().mockReturnValue(defaultUseProposalById));
  });

  test('conditionally renders re-execute button when proposal has failed', () => {
    const spy = spyOn(require('@/hooks'), 'useProposalById').mockImplementation(() => ({
      proposal: {
        ...mockProposal,
        status: ProposalStatus.PROPOSAL_STATUS_ACCEPTED,
        executor_result: ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_FAILURE,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    }));
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    expect(screen.getByText('Re-execute')).toBeInTheDocument();
    spy.mockImplementation(jest.fn().mockReturnValue(defaultUseProposalById));
  });

  test('does not render vote button when user has already voted', () => {
    const spy = spyOn(require('@/hooks'), 'useVotesByProposal').mockImplementation(() => ({
      votes: [{ ...mockVotes[0], voter: 'proposer1' }],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    }));

    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    const voteButton = screen.queryByText('Vote');
    expect(voteButton).not.toBeInTheDocument();
    spy.mockImplementation(jest.fn().mockReturnValue(defaultUseVotesByProposal));
  });

  test('handles vote button click and opens voting modal', async () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    const voteButton = screen.getByText('Vote');
    fireEvent.click(voteButton);
    await waitFor(() => expect(screen.getByLabelText('vote-modal')).toBeInTheDocument());
  });
});
