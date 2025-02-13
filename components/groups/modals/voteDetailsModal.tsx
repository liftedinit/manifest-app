import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';

import {
  ProposalExecutorResult,
  ProposalSDKType,
  ProposalStatus,
  proposalStatusFromJSON,
  VoteOption,
  VoteSDKType,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { QueryTallyResultResponseSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/query';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import VotingPopup from './voteModal';
import { ApexOptions } from 'apexcharts';

import { useChain } from '@cosmos-kit/react';
import { useTx } from '@/hooks/useTx';
import { cosmos } from '@liftedinit/manifestjs';
import { useTheme } from '@/contexts/theme';
import CountdownTimer from '../components/CountdownTimer';
import { ExtendedGroupType, useFeeEstimation } from '@/hooks';

import { CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ArrowUpIcon, CopyIcon } from '@/components/icons';
import env from '@/config/env';
import { messageSyntax } from '@/components';
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

SyntaxHighlighter.registerLanguage('json', json);

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

export const importantFields: { [key: string]: string[] } = {
  '/cosmos.bank.v1beta1.MsgSend': ['from_address', 'to_address', 'amount'],
  '/cosmos.group.v1.MsgCreateGroup': ['admin', 'members', 'metadata'],
  '/cosmos.group.v1.MsgUpdateGroupMembers': ['admin', 'group_id', 'member_updates'],
  '/cosmos.group.v1.MsgUpdateGroupAdmin': ['group_id', 'admin', 'new_admin'],
  '/cosmos.group.v1.MsgUpdateGroupMetadata': ['admin', 'group_id', 'metadata'],
  '/cosmos.group.v1.MsgCreateGroupPolicy': ['admin', 'group_id', 'metadata', 'decision_policy'],
  '/cosmos.group.v1.MsgCreateGroupWithPolicy': [
    'admin',
    'members',
    'group_metadata',
    'group_policy_metadata',
    'decision_policy',
  ],
  '/cosmos.group.v1.MsgSubmitProposal': [
    'group_policy_address',
    'proposers',
    'metadata',
    'messages',
  ],
  '/cosmos.group.v1.MsgVote': ['proposal_id', 'voter', 'option', 'metadata'],
  '/cosmos.group.v1.MsgExec': ['proposal_id', 'executor'],
  '/cosmos.group.v1.MsgLeaveGroup': ['address', 'group_id'],
  '/liftedinit.manifest.v1.MsgPayout': ['authority', 'payout_pairs'],
  '/liftedinit.manifest.v1.MsgBurnHeldBalance': ['authority', 'burn_coins'],
  '/cosmos.group.v1.MsgUpdateGroupPolicyDecisionPolicy': ['group_id', 'decision_policy'],
  '/cosmos.group.v1.MsgUpdateGroupPolicyMetadata': ['group_id', 'metadata'],
  '/osmosis.tokenfactory.v1beta1.MsgCreateDenom': ['subdenom'],
  '/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata': ['metadata'],
  '/osmosis.tokenfactory.v1beta1.MsgMint': ['mint_to_address', 'amount'],
  '/osmosis.tokenfactory.v1beta1.MsgBurn': ['burn_from_address', 'amount'],
  // Add more message types and their important fields here
};

// Default fields to show if the message type is not in the mapping
export const defaultFields = ['@type'];

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
  const status = proposalStatusFromJSON(proposal.status);
  useMemo(
    () =>
      votes?.reduce<VoteMap>((acc, vote) => {
        const voterKey = vote?.voter?.toLowerCase().trim();
        acc[voterKey] = vote?.option;
        return acc;
      }, {}),
    [votes]
  );
  const { address } = useChain(env.chain);
  const { theme } = useTheme();
  const [, setChartData] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    const yesCount = parseInt(tallies?.tally?.yes_count ?? '0');
    const noCount = parseInt(tallies?.tally?.no_count ?? '0');
    const vetoCount = parseInt(tallies?.tally?.no_with_veto_count ?? '0');
    const abstainCount = parseInt(tallies?.tally?.abstain_count ?? '0');

    setChartData([yesCount, noCount, vetoCount, abstainCount]);
  }, [tallies, votes]);
  const { tx, isSigning, setIsSigning } = useTx(env.chain);
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
    setIsSigning(true);
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
            setIsSigning(false);
          },
        },
        'vote-details-modal'
      );
    } catch (error) {
      setIsSigning(false);
      console.error('Failed to vote: ', error);
    }
  };

  const executeProposal = async () => {
    setIsSigning(true);
    try {
      const fee = await estimateFee(address ?? '', [msgExec]);
      await tx(
        [msgExec],
        {
          fee,
          onSuccess: () => {
            setIsSigning(false);
            refetch();
          },
        },
        'vote-details-modal'
      );
      setIsSigning(false);
    } catch (error) {
      setIsSigning(false);
      console.error('Failed to execute proposal: ', error);
    }
  };

  const executeWithdrawal = async () => {
    setIsSigning(true);
    try {
      const fee = await estimateFee(address ?? '', [msgWithdraw]);
      await tx(
        [msgWithdraw],
        {
          fee,
          onSuccess: () => {
            setIsSigning(false);
            refetch();
          },
        },
        'vote-details-modal'
      );
      setIsSigning(false);
      onClose();
    } catch (error) {
      setIsSigning(false);
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

  const proposalExpired =
    countdownValues.days +
      countdownValues.hours +
      countdownValues.minutes +
      countdownValues.seconds ===
    0;

  const userHasVoted = votes?.some(vote => vote.voter.toLowerCase().trim() === address);

  const userVoteOption = userHasVoted
    ? votes?.find(vote => vote.voter.toLowerCase().trim() === address)?.option
    : undefined;

  const renderMessageField = (key: string, value: any, depth: number = 0): JSX.Element => {
    const truncateText = (text: string, maxLength: number = 30) => {
      if (text.length <= maxLength) return text;
      return `${text.substring(0, maxLength)}...`;
    };

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return (
          <div key={key} style={{ marginLeft: `${depth * 20}px` }}>
            <h4 className="font-medium text-primary-content">{key}:</h4>
            {value.map((item, index) => (
              <div key={index} className="ml-4 text-primary-content">
                {renderMessageField(`Item ${index + 1}`, item, depth + 1)}
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <div key={key} style={{ marginLeft: `${depth * 20}px` }}>
            <h4 className="font-medium text-primary-content">{key}:</h4>
            {Object.entries(value).map(([subKey, subValue]) =>
              renderMessageField(subKey, subValue, depth + 1)
            )}
          </div>
        );
      }
    } else {
      return (
        <div key={key} style={{ marginLeft: `${depth * 20}px` }}>
          <h4 className="font-large text-md text-primary-content">{key}:</h4>
          {typeof value === 'string' && value.match(/^[a-zA-Z0-9]{40,}$/) ? (
            <TruncatedAddressWithCopy slice={14} address={value} />
          ) : (
            <p className="text-primary-content" title={String(value)}>
              {truncateText(String(value))}
            </p>
          )}
        </div>
      );
    }
  };
  useMemo(() => {
    const isWithdrawn = status === ProposalStatus.PROPOSAL_STATUS_WITHDRAWN;
    const isAborted = status === ProposalStatus.PROPOSAL_STATUS_ABORTED;
    const isAccepted = status === ProposalStatus.PROPOSAL_STATUS_ACCEPTED;
    const isRejected = status === ProposalStatus.PROPOSAL_STATUS_REJECTED;
    const isNotRun =
      proposal.executor_result ===
      ('PROPOSAL_EXECUTOR_RESULT_NOT_RUN' as unknown as ProposalExecutorResult);
    const isFailure =
      proposal.executor_result ===
      ('PROPOSAL_EXECUTOR_RESULT_FAILURE' as unknown as ProposalExecutorResult);
    const isProposer = proposal.proposers?.includes(address ?? '');

    if (isWithdrawn || isAborted || isRejected) {
      return { action: null, label: null };
    } else if ((isAccepted && isNotRun) || isFailure) {
      return { action: 'execute', label: 'Execute' };
    } else if (isNotRun && proposalExpired && !isRejected) {
      return { action: 'execute', label: 'Execute' };
    } else if (!proposalExpired && !userHasVoted) {
      return { action: 'vote', label: 'Vote' };
    } else if (
      (!isAccepted && isProposer) ||
      ((isRejected || userHasVoted) && !isAccepted && !isNotRun)
    ) {
      return { action: 'remove', label: 'Remove' };
    }
    return { action: null, label: null };
  }, [proposal, proposalExpired, status, userHasVoted, address]);
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

          {/* Divider */}
          <hr className="w-full border-gray-700" />

          {/* Proposal Title */}
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
          {getProposalButton(proposal) && <div className="mt-6">{getProposalButton(proposal)}</div>}
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
