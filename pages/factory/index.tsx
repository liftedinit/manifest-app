import { WalletSection } from '@/components';
import MyDenoms from '@/components/factory/components/MyDenoms';
import {
  useBalance,
  useGroupsByAdmin,
  useTokenBalances,
  useTokenFactoryBalance,
  useTokenFactoryDenoms,
  useTokenFactoryDenomsMetadata,
} from '@/hooks';
import { MetadataSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { useChain } from '@cosmos-kit/react';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { chainName } from '@/config';
import { CoinSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/base/v1beta1/coin';
import { FactoryIcon } from '@/components';

export default function Factory() {
  const { address, isWalletConnected } = useChain(chainName);
  const { denoms, isDenomsLoading, isDenomsError, refetchDenoms } = useTokenFactoryDenoms(
    address ?? ''
  );
  const { metadatas, isMetadatasLoading, isMetadatasError, refetchMetadatas } =
    useTokenFactoryDenomsMetadata();

  const [selectedDenom, setSelectedDenom] = useState<string | null>(null);
  const [selectedDenomMetadata, setSelectedDenomMetadata] = useState<MetadataSDKType | null>(null);

  const [balance, setBalance] = useState<CoinSDKType | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const {
    balance: fetchedBalance,
    refetchBalance,
    isBalanceLoading: isFetchingBalance,
  } = useTokenFactoryBalance(address ?? '', selectedDenomMetadata?.base ?? '');

  useEffect(() => {
    if (selectedDenomMetadata) {
      setIsBalanceLoading(true);
      refetchBalance().then(() => {
        setIsBalanceLoading(false);
      });
    }
  }, [selectedDenomMetadata, refetchBalance]);

  useEffect(() => {
    if (fetchedBalance) {
      setBalance(fetchedBalance);
    }
  }, [fetchedBalance]);

  // Combine denoms and metadatas
  const combinedData = useMemo(() => {
    if (denoms && metadatas) {
      return denoms.denoms
        .map((denom: string) => {
          return metadatas.metadatas.find(meta => meta.base === denom) || null;
        })
        .filter((meta: MetadataSDKType | null) => meta !== null) as MetadataSDKType[];
    }
    return [];
  }, [denoms, metadatas]);

  const handleDenomSelect = (denom: MetadataSDKType) => {
    setSelectedDenom(denom.base);
    setSelectedDenomMetadata(denom);
  };

  const refetch = async () => {
    refetchDenoms();
    refetchMetadatas();
    if (selectedDenomMetadata) {
      refetchBalance();
    }
  };

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
      </Head>
      <div className="flex-grow animate-fadeIn transition-all duration-300">
        <div className="w-full mx-auto">
          {!isWalletConnected ? (
            <WalletNotConnected />
          ) : !denoms ? (
            <div className="text-center text-error">Error loading tokens</div>
          ) : (
            <>
              <MyDenoms
                denoms={combinedData}
                isLoading={isDenomsLoading || isMetadatasLoading}
                isError={isDenomsError || isMetadatasError}
                refetchDenoms={refetch}
                onSelectDenom={handleDenomSelect}
                address={address ?? ''}
                balance={balance?.amount ?? '0'}
              />
            </>
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
