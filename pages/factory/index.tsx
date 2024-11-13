import { WalletSection } from '@/components';
import MyDenoms from '@/components/factory/components/MyDenoms';
import {
  useTokenBalances,
  useTokenFactoryDenoms,
  useTokenFactoryDenomsMetadata,
  useTotalSupply,
} from '@/hooks';

import { useChain } from '@cosmos-kit/react';
import Head from 'next/head';

import React, { useMemo } from 'react';
import { chainName } from '@/config';

import { FactoryIcon } from '@/components';
import { ExtendedMetadataSDKType } from '@/utils';
import { MFX_TOKEN_DATA } from '@/utils/constants';

export default function Factory() {
  const { address, isWalletConnected } = useChain(chainName);
  const { denoms, isDenomsLoading, isDenomsError } = useTokenFactoryDenoms(address ?? '');
  const { metadatas, isMetadatasLoading, isMetadatasError } = useTokenFactoryDenomsMetadata();
  const { balances, isBalancesLoading, isBalancesError } = useTokenBalances(address ?? '');
  const { totalSupply, isTotalSupplyLoading, isTotalSupplyError } = useTotalSupply();

  const isLoading =
    isDenomsLoading || isMetadatasLoading || isBalancesLoading || isTotalSupplyLoading;
  const isError = isDenomsError || isMetadatasError || isBalancesError || isTotalSupplyError;

  const combinedData = useMemo(() => {
    if (denoms?.denoms && metadatas?.metadatas && balances && totalSupply) {
      const mfxBalance = balances.find(bal => bal.denom === 'umfx')?.amount || '0';
      const mfxSupply = totalSupply.find(supply => supply.denom === 'umfx')?.amount || '0';
      const mfxToken: ExtendedMetadataSDKType = {
        ...MFX_TOKEN_DATA,
        balance: mfxBalance,
        totalSupply: mfxSupply,
      };

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

      return [mfxToken, ...otherTokens];
    }
    return [];
  }, [denoms, metadatas, balances, totalSupply]);

  const isDataReady = combinedData.length > 0;

  return (
    <div className="min-h-screen relative py-4 px-2 mx-auto text-white mt-12 md:mt-0">
      <Head>
        <title>Factory - Alberto</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Alberto is the gateway to the Manifest Network" />
        <meta
          name="keywords"
          content="crypto, blockchain, application, Cosmos-SDK, Alberto, Manifest Network"
        />
        <meta name="author" content="Chandra Station" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content="Factory - Alberto" />
        <meta property="og:description" content="Alberto is the gateway to the Manifest Network" />
        <meta property="og:url" content="https://" />
        <meta property="og:image" content="https://" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Alberto" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Factory - Alberto" />
        <meta name="twitter:description" content="Alberto is the gateway to the Manifest Network" />
        <meta name="twitter:image" content="https://" />
        <meta name="twitter:site" content="@" />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Factory - Alberto',
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
      <div className="flex-grow animate-fadeIn transition-all duration-300">
        <div className="w-full mx-auto">
          {!isWalletConnected ? (
            <WalletNotConnected />
          ) : isLoading ? (
            <MyDenoms
              denoms={combinedData}
              isLoading={isLoading}
              isError={isError}
              refetchDenoms={() => {}}
              address={address ?? ''}
            />
          ) : isError ? (
            <div className="text-center my-auto text-error">
              Error loading tokens. Please try again.
            </div>
          ) : !isDataReady ? (
            <div className="text-center my-auto">No token data available.</div>
          ) : (
            <MyDenoms
              denoms={combinedData}
              isLoading={isLoading}
              isError={isError}
              refetchDenoms={() => {}}
              address={address ?? ''}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function WalletNotConnected() {
  return (
    <section className="transition-opacity duration-300 h-[80vh] ease-in-out animate-fadeIn w-full flex items-center justify-center">
      <div className="grid max-w-4xl bg-base-300 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl dark:text-white text-black">
            Connect your wallet!
          </h1>
          <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
            Use the button below to connect your wallet and start creating new tokens.
          </p>
          <div className="w-[50%]">
            <WalletSection chainName="manifest" />
          </div>
        </div>
        <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
          <FactoryIcon className="h-60 w-60 text-primary" />
        </div>
      </div>
    </section>
  );
}
