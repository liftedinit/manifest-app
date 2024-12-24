import { WalletNotConnected, HistoryBox, SearchIcon } from '@/components';
import { TokenList } from '@/components/bank/components/tokenList';
import {
  useGetFilteredTxAndSuccessfulProposals,
  useIsMobile,
  useTokenBalances,
  useTokenBalancesResolved,
  useTokenFactoryDenomsMetadata,
} from '@/hooks';
import { useChain } from '@cosmos-kit/react';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { BankIcon } from '@/components/icons';
import { CombinedBalanceInfo } from '@/utils/types';
import { MFX_TOKEN_DATA } from '@/utils/constants';
import env from '@/config/env';
import { SEO } from '@/utils';

export default function Bank() {
  const { address, isWalletConnected } = useChain(env.chain);
  const { balances, isBalancesLoading, refetchBalances } = useTokenBalances(address ?? '');
  const {
    balances: resolvedBalances,
    isBalancesLoading: resolvedLoading,
    refetchBalances: resolveRefetch,
  } = useTokenBalancesResolved(address ?? '');

  const { metadatas, isMetadatasLoading } = useTokenFactoryDenomsMetadata();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('assets');

  const isMobile = useIsMobile();
  const [pageSize, setPageSize] = useState({
    tokenList: 8,
    history: 7,
    skeleton: 9,
  });

  const updatePageSizes = useCallback(() => {
    const height = window.innerHeight;

    // Small screens (mobile)
    if (height < 700) {
      setPageSize({
        tokenList: 5,
        history: 4,
        skeleton: 5,
      });
      return;
    }

    // Adjust based on height for larger screens
    if (height < 800) {
      setPageSize({
        tokenList: 6,
        history: 5,
        skeleton: 7,
      });
    } else if (height < 1300) {
      setPageSize({
        tokenList: 8,
        history: 7,
        skeleton: 9,
      });
    } else {
      // For very tall screens
      setPageSize({
        tokenList: 10,
        history: 9,
        skeleton: 11,
      });
    }
  }, []);

  useEffect(() => {
    updatePageSizes();
    window.addEventListener('resize', updatePageSizes);
    return () => window.removeEventListener('resize', updatePageSizes);
  }, [updatePageSizes]);

  const skeletonGroupCount = 1;
  const skeletonTxCount = pageSize.skeleton;
  const tokenListPageSize = pageSize.tokenList;
  const historyPageSize = pageSize.history;

  const {
    sendTxs,
    totalPages,
    isLoading: txLoading,
    isError,
    refetch: refetchHistory,
  } = useGetFilteredTxAndSuccessfulProposals(
    env.indexerUrl,
    address ?? '',
    currentPage,
    historyPageSize
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

  const isLoading = isBalancesLoading || resolvedLoading || isMetadatasLoading;
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen relative px-2 lg:py-0 py-4 mx-auto text-white">
      <SEO title="Bank - Alberto" />

      <div className="flex-grow h-full animate-fadeIn transition-all duration-300">
        <div className="w-full mx-auto">
          {!isWalletConnected ? (
            <WalletNotConnected
              description="Use the button below to connect your wallet and start interacting with your tokens."
              icon={<BankIcon className="h-60 w-60 text-primary" />}
            />
          ) : (
            <div className="relative w-full h-full overflow-hidden scrollbar-hide p-1">
              <div className="h-full flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                    <h1
                      className="text-secondary-content"
                      style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
                    >
                      Bank
                    </h1>
                    <div className="relative w-full sm:w-[224px]">
                      <input
                        type="text"
                        placeholder="Search for an asset ..."
                        className="input input-bordered w-full h-[40px] rounded-[12px] border-none bg-secondary text-secondary-content pl-10 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                      <SearchIcon className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div role="tablist" className="tabs tabs-bordered tabs-lg flex flex-row">
                  <button
                    role={'tab'}
                    className={`font-bold tab ${activeTab === 'assets' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('assets')}
                  >
                    Assets
                  </button>
                  <button
                    role={'tab'}
                    className={`font-bold tab ${activeTab === 'history' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('history')}
                  >
                    Activity
                  </button>
                </div>

                <div className="flex flex-col w-full mt-4">
                  {activeTab === 'assets' && (
                    <TokenList
                      refetchBalances={refetchBalances || resolveRefetch}
                      isLoading={isLoading}
                      balances={combinedBalances}
                      refetchHistory={refetchHistory}
                      address={address ?? ''}
                      pageSize={tokenListPageSize}
                      searchTerm={searchTerm}
                    />
                  )}
                  {activeTab === 'history' && (
                    <HistoryBox
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      address={address ?? ''}
                      isLoading={isLoading}
                      sendTxs={sendTxs}
                      totalPages={totalPages}
                      txLoading={txLoading}
                      isError={isError}
                      refetch={refetchHistory}
                      skeletonGroupCount={skeletonGroupCount}
                      skeletonTxCount={skeletonTxCount}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
