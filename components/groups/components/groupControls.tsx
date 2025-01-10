import React, { useState, useEffect } from 'react';
import {
  useProposalsByPolicyAccount,
  useTallyCount,
  useVotesByProposal,
  useMultipleTallyCounts,
  ExtendedGroupType,
} from '@/hooks/useQueries';
import { ProposalSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { QueryTallyResultResponseSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/query';

import { useRouter } from 'next/router';

import VoteDetailsModal from '@/components/groups/modals/voteDetailsModal';
import { useGroupsByMember } from '@/hooks/useQueries';
import { useChain } from '@cosmos-kit/react';
import { MemberSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { ArrowRightIcon } from '@/components/icons';
import ProfileAvatar from '@/utils/identicon';
import { HistoryBox, TransactionGroup } from '@/components';
import { TokenList } from '@/components';
import { CombinedBalanceInfo, ExtendedMetadataSDKType } from '@/utils';
import DenomList from '@/components/factory/components/DenomList';
import env from '@/config/env';

type GroupControlsProps = {
  policyAddress: string;
  groupName: string;
  onBack: () => void;
  policyThreshold: string;
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  sendTxs: TransactionGroup[];
  totalPages: number;
  txLoading: boolean;
  isError: boolean;
  balances: CombinedBalanceInfo[];
  denoms: ExtendedMetadataSDKType[];
  denomLoading: boolean;
  isDenomError: boolean;
  refetchBalances: () => void;
  refetchHistory: () => void;
  refetchDenoms: () => void;
  refetchGroupInfo: () => void;
  pageSize: number;
  skeletonGroupCount: number;
  skeletonTxCount: number;
  group: ExtendedGroupType;
  proposalPageSize?: number;
};

export default function GroupControls({
  policyAddress,
  groupName,
  onBack,
  policyThreshold,
  isLoading,
  currentPage,
  setCurrentPage,
  sendTxs,
  totalPages,
  txLoading,
  isError,
  balances,
  denoms,
  denomLoading,
  isDenomError,
  refetchBalances,
  refetchHistory,
  refetchDenoms,
  refetchGroupInfo,
  pageSize,
  skeletonGroupCount,
  skeletonTxCount,
  group,
  proposalPageSize = 10,
}: GroupControlsProps) {
  const { proposals, isProposalsLoading, isProposalsError, refetchProposals } =
    useProposalsByPolicyAccount(policyAddress);

  const [selectedProposal, setSelectedProposal] = useState<ProposalSDKType | null>(null);
  const [members, setMembers] = useState<MemberSDKType[]>([]);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('proposals');

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
    const { tab } = router.query;
    if (tab && typeof tab === 'string') {
      setActiveTab(tab);
    }
  }, [router.query]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    router.push(`/groups?policyAddress=${policyAddress}&tab=${tab}`, undefined, { shallow: true });
  };

  useEffect(() => {
    const { proposalId } = router.query;
    if (proposalId && typeof proposalId === 'string' && proposals.length > 0) {
      const proposalToOpen = proposals.find(p => p.id.toString() === proposalId);
      if (proposalToOpen) {
        setSelectedProposal(proposalToOpen);
        setShowVoteModal(true);
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
    setShowVoteModal(true);
    // Update URL without navigating
    router.push(`/groups?policyAddress=${policyAddress}&proposalId=${proposal.id}`, undefined, {
      shallow: true,
    });
  };

  const handleCloseVoteModal = () => {
    setSelectedProposal(null);
    setShowVoteModal(false);
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

  const { address } = useChain(env.chain);
  const { groupByMemberData } = useGroupsByMember(address ?? '');

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
      }
    }
  }, [groupByMemberData, policyAddress]);

  const filteredProposals = filterProposals(proposals).filter(proposal =>
    proposal.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { tallies, isLoading: isTalliesLoading } = useMultipleTallyCounts(proposals.map(p => p.id));

  const handleKeyDown = (e: React.KeyboardEvent, tab: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(tab);
    }
  };

  const [proposalCurrentPage, setProposalCurrentPage] = useState(1);

  // Add responsive page size configuration
  const sizeLookup = [
    {
      height: 700,
      width: Infinity,
      sizes: { proposals: 6 },
    },
    {
      height: 800,
      width: Infinity,
      sizes: { proposals: 8 },
    },
    {
      height: 1000,
      width: 800,
      sizes: { proposals: 7 },
    },
    {
      height: 1000,
      width: Infinity,
      sizes: { proposals: 10 },
    },
    {
      height: 1300,
      width: Infinity,
      sizes: { proposals: 12 },
    },
  ];

  const defaultSizes = { proposals: proposalPageSize };
  const proposalPageSizes = useResponsivePageSize(sizeLookup, defaultSizes);

  // Calculate total pages for proposals
  const totalProposalPages = Math.ceil(filteredProposals.length / proposalPageSizes.proposals);

  // Get current page proposals
  const currentProposals = filteredProposals.slice(
    (proposalCurrentPage - 1) * proposalPageSizes.proposals,
    proposalCurrentPage * proposalPageSizes.proposals
  );

  return (
    <div className="">
      <div className="flex w-full h-full md:flex-row flex-col md:gap-8">
        <div className="flex flex-col w-full md:w-[48%] h-full">
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
              <div className="">
                <ProfileAvatar walletAddress={policyAddress} size={40} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-bordered tabs-md md:tabs-lg flex flex-row">
        <button
          role="tab"
          id="proposals-tab"
          aria-selected={activeTab === 'proposals'}
          aria-controls="proposals-panel"
          tabIndex={activeTab === 'proposals' ? 0 : -1}
          className={`font-bold tab ${activeTab === 'proposals' ? 'tab-active' : ''}`}
          onClick={() => handleTabClick('proposals')}
          onKeyDown={e => handleKeyDown(e, 'proposals')}
        >
          Proposals
        </button>
        <button
          role="tab"
          id="assets-tab"
          aria-selected={activeTab === 'assets'}
          aria-controls="assets-panel"
          tabIndex={activeTab === 'assets' ? 0 : -1}
          className={`font-bold tab ${activeTab === 'assets' ? 'tab-active' : ''}`}
          onClick={() => handleTabClick('assets')}
          onKeyDown={e => handleKeyDown(e, 'assets')}
        >
          Assets
        </button>
        <button
          role="tab"
          id="history-tab"
          aria-selected={activeTab === 'history'}
          aria-controls="history-panel"
          tabIndex={activeTab === 'history' ? 0 : -1}
          className={`font-bold tab ${activeTab === 'history' ? 'tab-active' : ''}`}
          onClick={() => handleTabClick('history')}
          onKeyDown={e => handleKeyDown(e, 'history')}
        >
          Activity
        </button>
        <button
          role="tab"
          id="tokens-tab"
          aria-selected={activeTab === 'tokens'}
          aria-controls="tokens-panel"
          tabIndex={activeTab === 'tokens' ? 0 : -1}
          className={`font-bold tab ${activeTab === 'tokens' ? 'tab-active' : ''}`}
          onClick={() => handleTabClick('tokens')}
          onKeyDown={e => handleKeyDown(e, 'tokens')}
        >
          Tokens
        </button>
      </div>

      <div className="flex flex-col w-full mt-4">
        <div
          id="proposals-panel"
          role="tabpanel"
          aria-labelledby="proposals-tab"
          hidden={activeTab !== 'proposals'}
        >
          {activeTab === 'proposals' &&
            (isProposalsLoading ? (
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
                className="table w-full border-separate border-spacing-y-3 -mt-6"
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
                    <th
                      className="bg-transparent px-4 py-2 w-[25%] hidden xl:table-cell"
                      scope="col"
                    >
                      Time Left
                    </th>
                    <th
                      className="bg-transparent px-4 py-2 w-[25%] sm:table-cell md:hidden hidden xl:table-cell"
                      scope="col"
                    >
                      Type
                    </th>
                    <th
                      className="bg-transparent px-4 py-2 w-[25%] sm:table-cell xxs:hidden hidden 2xl:table-cell"
                      scope="col"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  {currentProposals.map(proposal => {
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
                    if (
                      proposal.executor_result.toString() === 'PROPOSAL_EXECUTOR_RESULT_FAILURE'
                    ) {
                      status = 'Failure';
                    } else if (proposal.status.toString() === 'PROPOSAL_STATUS_ACCEPTED') {
                      status = 'Execute';
                    } else if (proposal.status.toString() === 'PROPOSAL_STATUS_CLOSED') {
                      status = 'Executed';
                    } else if (proposalTally) {
                      const { isPassing, isThresholdReached, isTie } =
                        isProposalPassing(proposalTally);
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
                        <td
                          className={`bg-secondary group-hover:bg-base-300 px-4 py-4 w-[25%] sm:rounded-none xxs:rounded-r-[12px] xs:rounded-r-[12px] xl:rounded-r-none`}
                        >
                          {proposal.title}
                        </td>
                        <td className="bg-secondary group-hover:bg-base-300 px-4 py-4 w-[25%] hidden xl:table-cell">
                          {timeLeft}
                        </td>
                        <td className="bg-secondary group-hover:bg-base-300 px-4 py-4 w-[25%] sm:table-cell md:hidden hidden xl:table-cell ">
                          {proposal.messages.length > 0
                            ? getHumanReadableType((proposal.messages[0] as any)['@type'])
                            : 'No messages'}
                        </td>
                        <td className="bg-secondary group-hover:bg-base-300 rounded-r-[12px] sm:table-cell xxs:hidden hidden 2xl:table-cell">
                          {isTalliesLoading ? (
                            <span className="loading loading-spinner loading-xs"></span>
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
                No proposal was found.
              </div>
            ))}
          {totalProposalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setProposalCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={proposalCurrentPage === 1}
                aria-label="Previous page"
                className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹
              </button>

              {[...Array(totalProposalPages)].map((_, index) => {
                const pageNum = index + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalProposalPages ||
                  (pageNum >= proposalCurrentPage - 1 && pageNum <= proposalCurrentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setProposalCurrentPage(pageNum)}
                      aria-label={`Page ${pageNum}`}
                      aria-current={proposalCurrentPage === pageNum ? 'page' : undefined}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors  
                        ${
                          proposalCurrentPage === pageNum
                            ? 'bg-[#0000001A] dark:bg-[#FFFFFF1A] text-black dark:text-white'
                            : 'hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === proposalCurrentPage - 2 ||
                  pageNum === proposalCurrentPage + 2
                ) {
                  return (
                    <span key={pageNum} className="text-black dark:text-white">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() =>
                  setProposalCurrentPage(prev => Math.min(totalProposalPages, prev + 1))
                }
                disabled={proposalCurrentPage === totalProposalPages}
                aria-label="Next page"
                className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ›
              </button>
            </div>
          )}
        </div>

        <div
          id="assets-panel"
          role="tabpanel"
          aria-labelledby="assets-tab"
          hidden={activeTab !== 'assets'}
        >
          {activeTab === 'assets' && (
            <TokenList
              balances={balances}
              isLoading={isLoading}
              refetchBalances={refetchBalances}
              refetchHistory={refetchHistory}
              address={address ?? ''}
              pageSize={pageSize}
              isGroup={true}
              admin={policyAddress}
              refetchProposals={refetchProposals}
            />
          )}
        </div>

        <div
          id="history-panel"
          role="tabpanel"
          aria-labelledby="history-tab"
          hidden={activeTab !== 'history'}
        >
          {activeTab === 'history' && (
            <HistoryBox
              isLoading={isLoading}
              address={policyAddress}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              sendTxs={sendTxs}
              totalPages={totalPages}
              txLoading={txLoading}
              isError={isError}
              refetch={refetchHistory}
              skeletonGroupCount={skeletonGroupCount}
              skeletonTxCount={skeletonTxCount}
              isGroup={true}
            />
          )}
        </div>

        <div
          id="tokens-panel"
          role="tabpanel"
          aria-labelledby="tokens-tab"
          hidden={activeTab !== 'tokens'}
        >
          {activeTab === 'tokens' && (
            <div className="h-full w-full -mt-7">
              <DenomList
                denoms={denoms}
                isLoading={isLoading}
                refetchDenoms={refetchDenoms}
                refetchProposals={refetchProposals}
                address={address ?? ''}
                admin={policyAddress}
                pageSize={pageSize - 1}
                isGroup={true}
              />
            </div>
          )}
        </div>
      </div>
      {selectedProposal && (
        <VoteDetailsModal
          tallies={tally ?? ({} as QueryTallyResultResponseSDKType)}
          votes={votes}
          members={members}
          proposal={selectedProposal}
          onClose={handleCloseVoteModal}
          showVoteModal={showVoteModal}
          setShowVoteModal={setShowVoteModal}
          refetchVotes={refetchVotes}
          refetchTally={refetchTally}
          refetchProposals={refetchProposals}
          refetchGroupInfo={refetchGroupInfo}
          refetchDenoms={refetchDenoms}
          group={group}
        />
      )}
    </div>
  );
}
