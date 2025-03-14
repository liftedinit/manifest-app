import { useChain } from '@cosmos-kit/react';
import { Tab } from '@headlessui/react';
import {
  ProposalSDKType,
  ProposalStatus,
  proposalStatusToJSON,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { HistoryBox, TokenList } from '@/components';
import { TxMessage } from '@/components/bank/types';
import DenomList from '@/components/factory/components/DenomList';
import { GroupProposals } from '@/components/groups/components/Proposals';
import { ArrowRightIcon } from '@/components/icons';
import env from '@/config/env';
import useIsMobile from '@/hooks/useIsMobile';
import { ExtendedGroupType, useProposalsByPolicyAccount } from '@/hooks/useQueries';
import { useResponsivePageSize } from '@/hooks/useResponsivePageSize';
import { group as groupSchema } from '@/schemas';
import { CombinedBalanceInfo, ExtendedMetadataSDKType } from '@/utils';
import { ProfileAvatar } from '@/utils/identicon';

type GroupControlsProps = {
  group: ExtendedGroupType;
  onBack: () => void;
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  sendTxs: TxMessage[];
  totalPages: number;
  txLoading: boolean;
  isError: boolean;
  balances: CombinedBalanceInfo[];
  denoms: ExtendedMetadataSDKType[];
  pageSize: number;
  skeletonGroupCount: number;
  skeletonTxCount: number;
  proposalPageSize?: number;
};

const TAB_SLUGS = ['proposals', 'assets', 'activity', 'tokens'];

export default function GroupControls({
  group,
  onBack,
  isLoading,
  currentPage,
  setCurrentPage,
  sendTxs,
  totalPages,
  txLoading,
  isError,
  balances,
  denoms,
  pageSize,
  skeletonGroupCount,
  skeletonTxCount,
  proposalPageSize = 10,
}: GroupControlsProps) {
  const policyAddress = group?.policies?.[0]?.address ?? '';

  const isMobile = useIsMobile();
  const { proposals, isProposalsLoading, isProposalsError } =
    useProposalsByPolicyAccount(policyAddress);

  const [activeTab, setActiveTabInner] = useState(0);

  // We need to compare strings here
  const filterProposals = (proposals: ProposalSDKType[]) => {
    return proposals.filter(
      proposal =>
        proposal.status.toString() !==
          proposalStatusToJSON(ProposalStatus.PROPOSAL_STATUS_REJECTED) &&
        proposal.status.toString() !==
          proposalStatusToJSON(ProposalStatus.PROPOSAL_STATUS_WITHDRAWN)
    );
  };

  const router = useRouter();

  const setActiveTab = useCallback(
    (tab: number) => {
      setActiveTabInner(tab);
      router.push(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            tab: TAB_SLUGS[tab],
          },
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  useEffect(() => {
    const { tab } = router.query;
    const maybeIndex = TAB_SLUGS.indexOf(tab as string);
    setActiveTabInner(maybeIndex === -1 ? 0 : maybeIndex);
  }, [router.query]);

  const groupName = useMemo(() => {
    const metadata = groupSchema.metadataFromJson(group.metadata, false);
    return metadata?.title ?? 'Untitled Group';
  }, [group.metadata]);

  const { address } = useChain(env.chain);

  const filteredProposals = filterProposals(proposals);

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
      sizes: { proposals: 8 },
    },
    {
      height: 1300,
      width: Infinity,
      sizes: { proposals: 12 },
    },
  ];

  const defaultSizes = { proposals: proposalPageSize };
  const responsivePageSize = useResponsivePageSize(sizeLookup, defaultSizes);
  const proposalPageSizes = isMobile ? { proposals: 7 } : responsivePageSize;

  // Calculate total pages for proposals
  const totalProposalPages = Math.max(
    1,
    Math.ceil(filteredProposals.length / proposalPageSizes.proposals)
  );

  useEffect(() => {
    // Adjust the current page if the number of proposals changes
    if (proposalCurrentPage > totalProposalPages) {
      setProposalCurrentPage(totalProposalPages);
    }
  }, [filteredProposals.length, totalProposalPages, proposalCurrentPage]);

  return (
    <div className="">
      <div className="flex w-full h-full md:flex-row flex-col md:gap-8">
        <div className="flex flex-col w-full md:w-[48%] h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="btn btn-circle rounded-[12px] bg-secondary btn-md focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
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

      <Tab.Group defaultIndex={activeTab} onChange={tab => setActiveTab(tab)}>
        <Tab.List className="flex flex-row tabs tabs-border tabs-lg">
          <Tab className="font-bold tab ui-selected:tab-active focus:outline-1 focus:outline-primary focus:-outline-offset-1">
            Proposals
          </Tab>
          <Tab className="font-bold tab ui-selected:tab-active focus:outline-1 focus:outline-primary focus:-outline-offset-1">
            Assets
          </Tab>
          <Tab className="font-bold tab ui-selected:tab-active focus:outline-1 focus:outline-primary focus:-outline-offset-1">
            Activity
          </Tab>
          <Tab className="font-bold tab ui-selected:tab-active focus:outline-1 focus:outline-primary focus:-outline-offset-1">
            Tokens
          </Tab>
        </Tab.List>

        <Tab.Panels className="mt-4">
          <Tab.Panel>
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
              <GroupProposals
                group={group}
                proposals={filteredProposals.slice(
                  (proposalCurrentPage - 1) * proposalPageSizes.proposals,
                  proposalCurrentPage * proposalPageSizes.proposals
                )}
              />
            ) : (
              <div className="text-center py-8 text-gray-500" role="status">
                No proposal was found.
              </div>
            )}
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
          </Tab.Panel>

          <Tab.Panel>
            <TokenList
              balances={balances}
              isLoading={isLoading}
              address={address ?? ''}
              pageSize={pageSize}
              isGroup={true}
              admin={policyAddress}
            />
          </Tab.Panel>

          <Tab.Panel>
            <HistoryBox
              isLoading={isLoading}
              address={policyAddress}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              sendTxs={sendTxs}
              totalPages={totalPages}
              txLoading={txLoading}
              isError={isError}
              skeletonGroupCount={skeletonGroupCount}
              skeletonTxCount={skeletonTxCount}
            />
          </Tab.Panel>

          <Tab.Panel className="-mt-7">
            <DenomList
              denoms={denoms}
              isLoading={isLoading}
              address={address ?? ''}
              admin={policyAddress}
              pageSize={pageSize - 1}
              isGroup={true}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
