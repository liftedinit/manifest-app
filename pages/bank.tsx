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
import Head from 'next/head';
import React, { useMemo, useState } from 'react';
import { BankIcon } from '@/components/icons';
import { CombinedBalanceInfo } from '@/utils/types';
import { MFX_TOKEN_DATA } from '@/utils/constants';
import env from '@/config/env';

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
  const pageSize = isMobile ? 4 : 9;

  const skeletonGroupCount = 1;
  const skeletonTxCount = isMobile ? 5 : 9;

  const {
    sendTxs,
    totalPages,
    isLoading: txLoading,
    isError,
    refetch: refetchHistory,
  } = useGetFilteredTxAndSuccessfulProposals(env.indexerUrl, address ?? '', currentPage, pageSize);

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

  return (
    <>
      <div className="min-h-screen relative py-4 px-2 mx-auto text-white">
        <Head>
          <title>Bank - Alberto</title>
        </Head>

        <div className="flex-grow h-full animate-fadeIn transition-all duration-300">
          <div className="w-full mx-auto">
            {!isWalletConnected ? (
              <WalletNotConnected
                description="Use the button below to connect your wallet and start interacting with your tokens."
                icon={<BankIcon className="h-60 w-60 text-primary" />}
              />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                  <h1
                    className="text-secondary-content"
                    style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
                  >
                    Bank
                  </h1>
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
                      pageSize={pageSize}
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
