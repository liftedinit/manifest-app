import { useChain } from '@cosmos-kit/react';
import {
  ProposalSDKType,
  ThresholdDecisionPolicySDKType,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { PiInfo } from 'react-icons/pi';

import { GroupInfo, MemberManagementModal } from '@/components';
import { MemberIcon, SearchIcon } from '@/components/icons';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import env from '@/config/env';
import useIsMobile from '@/hooks/useIsMobile';
import {
  ExtendedGroupType,
  ExtendedQueryGroupsByMemberResponseSDKType,
  useBalance,
  useGetMessagesFromAddress,
  useTokenBalances,
  useTokenBalancesResolved,
  useTokenFactoryDenomsFromAdmin,
  useTokenFactoryDenomsMetadata,
  useTotalSupply,
} from '@/hooks/useQueries';
import { useResponsivePageSize } from '@/hooks/useResponsivePageSize';
import { group as groupSchema } from '@/schemas';
import {
  CombinedBalanceInfo,
  ExtendedMetadataSDKType,
  MFX_TOKEN_BASE,
  MFX_TOKEN_DATA,
  denomToAsset,
  shiftDigits,
  truncateString,
  unsafeConvertTokenBase,
} from '@/utils';
import ProfileAvatar from '@/utils/identicon';

import GroupControls from './groupControls';

// Add this interface outside the component
interface PageSizeConfig {
  groupInfo: number;
  groupEntries: number;
  history: number;
  skeleton: number;
}

export default React.memo(function YourGroups({
  groups,
  proposals,
  isLoading,
  refetch,
}: {
  groups: ExtendedQueryGroupsByMemberResponseSDKType;
  proposals: { [policyAddress: string]: ProposalSDKType[] };
  isLoading: boolean;
  refetch: () => Promise<unknown>;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();

  const sizeLookup: Array<{ height: number; width: number; sizes: PageSizeConfig }> = [
    {
      height: 700,
      width: Infinity,
      sizes: { groupInfo: 4, groupEntries: 2, history: 4, skeleton: 5 },
    },
    {
      height: 800,
      width: Infinity,
      sizes: { groupInfo: 5, groupEntries: 3, history: 5, skeleton: 7 },
    },
    {
      height: 1000,
      width: 800,
      sizes: { groupInfo: 7, groupEntries: 6, history: 7, skeleton: 7 },
    },
    {
      height: 1000,
      width: Infinity,
      sizes: { groupInfo: 7, groupEntries: 6, history: 5, skeleton: 7 },
    },
    {
      height: 1300,
      width: Infinity,
      sizes: { groupInfo: 9, groupEntries: 9, history: 7, skeleton: 9 },
    },
  ];

  const defaultSizes = { groupInfo: 10, groupEntries: 10, history: 10, skeleton: 10 };
  const responsivePageSize = useResponsivePageSize(sizeLookup, defaultSizes);

  const pageSize = isMobile
    ? { groupInfo: 4, groupEntries: 4, history: 3, skeleton: 4 }
    : responsivePageSize;

  const pageSizeGroupInfo = pageSize.groupInfo;
  const pageSizeHistory = pageSize.history;
  const skeletonGroupCount = 1;
  const skeletonTxCount = pageSize.skeleton;

  const [selectedGroup, setSelectedGroup] = useState<ExtendedGroupType | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState<string>('Untitled Group');

  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useChain(env.chain);

  const filteredGroups = groups.groups.filter(group => {
    try {
      const metadata = group.metadata ? JSON.parse(group.metadata) : null;
      const groupTitle = metadata?.title || 'Untitled Group';
      return groupTitle.toLowerCase().includes(searchTerm.toLowerCase());
    } catch (e) {
      // console.warn('Failed to parse group metadata:', e);
      return 'Untitled Group'.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  const totalPages = Math.ceil(filteredGroups.length / pageSize.groupInfo);

  const paginatedGroupEntries = filteredGroups.slice(
    (currentPage - 1) * pageSize.groupEntries,
    currentPage * pageSize.groupEntries
  );

  useEffect(() => {
    // Check if there's a policy address in the URL on component mount
    const policyAddress = searchParams.get('policyAddress');

    if (policyAddress) {
      const group = groups.groups.find(g => g.policies?.[0]?.address === policyAddress);
      if (group) {
        let groupName = 'Untitled Group';
        try {
          const metadata = group.metadata ? JSON.parse(group.metadata) : null;
          groupName = metadata?.title ?? 'Untitled Group';
        } catch (e) {
          // If JSON parsing fails, fall back to default name
          // console.warn('Failed to parse group metadata:', e);
        }

        setSelectedGroupName(groupName);
        setSelectedGroup(group);
      } else {
        // Group not found, reset selected group.
        setSelectedGroup(null);
        router.push('/groups', undefined, { shallow: true });
      }
    }
  }, [searchParams, groups.groups, router]);

  useEffect(() => {
    // Scroll to top when a group is selected
    if (selectedGroup) {
      window.scrollTo(0, 0);
    }
  }, [selectedGroup]);

  const handleSelectGroup = (group: ExtendedGroupType) => {
    let groupName = 'Untitled Group';
    try {
      const metadata = groupSchema.metadataFromJson(group.metadata, false);
      groupName = metadata?.title ?? 'Untitled Group';
    } catch (e) {
      // If JSON parsing fails, fall back to default name
      console.warn('Failed to parse group metadata:', e);
    }
    setSelectedGroupName(groupName);
    setSelectedGroup(group);
    router.push(`/groups?policyAddress=${group.policies[0]?.address}`, undefined, {
      shallow: true,
    });
  };

  const handleBack = () => {
    setSelectedGroupName('Untitled Group');
    setSelectedGroup(null);
    router.push('/groups', undefined, { shallow: true });
  };

  const { balances, isBalancesLoading, refetchBalances } = useTokenBalances(
    selectedGroup?.policies[0]?.address ?? ''
  );

  // console.log(`${selectedGroup?.policies[0]?.address} balances`, balances);
  const {
    balances: resolvedBalances,
    isBalancesLoading: resolvedLoading,
    refetchBalances: resolveRefetch,
  } = useTokenBalancesResolved(address ?? '');

  const { metadatas, isMetadatasLoading, isMetadatasError, refetchMetadatas } =
    useTokenFactoryDenomsMetadata();
  const [currentPageGroupInfo, setCurrentPageGroupInfo] = useState(1);

  const {
    sendTxs,
    totalPages: totalPagesGroupInfo,
    isLoading: txLoading,
    isError,
    refetch: refetchHistory,
  } = useGetMessagesFromAddress(
    env.indexerUrl,
    selectedGroup?.policies[0]?.address ?? '',
    currentPageGroupInfo,
    pageSizeHistory
  );

  const { denoms, isDenomsLoading, isDenomsError, refetchDenoms } = useTokenFactoryDenomsFromAdmin(
    selectedGroup?.policies[0]?.address ?? ''
  );
  const { totalSupply, isTotalSupplyLoading, refetchTotalSupply } = useTotalSupply();

  const refetchData = () => {
    return Promise.all([
      refetchDenoms(),
      refetchMetadatas(),
      refetchBalances(),
      refetchTotalSupply(),
    ]);
  };

  const combinedData = useMemo(() => {
    if (denoms?.denoms && metadatas?.metadatas && balances && totalSupply) {
      const otherTokens = denoms.denoms
        .filter(denom => denom !== 'umfx')
        .map((denom: string) => {
          const metadata = metadatas.metadatas.find(meta => meta.base === denom);
          const balance = balances.find(bal => bal.denom === denom);
          const supply = totalSupply.find(supply => supply.denom === denom);
          return metadata
            ? {
                ...metadata,
                balance: balance?.amount || '0',
                totalSupply: supply?.amount || '0',
              }
            : null;
        })
        .filter((meta): meta is ExtendedMetadataSDKType => meta !== null);

      return [...otherTokens];
    }
    return [];
  }, [denoms, metadatas, balances, totalSupply]);

  const combinedBalances = useMemo(() => {
    if (!balances || !resolvedBalances || !metadatas) return [];

    // Find 'umfx' balance (mfx token)
    const mfxCoreBalance = balances.find(b => b.denom === 'umfx');
    const mfxResolvedBalance = resolvedBalances.find(rb => rb.denom === 'umfx');

    // Create combined balance for 'mfx'
    const mfxCombinedBalance: CombinedBalanceInfo | null = mfxCoreBalance
      ? {
          display: mfxResolvedBalance?.denom || 'mfx',
          base: MFX_TOKEN_BASE,
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

        if (coreBalance.denom.startsWith('ibc/')) {
          const assetInfo = denomToAsset(env.chain, coreBalance.denom);

          let baseDenom = '';
          if (assetInfo?.traces && assetInfo.traces.length > 1) {
            baseDenom = assetInfo.traces[1]?.counterparty?.base_denom ?? '';
          }

          return {
            display: baseDenom ?? '', // normalized denom (e.g., 'umfx')
            base: unsafeConvertTokenBase(coreBalance.denom), // full IBC trace
            amount: coreBalance.amount,
            metadata: {
              description: assetInfo?.description ?? '',
              denom_units:
                assetInfo?.denom_units?.map(unit => ({
                  ...unit,
                  aliases: unit.aliases || [],
                })) ?? [],
              base: assetInfo?.base ?? '',
              display: assetInfo?.display ?? '',
              name: assetInfo?.name ?? '',
              symbol: assetInfo?.symbol ?? '',
              uri: assetInfo?.logo_URIs?.svg ?? assetInfo?.logo_URIs?.png ?? '',
              uri_hash: assetInfo?.logo_URIs?.svg ?? assetInfo?.logo_URIs?.png ?? '',
            },
          };
        }

        // TODO: move this code to a `CombinedBalanceInfo` factory function.
        return {
          display: resolvedBalance?.denom || coreBalance.denom,
          base: unsafeConvertTokenBase(metadata?.base ?? coreBalance.denom),
          amount: coreBalance.amount,
          metadata: metadata || null,
        };
      });

    // Combine 'mfx' with other balances
    return mfxCombinedBalance ? [mfxCombinedBalance, ...otherBalances] : otherBalances;
  }, [balances, resolvedBalances, metadatas]);

  const isLoadingGroupInfo =
    isBalancesLoading ||
    resolvedLoading ||
    isMetadatasLoading ||
    isDenomsLoading ||
    isTotalSupplyLoading;

  return (
    <div className="relative w-full h-screen overflow-x-hidden scrollbar-hide ">
      <div
        className={`absolute inset-0 transition-transform duration-300 ${
          selectedGroup ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col gap-4 mb-4 p-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              <h1
                className="text-secondary-content"
                style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
              >
                Groups
              </h1>
              <div className="relative w-full sm:w-[224px]">
                <input
                  type="text"
                  placeholder="Search for a group..."
                  className="input input-bordered w-full h-[40px] rounded-[12px] border-none bg-secondary text-secondary-content pl-10 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  aria-label="input-search-term"
                />
                <SearchIcon className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="overflow-auto">
            <div className="max-w-8xl mx-auto">
              <table
                className="table w-full border-separate border-spacing-y-3"
                aria-label="table-proposals"
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
                                <div className="skeleton w-11 h-11 rounded-md shrink-0"></div>
                                <div className="skeleton h-3 w-24"></div>
                              </div>
                            </td>
                            <td className="bg-secondary hidden xl:table-cell">
                              <div className="skeleton h-2 w-8"></div>
                            </td>
                            <td className="bg-secondary hidden sm:table-cell ">
                              <div className="skeleton h-2 w-16"></div>
                            </td>
                            <td className="bg-secondary hidden xl:table-cell">
                              <div className="skeleton h-2 w-20"></div>
                            </td>
                            <td className="bg-secondary hidden lg:table-cell">
                              <div className="skeleton h-2 w-32"></div>
                            </td>
                            <td className="bg-secondary rounded-r-[12px] w-1/6 hidden xs:table-cell">
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
                    : paginatedGroupEntries.map((group, index) => (
                        <GroupRow
                          address={address}
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
                          refetch={refetch}
                        />
                      ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex item-center justify-between">
            <Link href="/groups/create" passHref aria-label="btn-create-new-group">
              <button className="btn btn-gradient w-[224px] h-[52px] hidden md:block text-white rounded-[12px] focus:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                Create New Group
              </button>
            </Link>
            {totalPages > 1 && (
              <div
                className="flex items-center justify-end gap-2"
                onClick={e => e.stopPropagation()}
                role="navigation"
                aria-label="pagination"
              >
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setCurrentPage(prev => Math.max(1, prev - 1));
                  }}
                  disabled={currentPage === 1 || isLoading}
                  aria-label="btn-previous-page"
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
                        aria-label={`btn-page-${pageNum}`}
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
                  aria-label="btn-next-page"
                >
                  ›
                </button>
              </div>
            )}
          </div>
          <div className="mt-6 w-full justify-center md:hidden block">
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
          <GroupControls
            policyAddress={selectedGroup.policies[0]?.address ?? ''}
            groupName={selectedGroupName}
            onBack={handleBack}
            policyThreshold={
              (selectedGroup.policies[0]?.decision_policy as ThresholdDecisionPolicySDKType)
                ?.threshold ?? '0'
            }
            isLoading={isLoadingGroupInfo}
            currentPage={currentPageGroupInfo}
            setCurrentPage={setCurrentPageGroupInfo}
            sendTxs={sendTxs}
            totalPages={totalPagesGroupInfo}
            txLoading={txLoading}
            isError={isError}
            balances={combinedBalances}
            denoms={combinedData}
            denomLoading={isDenomsLoading}
            isDenomError={isDenomsError}
            refetchBalances={resolveRefetch}
            refetchHistory={refetchHistory}
            refetchDenoms={refetchData}
            refetchGroupInfo={refetch}
            pageSize={pageSizeGroupInfo}
            skeletonGroupCount={skeletonGroupCount}
            skeletonTxCount={skeletonTxCount}
          />
        )}
      </div>
    </div>
  );
});

const GroupRow = React.memo(function GroupRow({
  address,
  group,
  proposals,
  onSelectGroup,
  refetch,
}: {
  address: string | undefined;
  group: ExtendedQueryGroupsByMemberResponseSDKType['groups'][0];
  proposals: ProposalSDKType[];
  onSelectGroup: (group: ExtendedGroupType) => void;
  refetch: () => Promise<unknown>;
}) {
  const [showInfo, setShowInfo] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const policyAddress = (group.policies && group.policies[0]?.address) || '';
  let groupName = 'Untitled Group';
  try {
    const metadata = group.metadata ? JSON.parse(group.metadata) : null;
    groupName = metadata?.title || 'Untitled Group';
  } catch (e) {
    // console.warn('Failed to parse group metadata:', e);
  }
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
    setShowInfo(true);
  };

  const openMemberModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMembers(true);
  };

  return (
    <>
      <tr
        className="group text-black dark:text-white rounded-lg cursor-pointer"
        onClick={() => onSelectGroup(group)}
        tabIndex={0}
        role="button"
        aria-label={`row-${groupName}`}
      >
        <td className="bg-secondary group-hover:bg-base-300 rounded-l-[12px] w-1/6">
          <div className="items-center space-x-3 hidden xs:flex">
            <ProfileAvatar walletAddress={policyAddress} />
            <span className="font-medium">{truncateString(groupName, 24)}</span>
          </div>
          <div className="items-center flex xs:hidden block">
            <ProfileAvatar walletAddress={policyAddress} />
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
            <TruncatedAddressWithCopy address={policyAddress} />
          </div>
        </td>
        <td className="bg-secondary group-hover:bg-base-300 rounded-r-[12px] sm:rounded-l-none w-1/6">
          <div className="flex space-x-2 justify-end">
            <div
              className="tooltip tooltip-left tooltip-primary hover:after:delay-1000 hover:before:delay-1000"
              data-tip="Group Details"
            >
              <button
                className="btn btn-md bg-base-300 text-primary btn-square group-hover:bg-secondary hover:outline hover:outline-primary hover:outline-1 outline-none"
                onClick={openInfoModal}
                aria-label="btn-group-details"
              >
                <PiInfo className="w-7 h-7 text-current" />
              </button>
            </div>
            <div
              className="tooltip tooltip-left tooltip-primary hover:after:delay-1000 hover:before:delay-1000"
              data-tip="Manage Members"
            >
              <button
                className="btn btn-md bg-base-300 text-primary btn-square group-hover:bg-secondary hover:outline hover:outline-primary hover:outline-1 outline-none"
                onClick={openMemberModal}
                aria-label="btn-group-members"
              >
                <MemberIcon className="w-7 h-7 text-current" />
              </button>
            </div>
          </div>
        </td>

        {showInfo && (
          <GroupInfo
            group={group}
            address={address ?? ''}
            policyAddress={group.policies[0]?.address ?? ''}
            onUpdate={refetch}
            showInfoModal={showInfo}
            setShowInfoModal={show => setShowInfo(show)}
          />
        )}

        {showMembers && (
          <MemberManagementModal
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
            setShowMemberManagementModal={show => setShowMembers(show)}
            showMemberManagementModal={showMembers}
          />
        )}
      </tr>
    </>
  );
});
