import {
  ProposalExecutorResult,
  proposalExecutorResultFromJSON,
  ProposalSDKType,
  ProposalStatus,
  proposalStatusFromJSON,
  VoteOption,
  voteOptionFromJSON,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import React from 'react';

export function getProposalButton(
  proposal: ProposalSDKType,
  executeWithdrawal: () => void,
  executeProposal: () => void,
  setShowVotingPopup: (value: boolean) => void,
  userVoteOption?: VoteOption | undefined
): JSX.Element | undefined {
  switch (proposalExecutorResultFromJSON(proposal.executor_result)) {
    case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN:
      switch (proposalStatusFromJSON(proposal.status)) {
        case ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED:
        case ProposalStatus.PROPOSAL_STATUS_REJECTED:
        case ProposalStatus.PROPOSAL_STATUS_ABORTED:
        case ProposalStatus.PROPOSAL_STATUS_WITHDRAWN:
        default:
          return undefined;
        case ProposalStatus.PROPOSAL_STATUS_SUBMITTED:
          return (
            <div className="flex flex-row items-center justify-center gap-2">
              <button
                className={`btn btn-error text-white rounded-[12px] ${userVoteOption ? 'w-full' : 'w-1/2'}`}
                onClick={executeWithdrawal}
              >
                withdraw
              </button>
              {!userVoteOption && (
                <button
                  className="btn btn-gradient text-white rounded-[12px] w-1/2"
                  onClick={() => setShowVotingPopup(true)}
                >
                  vote
                </button>
              )}
            </div>
          );
        case ProposalStatus.PROPOSAL_STATUS_ACCEPTED:
          return (
            <button
              className="btn btn-gradient text-white rounded-[12px] w-full"
              onClick={executeProposal}
            >
              execute
            </button>
          );
      }
    case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_FAILURE:
      return (
        <button
          className="btn w-full btn-gradient text-white rounded-[12px]"
          onClick={executeProposal}
        >
          re-execute
        </button>
      );
    case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_SUCCESS:
    default:
      return undefined;
  }
}

export function getProposalStatusLabel(proposal: ProposalSDKType): string {
  switch (proposalExecutorResultFromJSON(proposal.executor_result)) {
    case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN:
      switch (proposalStatusFromJSON(proposal.status)) {
        case ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED:
          return 'unspecified';
        case ProposalStatus.PROPOSAL_STATUS_SUBMITTED:
          return 'voting';
        case ProposalStatus.PROPOSAL_STATUS_ACCEPTED:
          return 'accepted';
        case ProposalStatus.PROPOSAL_STATUS_WITHDRAWN:
          return 'withdrawn';
        case ProposalStatus.PROPOSAL_STATUS_REJECTED:
          return 'rejected';
        case ProposalStatus.PROPOSAL_STATUS_ABORTED:
          return 'aborted';
        default:
          return 'unknown';
      }
    case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_SUCCESS:
      return 'success';
    case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_FAILURE:
      return 'failure';
    default:
      return 'unknown';
  }
}

export function getVoteOptionLabel(option: VoteOption): string {
  switch (voteOptionFromJSON(option)) {
    case VoteOption.VOTE_OPTION_UNSPECIFIED:
      return 'unspecified';
    case VoteOption.VOTE_OPTION_YES:
      return 'yes';
    case VoteOption.VOTE_OPTION_NO:
      return 'no';
    case VoteOption.VOTE_OPTION_ABSTAIN:
      return 'abstain';
    case VoteOption.VOTE_OPTION_NO_WITH_VETO:
      return 'veto';
    case VoteOption.UNRECOGNIZED:
    default:
      return 'unknown';
  }
}

export function getVoteOptionBadgeColor(option?: VoteOption): string {
  switch (voteOptionFromJSON(option)) {
    case VoteOption.VOTE_OPTION_YES:
      return 'bg-success';
    case VoteOption.VOTE_OPTION_NO:
      return 'bg-error';
    case VoteOption.VOTE_OPTION_ABSTAIN:
      return 'bg-info';
    case VoteOption.VOTE_OPTION_NO_WITH_VETO:
      return 'bg-warning';
    case VoteOption.UNRECOGNIZED:
    case VoteOption.VOTE_OPTION_UNSPECIFIED:
    default:
      return 'bg-gray-400';
  }
}
