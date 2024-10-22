import { WalletSection } from '@/components';
import SendBox from '@/components/bank/components/sendBox';
import TokenList from '@/components/bank/components/tokenList';
import { chainName } from '@/config';
import {
  useSendTxIncludingAddressQuery,
  useTokenBalances,
  useTokenBalancesResolved,
  useTokenFactoryDenoms,
  useTokenFactoryDenomsMetadata,
} from '@/hooks';

import { useChain } from '@cosmos-kit/react';
import Head from 'next/head';
import React, { useMemo } from 'react';
import { HistoryBox } from '@/components';
import { BankIcon } from '@/components/icons';
import { CombinedBalanceInfo } from '@/utils/types';
import { MFX_TOKEN_DATA } from '@/utils/constants'; // Import MFX_TOKEN_DATA

export default function Bank() {
  const { address, isWalletConnected } = useChain(chainName);
  const { balances, isBalancesLoading, refetchBalances } = useTokenBalances(address ?? '');
  const {
    balances: resolvedBalances,
    isBalancesLoading: resolvedLoading,
    refetchBalances: resolveRefetch,
  } = useTokenBalancesResolved(address ?? '');

  const { metadatas, isMetadatasLoading } = useTokenFactoryDenomsMetadata();

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

  const { sendTxs, refetch } = useSendTxIncludingAddressQuery(address ?? '');

  return (
    <>
      <div className="min-h-screen relative py-4 px-2 mx-auto text-white mt-12 md:mt-0">
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

        <div className=" gap-6 flex flex-col w-full lg:flex-row transition-opacity duration-300 ease-in-out animate-fadeIn">
          {!isWalletConnected ? (
            <section className="transition-opacity duration-300 h-[80vh] ease-in-out animate-fadeIn w-full flex items-center justify-center">
              <div className="grid max-w-4xl bg-base-300 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
                <div className="mr-auto place-self-center lg:col-span-7">
                  <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl dark:text-white text-black">
                    Connect your wallet!
                  </h1>
                  <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
                    Use the button below to connect your wallet and start interacting with your
                    tokens.
                  </p>
                  <div className="w-[50%]">
                    <WalletSection chainName="manifest" />
                  </div>
                </div>
                <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
                  <BankIcon className="h-60 w-60 text-primary" />
                </div>
              </div>
            </section>
          ) : (
            isWalletConnected &&
            combinedBalances && (
              <div className="flex flex-col lg:flex-row w-full gap-6 justify-start items-start">
                <div className="xl:w-1/3 lg:w-1/2 w-full flex flex-col gap-6 max-h-screen min-h-screen">
                  <SendBox
                    balances={combinedBalances}
                    isBalancesLoading={isLoading}
                    refetchBalances={refetchBalances || resolveRefetch}
                    refetchHistory={refetch}
                    address={address ?? ''}
                  />
                  <HistoryBox address={address ?? ''} send={sendTxs ?? []} isLoading={isLoading} />
                </div>
                <div className="xl:w-2/3 lg:w-1/2 w-full lg:flex-1 -mt-6">
                  <TokenList balances={combinedBalances} isLoading={isLoading} />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
