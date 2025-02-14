import React, { useEffect, useState } from 'react';

import {
  ProposalSDKType,
  VoteOption,
  VoteSDKType,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { QueryTallyResultResponseSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/query';
import VotingPopup from './voteModal';

import { useChain } from '@cosmos-kit/react';
import { useTx } from '@/hooks/useTx';
import { cosmos } from '@liftedinit/manifestjs';
import CountdownTimer from '../components/CountdownTimer';
import { ExtendedGroupType, useFeeEstimation } from '@/hooks';

import { ArrowUpIcon, CopyIcon } from '@/components/icons';
import env from '@/config/env';
import { Dialog } from '@headlessui/react';
import { SignModal } from '@/components/react';
import { MessagesModal } from '@/components/groups/modals/voting/messagesModal';
import {
  getProposalButton,
  getProposalStatusLabel,
  getVoteOptionBadgeColor,
  getVoteOptionLabel,
} from '@/components/groups/utils';
import { Tally } from '@/components/groups/modals/tally';

interface VoteMap {
  [key: string]: VoteOption;
}

interface VoteDetailsModalProps {
  tallies: QueryTallyResultResponseSDKType;
  votes: VoteSDKType[];
  proposal: ProposalSDKType;
  showVoteModal: boolean;
  group: ExtendedGroupType;
  onClose: () => void;
  refetchVotes: () => void;
  refetchTally: () => void;
  refetchProposals: () => void;
  refetchGroupInfo: () => void;
  refetchDenoms: () => void;
}
// Default fields to show if the message type is not in the mapping
function VoteDetailsModal({
  tallies,
  votes,
  proposal,
  showVoteModal,
  onClose,
  refetchVotes,
  refetchTally,
  refetchProposals,
  refetchGroupInfo,
  refetchDenoms,
}: VoteDetailsModalProps) {
  const { address } = useChain(env.chain);
  const { tx, isSigning } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);

  const { exec } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const { withdrawProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const { vote } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const msgExec = exec({
    proposalId: proposal?.id,
    executor: address ?? '',
  });

  const msgWithdraw = withdrawProposal({
    proposalId: proposal?.id,
    address: address ?? '',
  });

  function refetch() {
    refetchVotes();
    refetchTally();
    refetchProposals();
    refetchGroupInfo();
    refetchDenoms();
  }
  const handleVote = async (option: VoteOption) => {
    const msg = vote({
      proposalId: proposal.id,
      voter: address ?? '',
      option,
      metadata: '',
      exec: 0,
    });

    const fee = await estimateFee(address ?? '', [msg]);
    try {
      await tx(
        [msg],
        {
          fee,
          onSuccess: () => {
            refetch();
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
      const fee = await estimateFee(address ?? '', [msgExec]);
      await tx(
        [msgExec],
        {
          fee,
          onSuccess: () => {
            refetch();
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
      const fee = await estimateFee(address ?? '', [msgWithdraw]);
      await tx(
        [msgWithdraw],
        {
          fee,
          onSuccess: () => {
            refetch();
          },
        },
        'vote-details-modal'
      );
      onClose();
    } catch (error) {
      console.error('Failed to execute proposal: ', error);
    }
  };
  const [countdownValues, setCountdownValues] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const endTime = new Date(proposal?.voting_period_end);
  useEffect(() => {
    const calculateTimeParts = () => {
      const now = new Date();

      const timeDiff = endTime.getTime() - now.getTime();

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        return { days, hours, minutes, seconds };
      } else {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    const timeParts = calculateTimeParts();
    setCountdownValues(timeParts);

    const interval = setInterval(() => {
      const newTimeParts = calculateTimeParts();
      setCountdownValues(newTimeParts);
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal?.voting_period_end]);

  const userHasVoted = votes?.some(vote => vote.voter.toLowerCase().trim() === address);

  const userVoteOption = userHasVoted
    ? votes?.find(vote => vote.voter.toLowerCase().trim() === address)?.option
    : undefined;

  const [copied, setCopied] = useState(false);

  const copyProposalLink = () => {
    const url = `${window.location.origin}/groups?policyAddress=${proposal?.group_policy_address}&proposalId=${proposal?.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [showMessages, setShowMessages] = useState(false);
  const [showVotingPopup, setShowVotingPopup] = useState(false);

  return (
    <Dialog
      open={showVoteModal}
      onClose={onClose}
      className="modal modal-open fixed flex p-0 m-0"
      style={{
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <Dialog.Panel className="flex flex-col items-center justify-center w-full h-full">
        <div
          className="modal-box relative max-w-4xl min-h-96 max-h-[80vh] overflow-y-auto flex flex-col -mt-12 rounded-[24px] shadow-lg bg-secondary transition-all duration-300"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]"
          >
            ✕
          </button>

          {/* Header */}
          <div className="grid grid-cols-3 w-full items-center pb-3 mt-4">
            <div className="text-left">
              <h2 className="text-xl font-bold">#{proposal?.id?.toString()}</h2>
              <span className="badge badge-lg shadow-lg badge-primary text-neutral-content rounded-full px-3 py-1 mt-2">
                {getProposalStatusLabel(proposal)}
              </span>
            </div>
            <div className="text-center">
              <CountdownTimer endTime={new Date(proposal.voting_period_end)} />
            </div>
            <div className="text-right">
              {userHasVoted && (
                <div className="text-right mt-2">
                  <span className="text-sm text-primary-content">Your vote:</span>
                  <span
                    className={`badge badge-lg rounded-full ${getVoteOptionBadgeColor(userVoteOption)}`}
                  >
                    {userVoteOption ? getVoteOptionLabel(userVoteOption) : null}
                  </span>
                </div>
              )}
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
            <Tally tallies={tallies} />
          </div>
          <div className="mt-6">
            {getProposalButton(
              proposal,
              executeWithdrawal,
              executeProposal,
              setShowVotingPopup,
              isSigning,
              userVoteOption
            )}
          </div>
        </div>

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
