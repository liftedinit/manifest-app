import { useState, useEffect } from 'react';
import {
  useProposalsByPolicyAccount,
  useTallyCount,
  useVotesByProposal,
  useMultipleTallyCounts,
} from '@/hooks/useQueries';
import { ProposalSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { QueryTallyResultResponseSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/query';
import Link from 'next/link';
import { SearchIcon } from '@/components/icons';
import { useRouter } from 'next/router';

import VoteDetailsModal from '@/components/groups/modals/voteDetailsModal';
import { useGroupsByMember } from '@/hooks/useQueries';
import { useChain } from '@cosmos-kit/react';
import { MemberSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { ArrowRightIcon } from '@/components/icons';
import ProfileAvatar from '@/utils/identicon';

type GroupProposalsProps = {
  policyAddress: string;
  groupName: string;
  onBack: () => void;
  policyThreshold: string;
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
        // remove the invalid proposalId from the URL
        router.push(`/groups?policyAddress=${policyAddress}`, undefined, { shallow: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const totalNoVotes = noCount + noWithVetoCount;

    // Check if threshold is reached
    const threshold = BigInt(policyThreshold);
    const isThresholdReached = totalVotes >= threshold;

    // Check for tie
    const isTie = yesCount === totalNoVotes && yesCount > 0;

    // Determine if passing based on vote distribution
    const isPassing = isThresholdReached && yesCount > totalNoVotes;

    return {
      isPassing,
      yesCount,
      noCount,
      noWithVetoCount,
      abstainCount,
      isThresholdReached,
      isTie,
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
      const group = groupByMemberData.groups.find(
        g => g.policies.length > 0 && g.policies[0]?.address === policyAddress
      );
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

  const { tallies, isLoading: isTalliesLoading } = useMultipleTallyCounts(proposals.map(p => p.id));

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="btn btn-circle rounded-[12px] bg-secondary btn-md focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            aria-label="Go back to groups list"
          >
            <ArrowRightIcon className="text-primary" />
          </button>
          <h1 className="text-2xl font-bold text-primary-content truncate">{groupName}</h1>
          <div className="hidden sm:block">
            <ProfileAvatar walletAddress={policyAddress} size={40} />
          </div>
        </div>
      </div>

      {/* Search and New Proposal section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <h2 className="text-xl font-semibold text-primary-content">Proposals</h2>
          <div className="relative w-full sm:w-[224px]">
            <input
              type="text"
              placeholder="Search for a proposal..."
              className="input input-bordered w-full h-[40px] rounded-[12px] border-none bg-secondary text-secondary-content pl-10 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              aria-label="Search proposals"
            />
            <SearchIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
          </div>
        </div>
        <div className="hidden md:block">
          <Link
            href={`/groups/submit-proposal/${policyAddress}`}
            passHref
            aria-label="Create new proposal"
            className="focus:outline-none focus-visible:ring-0 "
          >
            <button className="btn btn-gradient rounded-[12px] w-[224px] text-white h-[52px] focus:outline-none focus-visible:ring-1 focus-visible:ring-primary">
              New proposal
            </button>
          </Link>
        </div>
      </div>

      {/* Table section - will fill remaining space */}
      <div className="flex-1 overflow-auto">
        {isProposalsLoading ? (
          <div
            className="flex justify-center items-center h-64"
            role="status"
            aria-label="Loading proposals"
          >
            <span className="loading loading-spinner loading-lg" aria-hidden="true"></span>
          </div>
        ) : isProposalsError ? (
          <div className="text-center text-error" role="alert">
            Error loading proposals
          </div>
        ) : filteredProposals.length > 0 ? (
          <table
            className="table w-full border-separate border-spacing-y-3"
            aria-label="Group proposals"
          >
            <thead>
              <tr className="text-sm font-medium">
                <th className="bg-transparent px-4 py-2 w-[25%]" scope="col">
                  ID
                </th>
                <th className="bg-transparent px-4 py-2 w-[25%]" scope="col">
                  Title
                </th>
                <th className="bg-transparent px-4 py-2 w-[25%] hidden md:table-cell" scope="col">
                  Time Left
                </th>
                <th className="bg-transparent px-4 py-2 w-[25%] hidden md:table-cell" scope="col">
                  Type
                </th>
                <th className="bg-transparent px-4 py-2 w-[25%] hidden md:table-cell" scope="col">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="space-y-4">
              {filteredProposals.map(proposal => {
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

                const proposalTally = tallies.find(t => t.proposalId === proposal.id)?.tally;

                let status = 'Pending';
                if (proposal.status.toString() === 'PROPOSAL_STATUS_ACCEPTED') {
                  status = 'Execute';
                } else if (proposal.status.toString() === 'PROPOSAL_STATUS_CLOSED') {
                  status = 'Executed';
                } else if (proposalTally) {
                  const { isPassing, isThresholdReached, isTie } = isProposalPassing(proposalTally);
                  if (isThresholdReached) {
                    if (isTie) {
                      status = 'Tie';
                    } else {
                      status = isPassing ? 'Passing' : 'Failing';
                    }
                  }
                }
                return (
                  <tr
                    key={proposal.id.toString()}
                    onClick={() => handleRowClick(proposal)}
                    className="group text-black dark:text-white rounded-lg cursor-pointer"
                  >
                    <td className="bg-secondary group-hover:bg-base-300 rounded-l-[12px] px-4 py-4 w-[25%]">
                      {proposal.id.toString()}
                    </td>
                    <td className="bg-secondary group-hover:bg-base-300 truncate max-w-xs px-4 py-4 w-[25%]">
                      {proposal.title}
                    </td>
                    <td className="bg-secondary group-hover:bg-base-300 px-4 py-4 w-[25%]">
                      {timeLeft}
                    </td>
                    <td className="bg-secondary group-hover:bg-base-300 px-4 py-4 w-[25%]">
                      {proposal.messages.length > 0
                        ? proposal.messages.map((message, index) => (
                            <div key={index}>{getHumanReadableType((message as any)['@type'])}</div>
                          ))
                        : 'No messages'}
                    </td>
                    <td className="bg-secondary group-hover:bg-base-300 rounded-r-[12px] px-4 py-4 w-[25%]">
                      {isTalliesLoading ? (
                        <span
                          className="loading loading-spinner loading-xs"
                          role="status"
                          aria-label="Loading status"
                        ></span>
                      ) : (
                        status
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500" role="status">
            No proposal was found
          </div>
        )}
        <div className="block md:hidden mt-8">
          <Link
            href={`/groups/submit-proposal/${policyAddress}`}
            passHref
            aria-label="Create new proposal"
          >
            <button className="btn btn-gradient rounded-[12px] w-full text-white h-[52px] focus:outline-none focus-visible:ring-1 focus-visible:ring-primary">
              New proposal
            </button>
          </Link>
        </div>
      </div>

      {/* Modals */}
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
    </div>
  );
}
