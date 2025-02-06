import {
  ProposalExecutorResult,
  ProposalSDKType,
  ProposalStatus,
  proposalStatusFromJSON,
  proposalExecutorResultFromJSON,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';

export function getProposalStatusLabel(proposal: ProposalSDKType): string {
  switch (proposalExecutorResultFromJSON(proposal.executor_result)) {
    case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN:
      switch (proposalStatusFromJSON(proposal.status)) {
        case ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED:
          return 'unspecified';
        case ProposalStatus.PROPOSAL_STATUS_SUBMITTED:
          return 'submitted';
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

export function getProposalButton(proposal: ProposalSDKType): JSX.Element | undefined {
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
            <button className="btn w-full btn-gradient text-white rounded-[12px]">vote</button>
          );
        case ProposalStatus.PROPOSAL_STATUS_ACCEPTED:
          return (
            <div className="flex flex-row items-center justify-center gap-2">
              <button className="btn btn-error text-white rounded-[12px] w-1/2">withdraw</button>
              <button className="btn btn-gradient text-white rounded-[12px] w-1/2">execute</button>
            </div>
          );
      }
    case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_FAILURE:
      return (
        <button className="btn w-full btn-gradient text-white rounded-[12px]">re-execute</button>
      );
    case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_SUCCESS:
    default:
      return undefined;
  }
}
