import { useState, useEffect } from 'react';
import { useProposalsByPolicyAccount, useTallyCount, useVotesByProposal } from '@/hooks/useQueries';
import {
  ProposalSDKType,
  ProposalStatus,
  ProposalExecutorResult,
} from '@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types';
import { QueryTallyResultResponseSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/group/v1/query';
import Link from 'next/link';
import { SearchIcon } from '@/components/icons';

import VoteDetailsModal from '@/components/groups/modals/voteDetailsModal';
import { useGroupsByMember } from '@/hooks/useQueries';
import { useChain } from '@cosmos-kit/react';
import { MemberSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types';
import { ArrowRightIcon } from '@/components/icons';
import ProfileAvatar from '@/utils/identicon';

export default function GroupProposals({
  policyAddress,
  groupName,
  onBack,
}: {
  policyAddress: string;
  groupName: string;
  onBack: () => void;
}) {
  const { proposals, isProposalsLoading, isProposalsError, refetchProposals } =
    useProposalsByPolicyAccount(policyAddress);
  const [selectedProposal, setSelectedProposal] = useState<ProposalSDKType | null>(null);
  const [tallies, setTallies] = useState<
    { proposalId: bigint; tally: QueryTallyResultResponseSDKType }[]
  >([]);
  const [members, setMembers] = useState<MemberSDKType[]>([]);
  const [admin, setAdmin] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Convert proposalId to string before passing it to the hooks
  const proposalIdString = selectedProposal?.id?.toString() ?? '0';

  // Use the string version of the proposalId
  const { tally, refetchTally } = useTallyCount(proposalIdString);
  const { votes, refetchVotes } = useVotesByProposal(proposalIdString);

  const updateTally = (proposalId: bigint, newTally: QueryTallyResultResponseSDKType) => {
    setTallies(prevTallies => {
      const existingTallyIndex = prevTallies.findIndex(item => item.proposalId === proposalId);
      if (existingTallyIndex >= 0) {
        const newTallies = [...prevTallies];
        newTallies[existingTallyIndex] = { proposalId, tally: newTally };
        return newTallies;
      } else {
        return [...prevTallies, { proposalId, tally: newTally }];
      }
    });
  };

  const filterProposals = (proposals: ProposalSDKType[]) => {
    return proposals.filter(
      proposal =>
        proposal.status !== ProposalStatus.PROPOSAL_STATUS_ACCEPTED &&
        proposal.status !== ProposalStatus.PROPOSAL_STATUS_REJECTED &&
        proposal.status !== ProposalStatus.PROPOSAL_STATUS_WITHDRAWN
    );
  };

  const handleRowClick = (proposal: ProposalSDKType) => {
    setSelectedProposal(proposal);
    // Use setTimeout to ensure the state has been updated and the modal is available
    setTimeout(() => {
      const modal = document.getElementById(`vote_modal_${proposal.id}`) as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      } else {
        console.error(`Modal not found for proposal ${proposal.id}`);
      }
    }, 0);
  };

  function isProposalPassing(tally: QueryTallyResultResponseSDKType) {
    const yesCount = parseFloat(tally?.tally?.yes_count ?? '0');
    const noCount = parseFloat(tally?.tally?.no_count ?? '0');
    const noWithVetoCount = parseFloat(tally?.tally?.no_with_veto_count ?? '0');
    const abstainCount = parseFloat(tally?.tally?.abstain_count ?? '0');

    const passingThreshold = yesCount > noCount;

    return {
      isPassing: passingThreshold,
      yesCount,
      noCount,
      noWithVetoCount,
      abstainCount,
    };
  }

  type ChainMessageType =
    | '/cosmos.bank.v1beta1.MsgSend'
    | '/strangelove_ventures.poa.v1.MsgSetPower'
    | '/cosmos.group.v1.MsgCreateGroup'
    | '/cosmos.group.v1.MsgUpdateGroupMembers'
    | '/cosmos.group.v1.MsgUpdateGroupAdmin'
    | '/cosmos.group.v1.MsgUpdateGroupMetadata'
    | '/cosmos.group.v1.MsgCreateGroupPolicy'
    | '/cosmos.group.v1.MsgCreateGroupWithPolicy'
    | '/cosmos.group.v1.MsgSubmitProposal'
    | '/cosmos.group.v1.MsgVote'
    | '/cosmos.group.v1.MsgExec'
    | '/cosmos.group.v1.MsgLeaveGroup'
    | '/manifest.v1.MsgUpdateParams'
    | '/manifest.v1.MsgPayout'
    | '/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade'
    | '/cosmos.upgrade.v1beta1.MsgCancelUpgrade';

  const typeRegistry: Record<ChainMessageType, string> = {
    '/cosmos.bank.v1beta1.MsgSend': 'Send',
    '/strangelove_ventures.poa.v1.MsgSetPower': 'Set Power',
    '/cosmos.group.v1.MsgCreateGroup': 'Create Group',
    '/cosmos.group.v1.MsgUpdateGroupMembers': 'Update Group Members',
    '/cosmos.group.v1.MsgUpdateGroupAdmin': 'Update Group Admin',
    '/cosmos.group.v1.MsgUpdateGroupMetadata': 'Update Group Metadata',
    '/cosmos.group.v1.MsgCreateGroupPolicy': 'Create Group Policy',
    '/cosmos.group.v1.MsgCreateGroupWithPolicy': 'Create Group With Policy',
    '/cosmos.group.v1.MsgSubmitProposal': 'Submit Proposal',
    '/cosmos.group.v1.MsgVote': 'Vote',
    '/cosmos.group.v1.MsgExec': 'Execute Proposal',
    '/cosmos.group.v1.MsgLeaveGroup': 'Leave Group',
    '/manifest.v1.MsgUpdateParams': 'Update Manifest Params',
    '/manifest.v1.MsgPayout': 'Payout',
    '/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade': 'Software Upgrade',
    '/cosmos.upgrade.v1beta1.MsgCancelUpgrade': 'Cancel Upgrade',
  };

  function getHumanReadableType(type: string): string {
    const registeredType = typeRegistry[type as ChainMessageType];
    if (registeredType) {
      return registeredType;
    }
    const parts = type.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart
      .replace('Msg', '')
      .replace(/([A-Z])/g, ' $1')
      .trim();
  }

  const { address } = useChain('manifest');
  const { groupByMemberData } = useGroupsByMember(address ?? '');

  useEffect(() => {
    if (groupByMemberData && policyAddress) {
      const group = groupByMemberData.groups.find(g => g.policies[0]?.address === policyAddress);
      if (group) {
        setMembers(group.members);
        setAdmin(group.admin);
      }
    }
  }, [groupByMemberData, policyAddress]);

  const filteredProposals = filterProposals(proposals).filter(proposal =>
    proposal.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 w-full pt-4">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-6">
          <button onClick={onBack} className="btn btn-circle rounded-[16px] bg-[#FFFFFF0F] btn-md">
            <ArrowRightIcon className="text-primary" />
          </button>
          <h1 className="text-2xl font-bold">{groupName}</h1>
          <ProfileAvatar walletAddress={policyAddress} size={40} />
        </div>
        <div className="flex items-center space-x-4">
          <button className="btn w-[140px] h-[52px] rounded-[12px] bg-[#FFFFFF0F]">Info</button>
          <button className="btn w-[140px] h-[52px] rounded-[12px] bg-[#FFFFFF0F]">Members</button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Proposals</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a group..."
              className="input input-bordered w-[224px] h-[40px] rounded-[12px] border-none bg-[#FFFFFF1F] pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <Link href={`/groups/submit-proposal/${policyAddress}`} passHref>
            <button className="btn btn-gradient rounded-[12px] w-[140px] h-[52px]">
              New proposal
            </button>
          </Link>
        </div>
      </div>

      {isProposalsLoading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : isProposalsError ? (
        <div className="text-center text-error">Error loading proposals</div>
      ) : filteredProposals.length > 0 ? (
        <div className="overflow-x-auto w-full">
          <table className="table w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-sm font-medium">
                <th className="bg-transparent">#</th>
                <th className="bg-transparent">Title</th>
                <th className="bg-transparent">Time Left</th>
                <th className="bg-transparent">Type</th>
                <th className="bg-transparent">Status</th>
              </tr>
            </thead>
            <tbody className="space-y-4">
              {filteredProposals.map(proposal => {
                const proposalTally = tallies.find(t => t.proposalId === proposal.id);
                const { isPassing = false } = proposalTally
                  ? isProposalPassing(proposalTally.tally)
                  : {};
                const endTime = new Date(proposal?.voting_period_end);
                const now = new Date();
                const diff = endTime.getTime() - now.getTime();

                let timeLeft: string;
                if (diff <= 0) {
                  timeLeft = 'none';
                } else if (diff >= 86400000) {
                  const days = Math.floor(diff / 86400000);
                  timeLeft = `${days} day${days === 1 ? '' : 's'}`;
                } else if (diff >= 3600000) {
                  const hours = Math.floor(diff / 3600000);
                  timeLeft = `${hours} hour${hours === 1 ? '' : 's'}`;
                } else if (diff >= 60000) {
                  const minutes = Math.floor(diff / 60000);
                  timeLeft = `${minutes} minute${minutes === 1 ? '' : 's'}`;
                } else {
                  timeLeft = 'less than a minute';
                }

                return (
                  <tr
                    key={proposal.id.toString()}
                    onClick={() => handleRowClick(proposal)}
                    className="hover:bg-base-200 rounded-lg cursor-pointer"
                  >
                    <td className="dark:bg-[#FFFFFF0F] rounded-l-[12px] py-[1.15rem]">
                      {proposal.id.toString()}
                    </td>
                    <td className="dark:bg-[#FFFFFF0F] truncate max-w-xs">{proposal.title}</td>
                    <td className="dark:bg-[#FFFFFF0F]">{timeLeft}</td>
                    <td className="dark:bg-[#FFFFFF0F]">
                      {getHumanReadableType((proposal.messages[0] as any)['@type'])}
                    </td>
                    <td className="dark:bg-[#FFFFFF0F] rounded-r-[12px]">
                      {isPassing && diff > 0
                        ? 'Passing'
                        : isPassing && diff <= 0
                          ? 'Passed'
                          : diff > 0
                            ? 'Failing'
                            : 'Failed'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No proposals available</div>
      )}

      {proposals.map(proposal => (
        <VoteDetailsModal
          key={proposal.id.toString()}
          tallies={tally ?? ({} as QueryTallyResultResponseSDKType)}
          votes={votes ?? []}
          members={members}
          proposal={proposal}
          admin={admin}
          modalId={`vote_modal_${proposal.id}`}
          refetchVotes={refetchVotes}
          refetchTally={refetchTally}
          refetchProposals={refetchProposals}
        />
      ))}
    </div>
  );
}
