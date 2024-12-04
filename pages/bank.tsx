import { WalletNotConnected } from '@/components';

import TokenList from '@/components/bank/components/tokenList';
import { chainName } from '@/config';
import {
  useGetFilteredTxAndSuccessfulProposals,
  useTokenBalances,
  useTokenBalancesResolved,
  useTokenFactoryDenomsMetadata,
} from '@/hooks';

import { useChain } from '@cosmos-kit/react';
import Head from 'next/head';
import React, { useMemo, useState } from 'react';
import { HistoryBox } from '@/components';
import { BankIcon } from '@/components/icons';
import { CombinedBalanceInfo } from '@/utils/types';
import { MFX_TOKEN_DATA } from '@/utils/constants';
import { useEndpointStore } from '@/store/endpointStore'; // Import MFX_TOKEN_DATA

export default function Bank() {
  const { address, isWalletConnected } = useChain(chainName);
  const { balances, isBalancesLoading, refetchBalances } = useTokenBalances(address ?? '');
  const {
    balances: resolvedBalances,
    isBalancesLoading: resolvedLoading,
    refetchBalances: resolveRefetch,
  } = useTokenBalancesResolved(address ?? '');

  const { selectedEndpoint } = useEndpointStore();
  const indexerUrl = selectedEndpoint?.indexer || '';

  const { metadatas, isMetadatasLoading } = useTokenFactoryDenomsMetadata();
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  const {
    sendTxs,
    totalPages,
    isLoading: txLoading,
    isError,
    refetch: refetchHistory,
  } = useGetFilteredTxAndSuccessfulProposals(indexerUrl, address ?? '', currentPage, pageSize);

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
      <div className="min-h-screen relative px-2 mx-auto text-white mt-12 md:mt-0">
        <Head>
          <title>Bank - Alberto</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="Alberto is the gateway to the Manifest Network" />
          <meta
            name="keywords"
            content="crypto, blockchain, application, Cosmos-SDK, Alberto, Manifest Network"
          />
          <meta name="author" content="Chandra Station" />
          <link rel="icon" href="/favicon.ico" />

          <meta property="og:title" content="Bank - Alberto" />
          <meta
            property="og:description"
            content="Alberto is the gateway to the Manifest Network"
          />
          <meta property="og:url" content="https://" />
          <meta property="og:image" content="https://" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Alberto" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Bank - Alberto" />
          <meta
            name="twitter:description"
            content="Alberto is the gateway to the Manifest Network"
          />
          <meta name="twitter:image" content="https://" />
          <meta name="twitter:site" content="@" />

          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: 'Bank - Alberto',
              description: 'Alberto is the gateway to the Manifest Network',
              url: 'https://',
              image: 'https://',
              publisher: {
                '@type': 'Organization',
                name: 'Chandra Station',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https:///img/logo.png',
                },
              },
            })}
          </script>
        </Head>

        <div className="h-[calc(100vh-1.5rem)] py-1 gap-4 flex flex-col w-full lg:flex-row animate-fadeIn">
          {!isWalletConnected ? (
            <WalletNotConnected
              description=" Use the button below to connect your wallet and start interacting with your
                    tokens."
              icon={<BankIcon className="h-60 w-60 text-primary" />}
            />
          ) : (
            isWalletConnected &&
            combinedBalances && (
              <div className="flex flex-col lg:flex-row w-full gap-4 h-full">
                <div className="w-full lg:w-1/2 h-[calc(50vh-2rem)] lg:h-full">
                  <TokenList
                    refetchBalances={refetchBalances || resolveRefetch}
                    isLoading={isLoading}
                    balances={combinedBalances}
                    refetchHistory={refetchHistory}
                    address={address ?? ''}
                  />
                </div>
                <div className="w-full lg:w-1/2 h-[calc(50vh-2rem)] lg:h-full">
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
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
