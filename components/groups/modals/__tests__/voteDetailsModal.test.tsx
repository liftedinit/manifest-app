import { describe, test, expect, jest, mock, afterEach } from 'bun:test';
import React from 'react';
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import VoteDetailsModal from '../voteDetailsModal';
import matchers from '@testing-library/jest-dom/matchers';
import { renderWithChainProvider } from '@/tests/render';
import { mockMembers, mockProposals, mockTally, mockVotes } from '@/tests/mock';

expect.extend(matchers);

// Mock next/router
const m = jest.fn();
mock.module('next/router', () => ({
  useRouter: m.mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

mock.module('react-apexcharts', () => ({
  default: jest.fn(),
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
    showVoteModal: true,
    setShowVoteModal: jest.fn(),
    onClose: jest.fn(),
    modalId: 'voteDetailsModal',
    refetchVotes: jest.fn(),
    refetchTally: jest.fn(),
    refetchProposals: jest.fn(),
  };

  afterEach(() => {
    mock.restore();
    cleanup();
  });

  test('renders the component with provided props', () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    expect(screen.getByText(`#${mockProposal.id.toString()}`)).toBeInTheDocument();
    expect(screen.getByText(mockProposal.title)).toBeInTheDocument();
    expect(screen.getByText('SUMMARY')).toBeInTheDocument();
    expect(screen.getByText(mockProposal.summary)).toBeInTheDocument();
  });

  test('renders the tally chart', () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    expect(screen.getByLabelText('chart-tally')).toBeInTheDocument();
  });

  test('renders voting countdown timer', () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    expect(screen.getByLabelText('voting-countdown-1')).toBeInTheDocument();
    expect(screen.getByLabelText('voting-countdown-2')).toBeInTheDocument();
  });

  test('renders messages section with correct data', () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    expect(screen.getByText('MESSAGES')).toBeInTheDocument();
    expect(screen.getByLabelText('msg')).toBeInTheDocument();
    expect(screen.getByLabelText('message-json')).toBeInTheDocument();
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
    expect(screen.getByText('Execute')).toBeInTheDocument();
  });

  test('conditionally renders vote button when proposal is open and user has not voted', () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    expect(screen.getByText('Vote')).toBeInTheDocument();
  });

  test('does not render vote button when user has already voted', () => {
    const props = { ...defaultProps, votes: [{ ...mockVotes[0], voter: 'proposer1' }] };
    renderWithChainProvider(<VoteDetailsModal {...props} />);
    const btn = screen.getByLabelText('action-btn');
    expect(btn.textContent).not.toBe('Vote');
  });

  test('handles vote button click and opens voting modal', async () => {
    renderWithChainProvider(<VoteDetailsModal {...defaultProps} />);
    const voteButton = screen.getByText('Vote');
    fireEvent.click(voteButton);
    await waitFor(() => expect(screen.getByLabelText('vote-modal')).toBeInTheDocument());
  });
});
