import { useChain } from '@cosmos-kit/react';
import { Tab } from '@headlessui/react';
import React, { useMemo, useState } from 'react';

import { HistoryBox, WalletNotConnected } from '@/components';
import { SEO } from '@/components';
import { TokenList } from '@/components/bank/components/tokenList';
import { BankIcon } from '@/components/icons';
import { SearchInput, SearchProvider } from '@/components/react/SearchFilter';
import env from '@/config/env';
import {
  useGetMessagesFromAddress,
  useIsMobile,
  useTokenBalances,
  useTokenBalancesResolved,
  useTokenFactoryDenomsMetadata,
} from '@/hooks';
import { useResponsivePageSize } from '@/hooks/useResponsivePageSize';
import { MFX_TOKEN_BASE, denomToAsset, unsafeConvertTokenBase } from '@/utils';
import { MFX_TOKEN_DATA } from '@/utils/constants';
import { CombinedBalanceInfo } from '@/utils/types';

interface PageSizeConfig {
  tokenList: number;
  history: number;
  skeleton: number;
}

export default function Bank() {
  const { isWalletConnected, address } = useChain(env.chain);
  const isMobile = useIsMobile();

  const { balances, isBalancesLoading } = useTokenBalances(address ?? '');
  const { balances: resolvedBalances, isBalancesLoading: resolvedLoading } =
    useTokenBalancesResolved(address ?? '');

  const { metadatas, isMetadatasLoading } = useTokenFactoryDenomsMetadata();
  const [currentPage, setCurrentPage] = useState(1);

  const sizeLookup: Array<{ height: number; width: number; sizes: PageSizeConfig }> = [
    {
      height: 700,
      width: Infinity,
      sizes: { tokenList: 4, history: 2, skeleton: 4 },
    },
    {
      height: 800,
      width: Infinity,
      sizes: { tokenList: 5, history: 3, skeleton: 5 },
    },
    {
      height: 1000,
      width: 800,
      sizes: { tokenList: 6, history: 4, skeleton: 6 },
    },
    {
      height: 1000,
      width: Infinity,
      sizes: { tokenList: 6, history: 5, skeleton: 6 },
    },
    {
      height: 1300,
      width: Infinity,
      sizes: { tokenList: 9, history: 7, skeleton: 9 },
    },
  ];

  const defaultSizes = { tokenList: 10, history: 8, skeleton: 10 };

  const responsivePageSize = useResponsivePageSize(sizeLookup, defaultSizes);
  const pageSize = isMobile ? { tokenList: 5, history: 3, skeleton: 5 } : responsivePageSize;

  const skeletonGroupCount = 1;
  const skeletonTxCount = pageSize.skeleton;
  const tokenListPageSize = pageSize.tokenList;
  const historyPageSize = pageSize.history;

  const {
    sendTxs,
    totalPages,
    isLoading: txLoading,
    isError,
  } = useGetMessagesFromAddress(env.indexerUrl, address ?? '', currentPage, historyPageSize);

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

          const baseDenom = assetInfo?.traces?.[1]?.counterparty?.base_denom;

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
          base: unsafeConvertTokenBase(coreBalance.denom),
          amount: coreBalance.amount,
          metadata: metadata || null,
        };
      });

    // Combine 'mfx' with other balances
    return mfxCombinedBalance ? [mfxCombinedBalance, ...otherBalances] : otherBalances;
  }, [balances, resolvedBalances, metadatas]);

  const isLoading = isBalancesLoading || resolvedLoading || isMetadatasLoading;

  return (
    <div className="relative mx-auto">
      <SEO title="Bank - Alberto" />

      <div className="grow h-full animate-fadeIn transition-all duration-300 mt-8 lg:mt-0">
        <div className="w-full mx-auto relative z-100">
          {!isWalletConnected ? (
            <WalletNotConnected
              description="Use the button below to connect your wallet and start interacting with your tokens."
              icon={<BankIcon className="h-60 w-60 text-primary" />}
            />
          ) : (
            <SearchProvider>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                  <h1
                    className="text-secondary-content"
                    style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
                  >
                    Bank
                  </h1>

                  <div className="w-full sm:w-[224px]">
                    <SearchInput placeholder="Search for an asset ..." />
                  </div>
                </div>
              </div>

              <Tab.Group>
                <Tab.List
                  aria-label="Bank Sections"
                  className="flex flex-row tabs tabs-border tabs-lg"
                >
                  <Tab className="font-bold tab ui-selected:tab-active focus:outline-1 focus:outline-primary focus:-outline-offset-1">
                    Assets
                  </Tab>
                  <Tab className="font-bold tab ui-selected:tab-active focus:outline-1 focus:outline-primary focus:-outline-offset-1">
                    Activity
                  </Tab>
                </Tab.List>

                <Tab.Panels className="w-full mt-4">
                  <Tab.Panel>
                    {combinedBalances.length === 0 && !isLoading ? (
                      <NoAssetsFound />
                    ) : (
                      <TokenList
                        isLoading={isLoading}
                        balances={combinedBalances}
                        address={address ?? ''}
                        pageSize={tokenListPageSize}
                      />
                    )}
                  </Tab.Panel>
                  <Tab.Panel>
                    {totalPages === 0 ? (
                      <NoActivityFound />
                    ) : (
                      <HistoryBox
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        address={address ?? ''}
                        isLoading={isLoading}
                        sendTxs={sendTxs}
                        totalPages={totalPages}
                        txLoading={txLoading}
                        isError={isError}
                        skeletonGroupCount={skeletonGroupCount}
                        skeletonTxCount={skeletonTxCount}
                      />
                    )}
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </SearchProvider>
          )}
        </div>
      </div>
    </div>
  );
}

function NoAssetsFound() {
  return (
    <section className="transition-opacity duration-300 h-auto mt-12 ease-in-out animate-fadeIn w-full flex items-center justify-center">
      <div className="grid max-w-4xl bg-base-300 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl text-base-content">
            No Assets Found
          </h1>
          <p className="max-w-2xl mb-6 font-light text-base-content/70 lg:mb-8 md:text-lg lg:text-xl">
            You do not have any assets yet.
          </p>
        </div>
        <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
          <BankIcon className="h-60 w-60 text-primary" />
        </div>
      </div>
    </section>
  );
}

function NoActivityFound() {
  return (
    <section className="transition-opacity duration-300 h-auto mt-12 ease-in-out animate-fadeIn w-full flex items-center justify-center">
      <div className="grid max-w-4xl bg-base-300 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl text-base-content">
            No Activity Found
          </h1>
          <p className="max-w-2xl mb-6 font-light text-base-content/70 lg:mb-8 md:text-lg lg:text-xl">
            You do not have any activity yet. Submit a transaction and revisit this page to view
            your history!
          </p>
        </div>
        <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
          <BankIcon className="h-60 w-60 text-primary" />
        </div>
      </div>
    </section>
  );
}
