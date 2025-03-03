import { useChain } from '@cosmos-kit/react';
import { Dialog } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { cosmos } from '@liftedinit/manifestjs';
import { QueryTallyResultResponseSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/query';
import {
  ProposalSDKType,
  ProposalStatus,
  VoteOption,
  proposalStatusToJSON,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

import { Tally } from '@/components/groups/modals/tally';
import { TallyResults } from '@/components/groups/modals/tallyResults';
import { MessagesModal } from '@/components/groups/modals/voting/messagesModal';
import {
  getProposalButton,
  getProposalStatusLabel,
  getVoteOptionBadgeColor,
  getVoteOptionLabel,
} from '@/components/groups/utils';
import { ArrowUpIcon, CopyIcon } from '@/components/icons';
import { SignModal } from '@/components/react';
import env from '@/config/env';
import { useFeeEstimation, useProposalById, useTallyCount, useVotesByProposal } from '@/hooks';
import { useTx } from '@/hooks/useTx';

import CountdownTimer from '../components/CountdownTimer';
import VotingPopup from './voteModal';

interface VoteDetailsModalProps {
  policyAddress: string;
  proposals: ProposalSDKType[];
  proposalId: bigint;
  showVoteModal: boolean;
  onClose: () => void;
}

function VoteDetailsModal({
  policyAddress,
  proposalId,
  showVoteModal,
  onClose,
}: VoteDetailsModalProps) {
  const queryClient = useQueryClient();
  const { address } = useChain(env.chain);
  const { tx, isSigning } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);

  const [copied, setCopied] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showTally, setShowTally] = useState(false);
  const [showVotingPopup, setShowVotingPopup] = useState(false);
  const [pollForData, setPollForData] = useState(false); // Poll for data after countdown timer ends

  const { exec } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const { withdrawProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const { vote } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const { proposal } = useProposalById(proposalId, { refetchInterval: pollForData ? 2000 : false });
  const { tally } = useTallyCount(proposalId);
  const { votes } = useVotesByProposal(proposalId);

  useEffect(() => {
    const cond = async () => {
      if (
        pollForData &&
        proposal &&
        // I don't know why but I need to compare like this for it to work properly
        proposal.status.toString() !==
          proposalStatusToJSON(ProposalStatus.PROPOSAL_STATUS_SUBMITTED)
      ) {
        // At this point, we know that the proposal was accepted (or not) on chain
        // We can fetch the latest vote and tally data
        await queryClient.invalidateQueries({ queryKey: ['voteInfo', proposalId.toString()] });
        await queryClient.invalidateQueries({ queryKey: ['tallyInfo', proposalId.toString()] });
        setPollForData(false);
      }
    };

    cond();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollForData, proposal]);

  if (!proposal) {
    return null;
  }

  const msgExec = exec({
    proposalId: proposal?.id,
    executor: address ?? '',
  });

  const msgWithdraw = withdrawProposal({
    proposalId: proposal?.id,
    address: address ?? '',
  });

  const invalidateQueries = () => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ['proposalInfoById', proposalId.toString()] }),
      queryClient.invalidateQueries({ queryKey: ['voteInfo', proposalId.toString()] }),
      queryClient.invalidateQueries({ queryKey: ['tallyInfo', proposalId.toString()] }),
      queryClient.invalidateQueries({ queryKey: ['groupInfoByAdmin', policyAddress] }),
      queryClient.invalidateQueries({ queryKey: ['groupInfoByMember', address] }),
      queryClient.invalidateQueries({ queryKey: ['denoms', policyAddress] }),
    ]);
  };

  const handleVote = async (option: VoteOption) => {
    const msg = vote({
      proposalId: proposal.id,
      voter: address ?? '',
      option,
      metadata: '',
      exec: 0,
    });

    try {
      await tx(
        [msg],
        {
          fee: () => estimateFee(address ?? '', [msg]),
          onSuccess: () => {
            invalidateQueries();
          },
        },
        'vote-details-modal'
      );
    } catch (error) {
      console.error('Failed to vote: ', error);
    }
  };

  const executeProposal = async () => {
    try {
      await tx(
        [msgExec],
        {
          fee: () => estimateFee(address ?? '', [msgExec]),
          onSuccess: () => {
            onClose();
            queryClient.invalidateQueries({ queryKey: ['proposalInfoAll', policyAddress] });
            queryClient.invalidateQueries({ queryKey: ['proposalInfo', policyAddress] });
            queryClient.invalidateQueries({ queryKey: ['groupInfoByAdmin', policyAddress] });
            queryClient.invalidateQueries({ queryKey: ['groupInfoByMember', address] });
            queryClient.invalidateQueries({ queryKey: ['validators'] });
            queryClient.invalidateQueries({ queryKey: ['pendingVals'] });
          },
        },
        'vote-details-modal'
      );
    } catch (error) {
      console.error('Failed to execute proposal: ', error);
    }
  };

  const executeWithdrawal = async () => {
    try {
      await tx(
        [msgWithdraw],
        {
          fee: () => estimateFee(address ?? '', [msgWithdraw]),
          onSuccess: () => {
            invalidateQueries();
          },
        },
        'vote-details-modal'
      );
      onClose();
    } catch (error) {
      console.error('Failed to execute proposal: ', error);
    }
  };

  const userHasVoted = votes?.some(vote => vote.voter.toLowerCase().trim() === address);

  const userVoteOption = userHasVoted
    ? votes?.find(vote => vote.voter.toLowerCase().trim() === address)?.option
    : undefined;

  const copyProposalLink = () => {
    const url = `${window.location.origin}/groups?policyAddress=${proposal?.group_policy_address}&proposalId=${proposal?.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={showVoteModal}
      onClose={onClose}
      className={`modal modal-open fixed flex p-0 m-0`}
      style={{
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <Dialog.Panel className="modal-box relative justify-center max-w-4xl min-h-96 max-h-[80vh] overflow-y-auto flex flex-col -mt-12 rounded-[24px] shadow-lg bg-secondary transition-all duration-300">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>

        <div className="grid grid-cols-3 w-full items-center pb-3 mt-4">
          <div className="text-left">
            <h2 className="text-xl font-bold">#{proposal?.id?.toString()}</h2>
            <span className="badge badge-lg shadow-lg badge-primary text-neutral-content rounded-full px-3 py-1 mt-2">
              {getProposalStatusLabel(proposal)}
            </span>
          </div>
          <div className="text-center" aria-label="countdown-timer">
            <CountdownTimer
              endTime={new Date(proposal.voting_period_end)}
              onTimerEnd={() => {
                if (
                  proposal &&
                  proposal.status.toString() ===
                    proposalStatusToJSON(ProposalStatus.PROPOSAL_STATUS_SUBMITTED)
                ) {
                  setPollForData(true);
                }
              }}
            />
          </div>
        </div>

        <hr className="w-full border-gray-700" />

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
              data-testid="expand-messages"
              onClick={() => setShowMessages(true)}
            >
              <ArrowUpIcon className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded-lg mt-1 max-h-40 overflow-auto">
            {proposal.summary}
          </p>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold">Tally</h2>
            {votes.length > 0 && (
              <button
                className="btn btn-xs btn-ghost btn-circle"
                title="View Tally Results"
                data-testid="expand-tally"
                onClick={() => setShowTally(true)}
              >
                <ArrowUpIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <Tally tallies={tally ?? ({} as QueryTallyResultResponseSDKType)} />
        </div>
        <div className="mt-6">
          {getProposalButton(
            proposal,
            address,
            executeWithdrawal,
            executeProposal,
            setShowVotingPopup,
            isSigning,
            pollForData,
            userVoteOption
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={copyProposalLink}
            className="flex items-center gap-2 hover:bg-[#FFFFFFCC] dark:hover:bg-[#FFFFFF0F] p-2 rounded-full transition-colors duration-200"
            aria-label="copy-button"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 text-green-500" />
            ) : (
              <CopyIcon className="w-4 h-4" />
            )}
            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              {copied ? 'Copied!' : 'Share this proposal'}
            </p>
          </button>
        </div>

        <TallyResults votes={votes} opened={showTally} onClose={() => setShowTally(false)} />

        <MessagesModal
          proposal={proposal}
          opened={showMessages}
          onClose={() => setShowMessages(false)}
        />

        <VotingPopup
          open={showVotingPopup}
          onClose={vote => {
            if (vote) {
              handleVote(vote as unknown as VoteOption);
            }
            setShowVotingPopup(false);
          }}
          proposal={proposal}
        />
      </Dialog.Panel>

      <SignModal id="vote-details-modal" />
    </Dialog>
  );
}

export default VoteDetailsModal;
