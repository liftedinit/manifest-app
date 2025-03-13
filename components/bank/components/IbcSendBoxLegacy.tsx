import React, { useEffect, useMemo, useState } from 'react';

import { IbcChain } from '@/components';
import env from '@/config/env';

/**
 * Supported chains for IBC transfers.
 */
const IBC_CHAINS: IbcChain[] = [
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
];

/**
 * The legacy form for IBC transfers. This was replaced by the skip-go widget,
 * but kept around in case we want to revive it.
 */
export function IbcSendBoxLegacy() {
  const [selectedFromChain, setSelectedFromChain] = useState<IbcChain>(IBC_CHAINS[0]);
  const [selectedToChain, setSelectedToChain] = useState<IbcChain>(IBC_CHAINS[1]);

  useEffect(() => {
    if (selectedFromChain && selectedToChain && selectedFromChain.id === selectedToChain.id) {
      // If chains match, switch the destination chain to the other available chain
      const otherChain = IBC_CHAINS.find(chain => chain.id !== selectedFromChain.id);
      if (otherChain) {
        setSelectedToChain(otherChain);
      }
    }
  }, [selectedFromChain, selectedToChain]);

  const getAvailableToChains = useMemo(() => {
    return IBC_CHAINS.filter(chain => chain.id !== selectedFromChain.id);
  }, [selectedFromChain]);

  /**
  return (
    <IbcSendForm
      isIbcTransfer={true}
      ibcChains={ibcChains}
      selectedFromChain={selectedFromChain}
      setSelectedFromChain={setSelectedFromChain}
      selectedToChain={selectedToChain}
      setSelectedToChain={setSelectedToChain}
      address={address}
      balances={balances}
      isBalancesLoading={isBalancesLoading}
      selectedDenom={selectedDenom}
      isGroup={isGroup}
      admin={admin}
      availableToChains={getAvailableToChains}
    />
  );
  **/
  // Use the values so they don't trip the linter.
  return (
    <div>
      {selectedFromChain.toString()} {selectedToChain.toString()}
    </div>
  );
}
