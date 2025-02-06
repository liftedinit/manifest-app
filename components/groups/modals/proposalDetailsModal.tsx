import { QueryTallyResultResponseSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/query';
import {
  ProposalExecutorResult,
  proposalExecutorResultFromJSON,
  ProposalSDKType,
  ProposalStatus,
  proposalStatusFromJSON,
  VoteSDKType,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { ExtendedGroupType, useFeeEstimation, useTx } from '@/hooks';
import { createPortal } from 'react-dom';
import React, { useEffect, useState, useMemo } from 'react';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';
import { useTheme } from '@/contexts';
import BigNumber from 'bignumber.js';
import { ArrowUpIcon } from '@/components';
import { cosmos } from '@liftedinit/manifestjs';
import { useChain } from '@cosmos-kit/react';
import env from '@/config/env';
import VotingPopup from '@/components/groups/modals/voteModal';
import CountdownTimer from '@/components/groups/components/CountdownTimer';

SyntaxHighlighter.registerLanguage('json', json);

interface ProposalDetailsModalProps {
  tallies: QueryTallyResultResponseSDKType;
  votes: VoteSDKType[];
  proposal: ProposalSDKType;
  showVoteModal: boolean;
  group: ExtendedGroupType;
  setShowVoteModal: (show: boolean) => void;
  onClose: () => void;
  refetchVotes: () => void;
  refetchTally: () => void;
  refetchProposals: () => void;
  refetchGroupInfo: () => void;
  refetchDenoms: () => void;
}

const ProposalMessagesModal = ({
  proposal,
  onClose,
}: {
  proposal: ProposalSDKType;
  onClose: () => void;
}) => {
  const { theme } = useTheme();

  return createPortal(
    <dialog
      id="proposal-messages-modal"
      className="modal modal-open"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: 'transparent',
        padding: 0,
        margin: 0,
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="modal-box max-w-4xl min-h-96 max-h-[80vh] overflow-y-auto md:overflow-y-hidden rounded-[24px] shadow-lg bg-secondary transition-all duration-300"
          onClick={e => e.stopPropagation()}
          style={{ zIndex: 1002 }}
        >
          <form method="dialog" onSubmit={onClose}>
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A] z-50">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">Proposal Messages</h3>
          <div className="overflow-y-auto max-h-[60vh]">
            <SyntaxHighlighter language="json" style={theme === 'dark' ? oneDark : oneLight}>
              {JSON.stringify(proposal.messages, null, 2)}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </dialog>,
    document.body
  );
};

export function ProposalDetailsModal({
  tallies,
  votes,
  proposal,
  showVoteModal,
  group,
  setShowVoteModal,
  onClose,
  refetchVotes,
  refetchTally,
  refetchProposals,
  refetchGroupInfo,
  refetchDenoms,
}: ProposalDetailsModalProps) {
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const { address } = useChain(env.chain);

  const userHasVoted = votes?.some(vote => vote.voter.toLowerCase().trim() === address);

  const { tx, isSigning, setIsSigning } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);

  const { exec } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const { withdrawProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const msgExec = exec({
    proposalId: proposal?.id,
    executor: address ?? '',
  });

  const msgWithdraw = withdrawProposal({
    proposalId: proposal?.id,
    address: address ?? '',
  });

  const executeProposal = async () => {
    setIsSigning(true);
    try {
      const fee = await estimateFee(address ?? '', [msgExec]);
      await tx([msgExec], {
        fee,
        onSuccess: () => {
          setIsSigning(false);
          refetchTally();
          refetchVotes();
          refetchProposals();
          refetchGroupInfo();
          refetchDenoms();
          onClose();
        },
      });
      setIsSigning(false);
    } catch (error) {
      setIsSigning(false);
      console.error('Failed to execute proposal: ', error);
    }
  };

  const executeWithdrawl = async () => {
    setIsSigning(true);
    try {
      const fee = await estimateFee(address ?? '', [msgWithdraw]);
      await tx([msgWithdraw], {
        fee,
        onSuccess: () => {
          setIsSigning(false);
          refetchTally();
          refetchVotes();
          refetchProposals();
          refetchGroupInfo();
          refetchDenoms();
          onClose();
        },
      });
      setIsSigning(false);
    } catch (error) {
      setIsSigning(false);
      console.error('Failed to execute proposal: ', error);
    }
  };

  const handleVoteButtonClick = () => {
    const voteModal = document.getElementById('vote_modal') as HTMLDialogElement;
    if (voteModal) {
      voteModal.showModal();
    }
  };

  function getProposalStatusLabel(proposal: ProposalSDKType): string {
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

  function getProposalButton(proposal: ProposalSDKType): JSX.Element | undefined {
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
                  className={`btn btn-error text-white rounded-[12px] w-${userHasVoted ? 'full' : '1/2'}`}
                  onClick={executeWithdrawl}
                  disabled={isSigning}
                >
                  {isSigning ? <div className="loading loading-dots loading-sm" /> : 'withdraw'}
                </button>
                {!userHasVoted && (
                  <button
                    className="btn btn-gradient text-white rounded-[12px] w-1/2"
                    onClick={handleVoteButtonClick}
                    disabled={isSigning}
                  >
                    {isSigning ? <div className="loading loading-dots loading-sm" /> : 'vote'}
                  </button>
                )}
              </div>
            );
          case ProposalStatus.PROPOSAL_STATUS_ACCEPTED:
            return (
              <div className="flex flex-row items-center justify-center gap-2">
                <button
                  className="btn btn-gradient text-white rounded-[12px] w-full"
                  onClick={executeProposal}
                  disabled={isSigning}
                >
                  {isSigning ? <div className="loading loading-dots loading-sm" /> : 'execute'}
                </button>
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

  const tallyYes = useMemo(() => {
    const yes = BigNumber(tallies.tally?.yes_count);
    return yes.isFinite() ? yes : BigNumber(0);
  }, [tallies]);

  const tallyNo = useMemo(() => {
    const no = BigNumber(tallies.tally?.no_count);
    return no.isFinite() ? no : BigNumber(0);
  }, [tallies]);

  const tallyVeto = useMemo(() => {
    const veto = BigNumber(tallies.tally?.no_with_veto_count);
    return veto.isFinite() ? veto : BigNumber(0);
  }, [tallies]);

  const tallyAbstain = useMemo(() => {
    const abstain = BigNumber(tallies.tally?.abstain_count);
    return abstain.isFinite() ? abstain : BigNumber(0);
  }, [tallies]);

  const totalTally = useMemo(() => {
    return BigNumber.sum(tallyYes, tallyNo, tallyVeto, tallyAbstain);
  }, [tallyYes, tallyNo, tallyVeto, tallyAbstain]);

  const tallyYesPercentage = useMemo(() => {
    return totalTally.isZero() ? '0' : tallyYes.div(totalTally).multipliedBy(100).toFixed(2);
  }, [tallyYes, totalTally]);

  const tallyNoPercentage = useMemo(() => {
    return totalTally.isZero() ? '0' : tallyNo.div(totalTally).multipliedBy(100).toFixed(2);
  }, [tallyNo, totalTally]);

  const tallyVetoPercentage = useMemo(() => {
    return totalTally.isZero() ? '0' : tallyVeto.div(totalTally).multipliedBy(100).toFixed(2);
  }, [tallyVeto, totalTally]);

  const tallyAbstainPercentage = useMemo(() => {
    return totalTally.isZero() ? '0' : tallyAbstain.div(totalTally).multipliedBy(100).toFixed(2);
  }, [tallyAbstain, totalTally]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showVoteModal) {
        e.stopPropagation();
        setShowVoteModal(false);
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showVoteModal, setShowVoteModal, onClose]);

  const modalContent = (
    <dialog
      id="vote-details-modal"
      className={`modal ${showVoteModal ? 'modal-open' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: 'transparent',
        padding: 0,
        margin: 0,
        height: '100vh',
        width: '100vw',
        display: showVoteModal ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="modal-box max-w-4xl min-h-96 max-h-[80vh] overflow-y-auto md:overflow-y-hidden rounded-[24px] shadow-lg bg-secondary transition-all duration-300"
          onClick={e => e.stopPropagation()}
          style={{ zIndex: 1002 }}
        >
          <form method="dialog" onSubmit={onClose}>
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A] z-50">
              ✕
            </button>
          </form>
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold">#{proposal.id}</h2>
            <CountdownTimer endTime={new Date(proposal.voting_period_end)} />
            <span className="badge badge-lg shadow-lg badge-primary text-neutral-content rounded-full px-3 py-1">
              {getProposalStatusLabel(proposal)}
            </span>
          </div>

          <div className="mt-4">
            <h2 className="text-lg font-semibold">Title</h2>
            <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded-lg mt-1 max-h-40 overflow-auto">
              {proposal.title}
            </p>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-semibold">Summary</h2>
              <button
                className="btn btn-xs btn-ghost btn-circle"
                title="View Proposal Messages"
                onClick={() => setShowMessagesModal(true)}
              >
                <ArrowUpIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded-lg mt-1 max-h-40 overflow-auto">
              {proposal.summary}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold">Tally</h3>
            <div className="w-full bg-gray-700 rounded-lg h-6 relative mt-2 flex">
              <div
                className={`bg-[#4CAF50] h-6 rounded-l-lg ${tallyYes.eq(1) && 'rounded-r-lg'}`}
                style={{ width: `${tallyYesPercentage}%` }}
              ></div>
              <div
                className={`bg-[#E53935] h-6 ${tallyNo.eq(1) && 'rounded-l-lg rounded-r-lg'}`}
                style={{ width: `${tallyNoPercentage}%` }}
              ></div>
              <div
                className={`bg-[#FFB300] h-6 ${tallyVeto.eq(1) && 'rounded-l-lg rounded-r-lg'}`}
                style={{ width: `${tallyVetoPercentage}%` }}
              ></div>
              <div
                className={`bg-[#3F51B5] h-6 ${tallyAbstain.eq(1) && 'rounded-l-lg'} rounded-r-lg`}
                style={{ width: `${tallyAbstainPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-[#4CAF50] mr-1"></span>
                Yes ({tallyYesPercentage}%)
              </span>
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-[#E53935] mr-1"></span>
                No ({tallyNoPercentage}%)
              </span>
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-[#FFB300] mr-1"></span>
                No with Veto ({tallyVetoPercentage}%)
              </span>
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-[#3F51B5] mr-1"></span>
                Abstain ({tallyAbstainPercentage}%)
              </span>
            </div>
          </div>
          {getProposalButton(proposal) && <div className="mt-6">{getProposalButton(proposal)}</div>}
        </div>
      </div>
      <VotingPopup
        setIsSigning={setIsSigning}
        proposalId={proposal?.id ?? 0n}
        refetch={() => {
          refetchVotes();
          refetchTally();
          refetchProposals();
          refetchGroupInfo();
          refetchDenoms();
        }}
      />
    </dialog>
  );

  return (
    <>
      {typeof document !== 'undefined' &&
        showVoteModal &&
        createPortal(modalContent, document.body)}
      {showMessagesModal && (
        <ProposalMessagesModal proposal={proposal} onClose={() => setShowMessagesModal(false)} />
      )}
    </>
  );
}
