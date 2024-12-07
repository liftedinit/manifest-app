import { useState } from 'react';
import SendForm from '../forms/sendForm';
import IbcSendForm from '../forms/ibcSendForm';

import { CombinedBalanceInfo } from '@/utils/types';

export interface IbcChain {
  id: string;
  name: string;
  icon: string;
  prefix: string;
}

export default function SendBox({
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
  const [activeTab, setActiveTab] = useState<'send' | 'cross-chain'>('send');
  const [selectedChain, setSelectedChain] = useState('');
  const ibcChains: IbcChain[] = [
    {
      id: 'osmosis',
      name: 'Osmosis',
      icon: 'https://osmosis.zone/assets/icons/osmo-logo-icon.svg',
      prefix: 'osmo',
    },
  ];

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
      </div>

      <div className="">
        {isBalancesLoading || !balances ? (
          <div className="skeleton h-[300px] w-full"></div>
        ) : (
          <>
            {activeTab === 'cross-chain' ? (
              <IbcSendForm
                isIbcTransfer={true}
                ibcChains={ibcChains}
                selectedChain={selectedChain}
                setSelectedChain={setSelectedChain}
                address={address}
                destinationChain={selectedChain}
                balances={balances}
                isBalancesLoading={isBalancesLoading}
                refetchBalances={refetchBalances}
                refetchHistory={refetchHistory}
                selectedDenom={selectedDenom}
                isGroup={isGroup}
              />
            ) : (
              <SendForm
                address={address}
                balances={balances}
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
}
