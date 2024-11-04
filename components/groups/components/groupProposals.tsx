import { useState, useEffect } from 'react';
import { useProposalsByPolicyAccount, useTallyCount, useVotesByProposal } from '@/hooks/useQueries';
import { ProposalSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types';
import { QueryTallyResultResponseSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/group/v1/query';
import Link from 'next/link';
import { SearchIcon } from '@/components/icons';
import { useRouter } from 'next/router';

import VoteDetailsModal from '@/components/groups/modals/voteDetailsModal';
import { useGroupsByMember } from '@/hooks/useQueries';
import { useChain } from '@cosmos-kit/react';
import { MemberSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types';
import { ArrowRightIcon } from '@/components/icons';
import ProfileAvatar from '@/utils/identicon';
import { GroupInfo } from '../modals/groupInfo';
import { ExtendedGroupType } from '@/hooks/useQueries';
import { MemberManagementModal } from '../modals/memberManagmentModal';
import { ThresholdDecisionPolicy } from '@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types';
import { TailwindModal } from '@/components/react';

type GroupProposalsProps = {
  policyAddress: string;
  groupName: string;
  onBack: () => void;
  policyThreshold: ThresholdDecisionPolicy;
};

export default function GroupProposals({
  policyAddress,
  groupName,
  onBack,
  policyThreshold,
}: GroupProposalsProps) {
  const { proposals, isProposalsLoading, isProposalsError, refetchProposals } =
    useProposalsByPolicyAccount(policyAddress);

  const [selectedProposal, setSelectedProposal] = useState<ProposalSDKType | null>(null);
  const [tallies, _setTallies] = useState<
    { proposalId: bigint; tally: QueryTallyResultResponseSDKType }[]
  >([]);
  const [members, setMembers] = useState<MemberSDKType[]>([]);

  const [searchTerm, setSearchTerm] = useState('');

  // Convert proposalId to string before passing it to the hooks
  const proposalId = selectedProposal?.id ?? 0n;

  // Use the string version of the proposalId
  const { tally, refetchTally } = useTallyCount(proposalId);
  const { votes, refetchVotes } = useVotesByProposal(proposalId);

  const filterProposals = (proposals: ProposalSDKType[]) => {
    return proposals.filter(
      proposal =>
        proposal.status.toString() !== 'PROPOSAL_STATUS_ACCEPTED' &&
        proposal.status.toString() !== 'PROPOSAL_STATUS_REJECTED' &&
        proposal.status.toString() !== 'PROPOSAL_STATUS_WITHDRAWN'
    );
  };

  const router = useRouter();

  useEffect(() => {
    const { proposalId } = router.query;
    if (proposalId && typeof proposalId === 'string' && proposals.length > 0) {
      const proposalToOpen = proposals.find(p => p.id.toString() === proposalId);
      if (proposalToOpen) {
        setSelectedProposal(proposalToOpen);
        setTimeout(() => {
          const modal = document.getElementById(`vote_modal_${proposalId}`) as HTMLDialogElement;
          if (modal) {
            modal.showModal();
          }
        }, 0);
      } else {
        console.warn(`Proposal with ID ${proposalId} not found`);
        // Optionally, remove the invalid proposalId from the URL
        router.push(`/groups?policyAddress=${policyAddress}`, undefined, { shallow: true });
      }
    }
  }, [router.query, proposals, policyAddress]);

  const handleRowClick = (proposal: ProposalSDKType) => {
    setSelectedProposal(proposal);
    // Update URL without navigating
    router.push(`/groups?policyAddress=${policyAddress}&proposalId=${proposal.id}`, undefined, {
      shallow: true,
    });
    setTimeout(() => {
      const modal = document.getElementById(`vote_modal_${proposal.id}`) as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      } else {
        console.error(`Modal not found for proposal ${proposal.id}`);
      }
    }, 0);
  };

  const closeModal = () => {
    setSelectedProposal(null);
    // Remove proposalId from URL when closing the modal
    router.push(`/groups?policyAddress=${policyAddress}`, undefined, { shallow: true });
  };

  function isProposalPassing(tally: QueryTallyResultResponseSDKType) {
    const yesCount = BigInt(tally?.tally?.yes_count ?? '0');
    const noCount = BigInt(tally?.tally?.no_count ?? '0');
    const noWithVetoCount = BigInt(tally?.tally?.no_with_veto_count ?? '0');
    const abstainCount = BigInt(tally?.tally?.abstain_count ?? '0');

    const totalVotes = yesCount + noCount + noWithVetoCount + abstainCount;
    console.log(
      'totalVotes',
      totalVotes,
      'threshold',
      BigInt(policyThreshold.threshold),
      'isThresholdReached',
      totalVotes >= BigInt(policyThreshold.threshold)
    );
    // Check if threshold is reached
    const threshold = BigInt(policyThreshold.threshold);
    const isThresholdReached = totalVotes >= threshold;

    // Determine if passing based on vote distribution
    const isPassing = isThresholdReached && yesCount > noCount + noWithVetoCount;

    return {
      isPassing,
      yesCount,
      noCount,
      noWithVetoCount,
      abstainCount,
      isThresholdReached,
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

  const [groupId, setGroupId] = useState<string>('');
  const [groupAdmin, setGroupAdmin] = useState<string>('');

  useEffect(() => {
    if (groupByMemberData && policyAddress) {
      const group = groupByMemberData.groups.find(g => g.policies[0]?.address === policyAddress);
      if (group) {
        setMembers(
          group.members.map(member => ({
            ...member.member,
            address: member?.member?.address || '',
            weight: member?.member?.weight || '0',
            metadata: member?.member?.metadata || '',
            added_at: member?.member?.added_at || new Date(),
            isCoreMember: true,
            isActive: true,
            isAdmin: member?.member?.address === group.admin,
            isPolicyAdmin: member?.member?.address === group.policies[0]?.admin,
          }))
        );
        setGroupId(group.id.toString());
        setGroupAdmin(group.admin);
      }
    }
  }, [groupByMemberData, policyAddress]);

  const filteredProposals = filterProposals(proposals).filter(proposal =>
    proposal.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openInfoModal = () => {
    const modal = document.getElementById('group-info-modal') as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    } else {
      console.error("Modal element 'group-info-modal' not found");
    }
  };

  const openMemberModal = () => {
    const modal = document.getElementById('member-management-modal') as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    } else {
      console.error("Modal element 'member-management-modal' not found");
    }
  };

  return (
    <div className="space-y-4 w-full pt-4 text-black dark:text-white">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-6">
          <button
            onClick={onBack}
            className="btn btn-circle rounded-[16px] dark:bg-[#FFFFFF0F] bg-[#FFFFFF] btn-md"
          >
            <ArrowRightIcon className="text-primary" />
          </button>
          <h1 className="text-2xl font-bold">{groupName}</h1>
          <ProfileAvatar walletAddress={policyAddress} size={40} />
        </div>
        <div className="flex items-center space-x-4">
          <button
            className="btn w-[140px] h-[52px] rounded-[12px] focus:outline-none dark:bg-[#FFFFFF0F] bg-[#0000000A]"
            onClick={openInfoModal}
          >
            Info
          </button>
          <button
            className="btn w-[140px] h-[52px] rounded-[12px] focus:outline-none dark:bg-[#FFFFFF0F] bg-[#0000000A]"
            onClick={openMemberModal}
          >
            Members
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Proposals</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a group..."
              className="input input-bordered w-[224px] h-[40px] rounded-[12px] border-none bg:[#0000000A] dark:bg-[#FFFFFF1F] pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Link href={`/groups/submit-proposal/${policyAddress}`} passHref>
            <button className="btn btn-gradient rounded-[12px] w-[140px] text-white h-[52px]">
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

                const { isPassing, isThresholdReached } = proposalTally
                  ? isProposalPassing(proposalTally.tally)
                  : { isPassing: false, isThresholdReached: false };

                const endTime = new Date(proposal?.voting_period_end);
                const now = new Date();
                const msPerMinute = 1000 * 60;
                const msPerHour = msPerMinute * 60;
                const msPerDay = msPerHour * 24;

                const diff = endTime.getTime() - now.getTime();

                let timeLeft: string;

                if (diff <= 0) {
                  timeLeft = 'none';
                } else if (diff >= msPerDay) {
                  const days = Math.floor(diff / msPerDay);
                  timeLeft = `${days} day${days === 1 ? '' : 's'}`;
                } else if (diff >= msPerHour) {
                  const hours = Math.floor(diff / msPerHour);
                  timeLeft = `${hours} hour${hours === 1 ? '' : 's'}`;
                } else if (diff >= msPerMinute) {
                  const minutes = Math.floor(diff / msPerMinute);
                  timeLeft = `${minutes} minute${minutes === 1 ? '' : 's'}`;
                } else {
                  timeLeft = 'less than a minute';
                }

                let status;
                if (
                  BigInt(tally?.tally?.yes_count ?? '0') > BigInt(policyThreshold.threshold) &&
                  BigInt(tally?.tally?.yes_count ?? '0') >
                    BigInt(tally?.tally?.no_count ?? '0') +
                      BigInt(tally?.tally?.no_with_veto_count ?? '0')
                ) {
                  status = 'Passing';
                } else if (
                  BigInt(tally?.tally?.yes_count ?? '0') <
                  BigInt(tally?.tally?.no_count ?? '0') +
                    BigInt(tally?.tally?.no_with_veto_count ?? '0')
                ) {
                  status = 'Failing';
                } else {
                  status = 'Pending';
                }
                return (
                  <tr
                    key={proposal.id.toString()}
                    onClick={() => handleRowClick(proposal)}
                    className="hover:bg-base-200 text-black dark:text-white rounded-lg cursor-pointer"
                  >
                    <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] rounded-l-[12px] py-[1.15rem]">
                      {proposal.id.toString()}
                    </td>
                    <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] truncate max-w-xs">
                      {proposal.title}
                    </td>
                    <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF]">{timeLeft}</td>
                    <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF]">
                      {getHumanReadableType((proposal.messages[0] as any)['@type'])}
                    </td>
                    <td className="dark:bg-[#FFFFFF0F] bg-[#FFFFFF] rounded-r-[12px]">{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No proposals found</div>
      )}

      <VoteDetailsModal
        key={selectedProposal?.id.toString() ?? ''}
        tallies={tally ?? ({} as QueryTallyResultResponseSDKType)}
        votes={votes ?? []}
        members={members}
        proposal={selectedProposal ?? ({} as ProposalSDKType)}
        modalId={`vote_modal_${selectedProposal?.id}`}
        refetchVotes={refetchVotes}
        refetchTally={refetchTally}
        refetchProposals={refetchProposals}
        onClose={closeModal}
      />

      <GroupInfo
        group={
          groupByMemberData?.groups.find(g => g.policies[0]?.address === policyAddress) ??
          ({} as unknown as ExtendedGroupType)
        }
        address={address ?? ''}
        policyAddress={policyAddress}
        onUpdate={() => {}}
      />

      <MemberManagementModal
        members={members}
        groupId={groupId}
        groupAdmin={groupAdmin}
        policyAddress={policyAddress}
        address={address ?? ''}
        onUpdate={refetchProposals}
      />
    </div>
  );
}
