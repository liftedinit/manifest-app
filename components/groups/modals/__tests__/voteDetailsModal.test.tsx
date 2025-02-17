import { describe, test, expect, jest, mock, afterEach } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import VoteDetailsModal from '../voteDetailsModal';
import { renderWithChainProvider } from '@/tests/render';
import { mockMembers, mockProposals, mockTally, mockVotes } from '@/tests/mock';

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

const mockProposal = mockProposals['test_policy_address'][0];

describe('VoteDetailsModal', () => {
  const defaultProps = {
    tallies: mockTally,
    votes: mockVotes,
    members: mockMembers,
    proposal: mockProposal,
    group: {} as any,
    showVoteModal: true,
    onClose: jest.fn(),
    modalId: 'voteDetailsModal',
    refetchVotes: jest.fn(),
    refetchTally: jest.fn(),
    refetchProposals: jest.fn(),
    refetchGroupInfo: jest.fn(),
    refetchDenoms: jest.fn(),
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

  test('renders messages section with correct data', () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('expand-messages'));
    expect(screen.getByText('Proposal Messages')).toBeInTheDocument();
  });

  test('conditionally renders execute button when proposal is accepted', () => {
    const props = {
      ...defaultProps,
      proposal: {
        ...mockProposal,
        status: 'PROPOSAL_STATUS_ACCEPTED',
        executor_result: 'PROPOSAL_EXECUTOR_RESULT_NOT_RUN',
      },
    };
    renderWithChainProvider(<VoteDetailsModal {...props} />);
    expect(screen.getByText('execute')).toBeInTheDocument();
  });

  test('conditionally renders vote button when proposal is open and user has not voted', () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    const voteButton = screen.getByText('vote');
    expect(voteButton).toBeInTheDocument();
    expect(voteButton.innerText).toBe('vote');
  });

  test('does not render vote button when user has already voted', () => {
    const props = { ...defaultProps, votes: [{ ...mockVotes[0], voter: 'proposer1' }] };
    renderWithChainProvider(<VoteDetailsModal {...props} />);
    const voteButton = screen.queryByText('vote');
    expect(voteButton).not.toBeInTheDocument();
  });

  test('handles vote button click and opens voting modal', async () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    const voteButton = screen.getByText('vote');
    fireEvent.click(voteButton);
    await waitFor(() => expect(screen.getByLabelText('vote-modal')).toBeInTheDocument());
  });
});
