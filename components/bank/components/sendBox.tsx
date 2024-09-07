import { useState } from 'react';
import SendForm from '../forms/sendForm';
import IbcSendForm from '../forms/ibcSendForm';
import { PiCaretDownBold } from 'react-icons/pi';
import Image from 'next/image';
import { CoinSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/base/v1beta1/coin';
import { CombinedBalanceInfo } from '@/pages/bank';

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
}: {
  address: string;
  balances: CombinedBalanceInfo[];
  isBalancesLoading: boolean;
  refetchBalances: () => void;
}) {
  const [isIbcTransfer, setIsIbcTransfer] = useState(false);
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
    <div className="flex flex-col rounded-xl max-h-[28rem] md:w-full w-full min-h-[28rem] ">
      <div className="relative  w-full h-10 bg-base-300 rounded-full p-1 mb-6">
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-6px)] bg-primary rounded-full transition-all duration-300 ease-in-out ${
            isIbcTransfer ? 'left-[calc(50%+0px)]' : 'left-[6px]'
          }`}
        ></div>
        <div className="relative flex h-full" aria-label="buttons">
          <button
            className={`flex-1 text-sm font-light z-10 transition-colors duration-300 ${
              !isIbcTransfer ? 'text-base-content' : 'text-gray-600'
            }`}
            onClick={() => setIsIbcTransfer(false)}
          >
            Send
          </button>
          <button
            className={`flex-1 text-sm font-light z-10 transition-colors duration-300 ${
              isIbcTransfer ? 'text-base-content' : 'text-gray-600'
            }`}
            onClick={() => setIsIbcTransfer(true)}
          >
            IBC Transfer
          </button>
        </div>
      </div>
      {isIbcTransfer ? (
        <IbcSendForm
          isIbcTransfer={isIbcTransfer}
          setIsIbcTransfer={setIsIbcTransfer}
          ibcChains={ibcChains}
          selectedChain={selectedChain}
          setSelectedChain={setSelectedChain}
          address={address}
          destinationChain={selectedChain}
          balances={balances}
          isBalancesLoading={isBalancesLoading}
          refetchBalances={refetchBalances}
        />
      ) : (
        <SendForm
          ibcChains={ibcChains}
          address={address}
          balances={balances}
          isBalancesLoading={isBalancesLoading}
          refetchBalances={refetchBalances}
        />
      )}
    </div>
  );
}
