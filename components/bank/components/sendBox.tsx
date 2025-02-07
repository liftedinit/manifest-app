import { useEffect, useMemo, useState } from 'react';
import SendForm from '../forms/sendForm';
import IbcSendForm from '../forms/ibcSendForm';
import env from '@/config/env';
import { CombinedBalanceInfo } from '@/utils/types';
import { ChainContext } from '@cosmos-kit/core';
import React from 'react';

export interface IbcChain {
  id: string;
  name: string;
  icon: string;
  prefix: string;
  chainID: string;
}

export default React.memo(function SendBox({
  address,
  balances,
  isBalancesLoading,
  refetchBalances,
  refetchHistory,
  selectedDenom,
  isGroup,
  admin,
  refetchProposals,
}: {
  address: string;
  balances: CombinedBalanceInfo[];
  isBalancesLoading: boolean;
  refetchBalances: () => void;
  refetchHistory: () => void;
  refetchProposals?: () => void;
  selectedDenom?: string;
  isGroup?: boolean;
  admin?: string;
}) {
  const ibcChains = useMemo<IbcChain[]>(
    () => [
      {
        id: env.chain,
        name: 'Manifest',
        icon: '/logo.svg',
        prefix: 'manifest',
        chainID: env.chainId,
      },
      {
        id: env.osmosisChain,
        name: 'Osmosis',
        icon: '/osmosis.svg',
        prefix: 'osmo',
        chainID: env.osmosisChainId,
      },
      {
        id: env.axelarChain,
        name: 'Axelar',
        icon: 'https://github.com/cosmos/chain-registry/raw/refs/heads/master/axelar/images/axl.svg',
        prefix: 'axelar',
        chainID: env.axelarChainId,
      },
    ],
    []
  );
  const [activeTab, setActiveTab] = useState<'send' | 'cross-chain'>('send');
  const [selectedFromChain, setSelectedFromChain] = useState<IbcChain>(ibcChains[0]);
  const [selectedToChain, setSelectedToChain] = useState<IbcChain>(ibcChains[1]);

  const memoizedBalances = useMemo(() => balances, [balances]);

  useEffect(() => {
    if (selectedFromChain && selectedToChain && selectedFromChain.id === selectedToChain.id) {
      // If chains match, switch the destination chain to the other available chain
      const otherChain = ibcChains.find(chain => chain.id !== selectedFromChain.id);
      if (otherChain) {
        setSelectedToChain(otherChain);
      }
    }
  }, [selectedFromChain, selectedToChain, ibcChains]);

  const getAvailableToChains = useMemo(() => {
    return ibcChains.filter(chain => chain.id !== selectedFromChain.id);
  }, [ibcChains, selectedFromChain]);

  return (
    <div className="rounded-2xl w-full  ">
      <div className="flex mb-4 md:mb-6 w-full h-[3.5rem] rounded-xl p-1 bg-[#0000000A] dark:bg-[#FFFFFF0F]">
        <button
          aria-label="send-tab"
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl transition-colors ${
            activeTab === 'send'
              ? 'dark:bg-[#FFFFFF1F] bg-[#FFFFFF] text-[#161616] dark:text-white'
              : 'text-[#808080]'
          }`}
          onClick={() => setActiveTab('send')}
        >
          Send
        </button>
        {env.chainTier === 'testnet' && (
          <button
            aria-label="cross-chain-transfer-tab"
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl transition-colors ${
              activeTab === 'cross-chain'
                ? 'dark:bg-[#FFFFFF1F] bg-[#FFFFFF] text-[#161616] dark:text-white'
                : 'text-[#808080]'
            }`}
            onClick={() => setActiveTab('cross-chain')}
          >
            Cross-Chain Transfer
          </button>
        )}
      </div>

      <div className="">
        {isBalancesLoading || !balances ? (
          <div className="skeleton h-[300px] w-full"></div>
        ) : (
          <>
            {activeTab === 'cross-chain' && env.chainTier === 'testnet' ? (
              <IbcSendForm
                isIbcTransfer={true}
                ibcChains={ibcChains}
                selectedFromChain={selectedFromChain}
                setSelectedFromChain={setSelectedFromChain}
                selectedToChain={selectedToChain}
                setSelectedToChain={setSelectedToChain}
                address={address}
                destinationChain={selectedToChain}
                balances={memoizedBalances}
                isBalancesLoading={isBalancesLoading}
                refetchBalances={refetchBalances}
                refetchHistory={refetchHistory}
                selectedDenom={selectedDenom}
                isGroup={isGroup}
                admin={admin}
                refetchProposals={refetchProposals}
                availableToChains={getAvailableToChains}
              />
            ) : (
              <SendForm
                address={address}
                balances={memoizedBalances}
                isBalancesLoading={isBalancesLoading}
                refetchBalances={refetchBalances}
                refetchHistory={refetchHistory}
                selectedDenom={selectedDenom}
                isGroup={isGroup}
                admin={admin}
                refetchProposals={refetchProposals}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
});
