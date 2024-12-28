import { WalletNotConnected, FactoryIcon, SearchIcon } from '@/components';
import DenomList from '@/components/factory/components/DenomList';
import {
  useTokenBalances,
  useTokenFactoryDenomsFromAdmin,
  useTokenFactoryDenomsMetadata,
  useTotalSupply,
} from '@/hooks';

import { useChain } from '@cosmos-kit/react';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { ExtendedMetadataSDKType, SEO } from '@/utils';
import env from '@/config/env';
import useIsMobile from '../../hooks/useIsMobile';

export default function Factory() {
  const { address, isWalletConnected } = useChain(env.chain);
  const { denoms, isDenomsLoading, isDenomsError, refetchDenoms } = useTokenFactoryDenomsFromAdmin(
    address ?? ''
  );
  const { metadatas, isMetadatasLoading, isMetadatasError, refetchMetadatas } =
    useTokenFactoryDenomsMetadata();
  const { balances, isBalancesLoading, isBalancesError, refetchBalances } = useTokenBalances(
    address ?? ''
  );
  const { totalSupply, isTotalSupplyLoading, isTotalSupplyError, refetchTotalSupply } =
    useTotalSupply();

  const isMobile = useIsMobile();
  const [pageSize, setPageSize] = useState({
    denomList: 8,
    skeleton: 9,
  });

  const updatePageSizes = useCallback(() => {
    const height = window.innerHeight;
    const width = window.innerWidth;
    // Small screens (mobile)
    if (height < 768) {
      setPageSize({
        denomList: 3,
        skeleton: 3,
      });
      return;
    }

    if (height < 800) {
      setPageSize({
        denomList: 5,
        skeleton: 5,
      });
    } else if (height < 1000 && width < 800) {
      setPageSize({
        denomList: 6,
        skeleton: 6,
      });
    } else if (height < 1000 && width > 800) {
      setPageSize({
        denomList: 8,
        skeleton: 8,
      });
    } else if (height < 1200) {
      setPageSize({
        denomList: 11,
        skeleton: 11,
      });
    } else {
      // For very tall screens
      setPageSize({
        denomList: 12,
        skeleton: 12,
      });
    }
  }, []);

  useEffect(() => {
    updatePageSizes();
    window.addEventListener('resize', updatePageSizes);
    return () => window.removeEventListener('resize', updatePageSizes);
  }, [updatePageSizes]);

  const denomListPageSize = pageSize.denomList;

  const isLoading =
    isDenomsLoading || isMetadatasLoading || isBalancesLoading || isTotalSupplyLoading;
  const isError = isDenomsError || isMetadatasError || isBalancesError || isTotalSupplyError;

  const refetchData = () => {
    refetchDenoms();
    refetchMetadatas();
    refetchBalances();
    refetchTotalSupply();
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

  const isDataReady = combinedData.length > 0;
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen relative lg:py-0 py-4 px-2 mx-auto text-white ">
      <SEO title="Factory - Alberto" />
      <div className="flex-grow animate-fadeIn transition-all duration-300">
        <div className="w-full mx-auto">
          {!isWalletConnected ? (
            <WalletNotConnected
              description="Use the button below to connect your wallet and start creating new tokens."
              icon={<FactoryIcon className="h-60 w-60 text-primary" />}
            />
          ) : (
            <div className="relative w-full h-full overflow-hidden scrollbar-hide p-1">
              <div className="h-full flex flex-col ">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                    <h1
                      className="text-secondary-content"
                      style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
                    >
                      Tokens
                    </h1>
                    <div className="relative w-full sm:w-[224px]">
                      <input
                        type="text"
                        placeholder="Search for a token ..."
                        className="input input-bordered w-full h-[40px] rounded-[12px] border-none bg-secondary text-secondary-content pl-10 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                      <SearchIcon className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full mt-4">
                  {isLoading ? (
                    <DenomList
                      denoms={combinedData}
                      isLoading={isLoading}
                      refetchDenoms={refetchData}
                      pageSize={denomListPageSize}
                      address={address ?? ''}
                      admin={address ?? ''}
                      searchTerm={searchTerm}
                    />
                  ) : isError ? (
                    <div className="text-center my-auto text-error">
                      Error loading tokens. Please try again.
                    </div>
                  ) : !isDataReady ? (
                    <div className="text-center my-auto">No token data available.</div>
                  ) : (
                    <DenomList
                      denoms={combinedData}
                      isLoading={isLoading}
                      refetchDenoms={refetchData}
                      pageSize={denomListPageSize}
                      address={address ?? ''}
                      admin={address ?? ''}
                      searchTerm={searchTerm}
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
