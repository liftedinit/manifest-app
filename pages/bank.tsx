import { WalletSection } from '@/components';
import SendBox from '@/components/bank/components/sendBox';
import TokenList from '@/components/bank/components/tokenList';
import { chainName } from '@/config';
import {
  useGroupsByAdmin,
  usePoaParams,
  useSendTxIncludingAddressQuery,
  useSendTxQuery,
  useTokenBalances,
  useTokenBalancesResolved,
  useTokenFactoryDenoms,
  useTokenFactoryDenomsMetadata,
} from '@/hooks';
import { CoinSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/base/v1beta1/coin';
import { MetadataSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { useChain } from '@cosmos-kit/react';
import Head from 'next/head';
import React, { useMemo } from 'react';
import { HistoryBox } from '@/components';

export type CombinedBalanceInfo = {
  denom: string;
  coreDenom: string;
  amount: string;
  metadata: MetadataSDKType | null;
};

export default function Bank() {
  const { address, isWalletConnected } = useChain(chainName);
  const { balances, isBalancesLoading, refetchBalances } = useTokenBalances(address ?? '');
  const {
    balances: resolvedBalances,
    isBalancesLoading: resolvedLoading,
    refetchBalances: resolveRefetch,
  } = useTokenBalancesResolved(address ?? '');
  const { denoms, isDenomsLoading } = useTokenFactoryDenoms(address ?? '');
  const { metadatas, isMetadatasLoading } = useTokenFactoryDenomsMetadata();
  const { poaParams, refetchPoaParams, isPoaParamsLoading } = usePoaParams();
  const { groupByAdmin, isGroupByAdminLoading, refetchGroupByAdmin } = useGroupsByAdmin(
    poaParams?.admins[0] ?? 'manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj'
  );
  const group = groupByAdmin?.groups?.[0];

  const combinedBalances = useMemo(() => {
    if (!balances || !resolvedBalances || !metadatas) return [];

    return balances.map((coreBalance: { denom: string; amount: any }): CombinedBalanceInfo => {
      const resolvedBalance = resolvedBalances.find(
        (rb: { denom: string | undefined }) =>
          rb.denom === coreBalance.denom || rb.denom === coreBalance.denom.split('/').pop()
      );
      const metadata = metadatas.metadatas.find(
        (m: { base: string }) => m.base === coreBalance.denom
      );

      return {
        denom: resolvedBalance?.denom || coreBalance.denom,
        coreDenom: coreBalance.denom,
        amount: coreBalance.amount,
        metadata: metadata || null,
      };
    });
  }, [balances, resolvedBalances, metadatas]);

  const isLoading =
    isBalancesLoading ||
    resolvedLoading ||
    isDenomsLoading ||
    isMetadatasLoading ||
    isPoaParamsLoading;

  const { sendTxs, refetch } = useSendTxIncludingAddressQuery(address ?? '');

  return (
    <>
      <div className="max-w-5xl relative py-8 mx-auto">
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
        <div className="flex items-center justify-between flex-wrap -ml-4 -mt-2 sm:flex-nowrap">
          <div className="ml-4 mt-2">
            <h3 className="tracking-tight leading-none text-4xl xl:text-4xl md:block hidden">
              Bank
            </h3>
            <h3 className="tracking-tight px-4 leading-none text-4xl xl:text-4xl md:hidden block">
              Bank
            </h3>
          </div>
        </div>
        <div className="mt-6 p-4 gap-4 flex flex-col lg:flex-row rounded-md bg-base-300 shadow-lg transition-opacity duration-300 ease-in-out animate-fadeIn">
          {!isWalletConnected ? (
            <section className="transition-opacity duration-300 ease-in-out animate-fadeIn w-full">
              <div className="grid max-w-screen-xl bg-base-100 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
                <div className="mr-auto place-self-center lg:col-span-7">
                  <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl">
                    Connect your wallet!
                  </h1>
                  <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
                    Use the button below to connect your wallet and start interacting with your
                    tokens.
                  </p>
                  <WalletSection chainName="manifest" />
                </div>
                <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
                  <img src="/bank.svg" alt="groups" className="h-60 w-60" />
                </div>
              </div>
            </section>
          ) : (
            isWalletConnected &&
            combinedBalances && (
              <div className="flex flex-col w-full">
                <div className="flex md:flex-row flex-col gap-4 justify-between items-center w-full transition-opacity duration-300 ease-in-out animate-fadeIn">
                  <SendBox
                    balances={combinedBalances}
                    isBalancesLoading={resolvedLoading}
                    refetchBalances={resolveRefetch || refetch || refetchBalances}
                    address={address ?? ''}
                  />
                  <TokenList balances={combinedBalances} isLoading={resolvedLoading} />
                </div>
                <div className="flex flex-col w-full gap-4 mt-4">
                  <HistoryBox
                    address={address ?? ''}
                    send={sendTxs ?? []}
                    isLoading={resolvedLoading}
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
