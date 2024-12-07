import {
  ExtendedGroupType,
  ExtendedQueryGroupsByMemberResponseSDKType,
  useGetFilteredTxAndSuccessfulProposals,
  useTokenBalances,
  useTokenBalancesResolved,
  useTokenFactoryDenomsMetadata,
} from '@/hooks/useQueries';
import ProfileAvatar from '@/utils/identicon';
import { CombinedBalanceInfo, MFX_TOKEN_DATA, truncateString } from '@/utils';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ProposalSDKType,
  ThresholdDecisionPolicySDKType,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import GroupProposals from './groupControls';
import { useBalance } from '@/hooks/useQueries';
import { shiftDigits } from '@/utils';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { SearchIcon } from '@/components/icons';
import { MemberIcon } from '@/components/icons';
import { PiInfo } from 'react-icons/pi';
import { GroupInfo } from '../modals/groupInfo';
import { MemberManagementModal } from '../modals/memberManagementModal';
import { useChain } from '@cosmos-kit/react';
import useIsMobile from '@/hooks/useIsMobile';
import { chainName } from '@/config';
import { useEndpointStore } from '@/store/endpointStore';

export function YourGroups({
  groups,
  proposals,
  isLoading,
  refetch,
}: {
  groups: ExtendedQueryGroupsByMemberResponseSDKType;
  proposals: { [policyAddress: string]: ProposalSDKType[] };
  isLoading: boolean;
  refetch: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();

  const pageSize = isMobile ? 6 : 8;

  const [selectedGroup, setSelectedGroup] = useState<{
    policyAddress: string;
    name: string;
    threshold: string;
  } | null>(null);

  const router = useRouter();
  const { address } = useChain('manifest');

  const filteredGroups = groups.groups.filter(group =>
    (group.ipfsMetadata?.title || 'Untitled Group').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGroups.length / pageSize);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    // Check if there's a policy address in the URL on component mount
    const { policyAddress } = router.query;
    if (policyAddress && typeof policyAddress === 'string') {
      const group = groups.groups.find(
        g => g.policies && g.policies.length > 0 && g.policies[0]?.address === policyAddress
      );
      if (group) {
        setSelectedGroup({
          policyAddress,
          name: group.ipfsMetadata?.title ?? 'Untitled Group',
          threshold:
            (group.policies[0]?.decision_policy as ThresholdDecisionPolicySDKType)?.threshold ??
            '0',
        });
      }
    }
  }, [router.query, groups.groups]);

  useEffect(() => {
    // Scroll to top when a group is selected
    if (selectedGroup) {
      window.scrollTo(0, 0);
    }
  }, [selectedGroup]);

  const handleSelectGroup = (policyAddress: string, groupName: string, threshold: string) => {
    setSelectedGroup({ policyAddress, name: groupName || 'Untitled Group', threshold });
    router.push(`/groups?policyAddress=${policyAddress}`, undefined, { shallow: true });
  };

  const handleBack = () => {
    setSelectedGroup(null);
    router.push('/groups', undefined, { shallow: true });
  };

  const { balances, isBalancesLoading, refetchBalances } = useTokenBalances(
    selectedGroup?.policyAddress ?? ''
  );
  const {
    balances: resolvedBalances,
    isBalancesLoading: resolvedLoading,
    refetchBalances: resolveRefetch,
  } = useTokenBalancesResolved(address ?? '');

  const { selectedEndpoint } = useEndpointStore();
  const indexerUrl = selectedEndpoint?.indexer || '';

  const { metadatas, isMetadatasLoading } = useTokenFactoryDenomsMetadata();
  const [currentPageGroupInfo, setCurrentPageGroupInfo] = useState(1);

  const pageSizeGroupInfo = isMobile ? 4 : 4;
  const pageSizeHistory = isMobile ? 4 : 3;
  const skeletonGroupCount = 1;
  const skeletonTxCount = isMobile ? 5 : 3;

  const {
    sendTxs,
    totalPages: totalPagesGroupInfo,
    isLoading: txLoading,
    isError,
    refetch: refetchHistory,
  } = useGetFilteredTxAndSuccessfulProposals(
    indexerUrl,
    selectedGroup?.policyAddress ?? '',
    currentPageGroupInfo,
    pageSizeHistory
  );

  const combinedBalances = useMemo(() => {
    if (!balances || !resolvedBalances || !metadatas) return [];

    // Find 'umfx' balance (mfx token)
    const mfxCoreBalance = balances.find(b => b.denom === 'umfx');
    const mfxResolvedBalance = resolvedBalances.find(rb => rb.denom === 'mfx');

    // Create combined balance for 'mfx'
    const mfxCombinedBalance: CombinedBalanceInfo | null = mfxCoreBalance
      ? {
          denom: mfxResolvedBalance?.denom || 'mfx',
          coreDenom: 'umfx',
          amount: mfxCoreBalance.amount,
          metadata: MFX_TOKEN_DATA,
        }
      : null;

    // Process other balances
    const otherBalances = balances
      .filter(coreBalance => coreBalance.denom !== 'umfx')
      .map((coreBalance): CombinedBalanceInfo => {
        const resolvedBalance = resolvedBalances.find(
          rb => rb.denom === coreBalance.denom || rb.denom === coreBalance.denom.split('/').pop()
        );
        const metadata = metadatas.metadatas.find(m => m.base === coreBalance.denom);

        return {
          denom: resolvedBalance?.denom || coreBalance.denom,
          coreDenom: coreBalance.denom,
          amount: coreBalance.amount,
          metadata: metadata || null,
        };
      });

    // Combine 'mfx' with other balances
    return mfxCombinedBalance ? [mfxCombinedBalance, ...otherBalances] : otherBalances;
  }, [balances, resolvedBalances, metadatas]);

  const isLoadingGroupInfo = isBalancesLoading || resolvedLoading || isMetadatasLoading;

  const [activeInfoModalId, setActiveInfoModalId] = useState<string | null>(null);
  const [activeMemberModalId, setActiveMemberModalId] = useState<string | null>(null);

  return (
    <div className="relative w-full h-screen overflow-x-hidden scrollbar-hide">
      <div
        className={`absolute inset-0 transition-transform duration-300 ${
          selectedGroup ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              <h1
                className="text-secondary-content"
                style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
              >
                My groups
              </h1>
              <div className="relative w-full sm:w-[224px]">
                <input
                  type="text"
                  placeholder="Search for a group..."
                  className="input input-bordered w-full h-[40px] rounded-[12px] border-none bg-secondary text-secondary-content pl-10 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  aria-label="Search groups"
                />
                <SearchIcon className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="hidden md:block ">
              <Link href="/groups/create" passHref aria-label="Create new group">
                <button className="btn btn-gradient w-[224px] h-[52px] text-white rounded-[12px] focus:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                  Create New Group
                </button>
              </Link>
            </div>
          </div>
          <div className="overflow-auto">
            <div className="max-w-8xl mx-auto">
              <table
                className="table w-full border-separate border-spacing-y-3"
                aria-label="Your groups"
              >
                <thead className="sticky top-0 bg-background-color">
                  <tr className="text-sm font-medium">
                    <th className="bg-transparent">Group Name</th>
                    <th className="bg-transparent hidden xl:table-cell">Active proposals</th>
                    <th className="bg-transparent hidden sm:table-cell">Group Balance</th>
                    <th className="bg-transparent hidden xl:table-cell">Qualified Majority</th>
                    <th className="bg-transparent hidden lg:table-cell">Group address</th>
                    <th className="bg-transparent text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="space-y-4" role="rowgroup">
                  {isLoading
                    ? Array(isMobile ? 6 : 8)
                        .fill(0)
                        .map((_, index) => (
                          <tr key={index} data-testid="skeleton-row">
                            <td className="bg-secondary rounded-l-[12px] ">
                              <div className="flex items-center space-x-3">
                                <div className="skeleton w-10 h-8 rounded-full shrink-0"></div>
                                <div className="skeleton h-3 w-24"></div>
                              </div>
                            </td>
                            <td className="bg-secondary hidden xl:table-cell">
                              <div className="skeleton h-2 w-8"></div>
                            </td>
                            <td className="bg-secondary hidden sm:table-cell">
                              <div className="skeleton h-2 w-16"></div>
                            </td>
                            <td className="bg-secondary hidden xl:table-cell">
                              <div className="skeleton h-2 w-20"></div>
                            </td>
                            <td className="bg-secondary hidden lg:table-cell">
                              <div className="skeleton h-2 w-32"></div>
                            </td>
                            <td className="bg-secondary rounded-r-[12px] w-1/6">
                              <div className="flex space-x-2 justify-end">
                                <button
                                  className="btn btn-md btn-outline btn-square btn-info"
                                  disabled
                                >
                                  <PiInfo className="w-7 h-7 text-current opacity-50" />
                                </button>
                                <button
                                  className="btn btn-md btn-outline btn-square btn-primary"
                                  disabled
                                >
                                  <MemberIcon className="w-7 h-7 text-current opacity-50" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                    : paginatedGroups.map((group, index) => (
                        <GroupRow
                          key={index}
                          group={group}
                          proposals={
                            group.policies &&
                            group.policies.length > 0 &&
                            proposals[group.policies[0].address]
                              ? proposals[group.policies[0].address]
                              : []
                          }
                          onSelectGroup={handleSelectGroup}
                          activeMemberModalId={activeMemberModalId}
                          setActiveMemberModalId={setActiveMemberModalId}
                          activeInfoModalId={activeInfoModalId}
                          setActiveInfoModalId={setActiveInfoModalId}
                        />
                      ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div
                  className="flex items-center justify-center gap-2"
                  onClick={e => e.stopPropagation()}
                  role="navigation"
                  aria-label="Pagination"
                >
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setCurrentPage(prev => Math.max(1, prev - 1));
                    }}
                    disabled={currentPage === 1 || isLoading}
                    className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    ‹
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={e => {
                            e.stopPropagation();
                            setCurrentPage(pageNum);
                          }}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-black dark:text-white
                            ${currentPage === pageNum ? 'bg-[#0000001A] dark:bg-[#FFFFFF1A]' : 'hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A]'}`}
                          aria-label={`Page ${pageNum}`}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return (
                        <span key={pageNum} aria-hidden="true">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    }}
                    disabled={currentPage === totalPages || isLoading}
                    className="p-2 hover:bg-[#0000001A] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6  w-full justify-center md:hidden block">
            <Link href="/groups/create" passHref>
              <button className="btn btn-gradient w-full h-[52px] text-white rounded-[12px]">
                Create New Group
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Group Proposals Section */}
      <div
        className={`absolute inset-0 transition-transform duration-300 ${
          selectedGroup ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedGroup && (
          <GroupProposals
            policyAddress={selectedGroup.policyAddress}
            groupName={selectedGroup.name}
            onBack={handleBack}
            policyThreshold={selectedGroup.threshold}
            isLoading={isLoadingGroupInfo}
            currentPage={currentPageGroupInfo}
            setCurrentPage={setCurrentPageGroupInfo}
            sendTxs={sendTxs}
            totalPages={totalPagesGroupInfo}
            txLoading={txLoading}
            isError={isError}
            balances={combinedBalances}
            refetchBalances={resolveRefetch}
            refetchHistory={refetchHistory}
            pageSize={pageSizeGroupInfo}
            skeletonGroupCount={skeletonGroupCount}
            skeletonTxCount={skeletonTxCount}
          />
        )}
      </div>

      {/* Render modals outside table structure */}
      {filteredGroups.map((group, index) => (
        <React.Fragment key={`modals-${index}`}>
          <GroupInfo
            modalId={`group-info-modal-${group.id}`}
            group={group}
            address={address ?? ''}
            policyAddress={group.policies[0]?.address ?? ''}
            onUpdate={refetch}
            showInfoModal={activeInfoModalId === group.id.toString()}
            setShowInfoModal={show => setActiveInfoModalId(show ? group.id.toString() : null)}
          />
          <MemberManagementModal
            modalId={`member-management-modal-${group.id}`}
            members={group.members.map(member => ({
              ...member.member,
              address: member?.member?.address || '',
              weight: member?.member?.weight || '0',
              metadata: member?.member?.metadata || '',
              added_at: member?.member?.added_at || new Date(),
              isCoreMember: true,
              isActive: true,
              isAdmin: member?.member?.address === group.admin,
              isPolicyAdmin: member?.member?.address === group.policies[0]?.admin,
            }))}
            groupId={group.id.toString()}
            groupAdmin={group.admin}
            policyAddress={group.policies[0]?.address ?? ''}
            address={address ?? ''}
            onUpdate={refetch}
            setShowMemberManagementModal={show =>
              setActiveMemberModalId(show ? group.id.toString() : null)
            }
            showMemberManagementModal={activeMemberModalId === group.id.toString()}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

function GroupRow({
  group,
  proposals,
  onSelectGroup,
  activeMemberModalId,
  setActiveMemberModalId,
  activeInfoModalId,
  setActiveInfoModalId,
}: {
  group: ExtendedQueryGroupsByMemberResponseSDKType['groups'][0];
  proposals: ProposalSDKType[];
  onSelectGroup: (policyAddress: string, groupName: string, threshold: string) => void;
  activeMemberModalId: string | null;
  setActiveMemberModalId: (id: string | null) => void;
  activeInfoModalId: string | null;
  setActiveInfoModalId: (id: string | null) => void;
}) {
  const policyAddress = (group.policies && group.policies[0]?.address) || '';
  const groupName = group.ipfsMetadata?.title || 'Untitled Group';

  const filterActiveProposals = (proposals: ProposalSDKType[]) => {
    return proposals?.filter(
      proposal =>
        proposal.status.toString() !== 'PROPOSAL_STATUS_REJECTED' &&
        proposal.status.toString() !== 'PROPOSAL_STATUS_WITHDRAWN'
    );
  };
  const activeProposals = filterActiveProposals(proposals);

  const { balance } = useBalance(policyAddress);

  const openInfoModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveInfoModalId(group.id.toString());
  };

  const openMemberModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMemberModalId(group.id.toString());
  };

  return (
    <tr
      className="group text-black dark:text-white rounded-lg cursor-pointer"
      onClick={e => {
        e.stopPropagation();
        onSelectGroup(
          policyAddress,
          groupName,
          (group.policies &&
            (group.policies[0]?.decision_policy as ThresholdDecisionPolicySDKType)?.threshold) ??
            '0'
        );
      }}
      tabIndex={0}
      role="button"
      aria-label={`Select ${groupName} group`}
    >
      <td className="bg-secondary group-hover:bg-base-300 rounded-l-[12px] w-1/6">
        <div className="flex items-center space-x-3">
          <ProfileAvatar walletAddress={policyAddress} />
          <span className="font-medium">{truncateString(groupName, 24)}</span>
        </div>
      </td>
      <td className="bg-secondary group-hover:bg-base-300 hidden xl:table-cell w-1/6">
        {activeProposals.length > 0 ? (
          <span className="badge badge-primary badge-sm text-neutral-content">
            {activeProposals.length}
          </span>
        ) : (
          '-'
        )}
      </td>
      <td className="bg-secondary group-hover:bg-base-300 hidden sm:table-cell w-1/6">
        {Number(shiftDigits(balance?.amount ?? '0', -6)).toLocaleString(undefined, {
          maximumFractionDigits: 6,
        })}{' '}
        MFX
      </td>
      <td className="bg-secondary group-hover:bg-base-300 hidden xl:table-cell w-1/6">
        {`${(group.policies?.[0]?.decision_policy as ThresholdDecisionPolicySDKType)?.threshold ?? '0'} / ${group.total_weight ?? '0'}`}
      </td>
      <td className="bg-secondary group-hover:bg-base-300 hidden lg:table-cell w-1/6">
        <div onClick={e => e.stopPropagation()}>
          <TruncatedAddressWithCopy address={policyAddress} slice={12} />
        </div>
      </td>
      <td className="bg-secondary group-hover:bg-base-300 rounded-r-[12px] sm:rounded-l-none w-1/6">
        <div className="flex space-x-2 justify-end">
          <button
            className="btn btn-md bg-base-300 text-primary btn-square group-hover:bg-secondary hover:outline hover:outline-primary hover:outline-1 outline-none"
            onClick={openInfoModal}
            aria-label={`View info for ${groupName}`}
          >
            <PiInfo className="w-7 h-7 text-current" />
          </button>
          <button
            className="btn btn-md bg-base-300 text-primary btn-square group-hover:bg-secondary hover:outline hover:outline-primary hover:outline-1 outline-none"
            onClick={openMemberModal}
            aria-label={`Manage members for ${groupName}`}
          >
            <MemberIcon className="w-7 h-7 text-current" />
          </button>
        </div>
      </td>
    </tr>
  );
}
