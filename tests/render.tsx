import React from 'react';
import { render } from '@testing-library/react';
import { ChainProvider } from '@cosmos-kit/react';
import { ToastProvider } from '@/contexts';

import {
  assets as osmosisAssets,
  chain as osmosisChain,
} from 'chain-registry/testnet/osmosistestnet';
import { assets as axelarAssets, chain as axelarChain } from 'chain-registry/testnet/axelartestnet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SkipProvider } from '@/contexts/skipGoContext';
import { manifestAssets, manifestChain } from '@/config/manifestChain';
import { Web3AuthContext, Web3AuthContextType } from '@/contexts/web3AuthContext';

const defaultOptions = {
  chains: [manifestChain, osmosisChain, axelarChain],
  assetLists: [manifestAssets, osmosisAssets, axelarAssets],
  wallets: [],
};

export const renderWithChainProvider = (ui: React.ReactElement, options = {}) => {
  const combinedOptions = { ...defaultOptions, ...options };
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <ChainProvider {...combinedOptions}>
        <SkipProvider>
          <ToastProvider>{ui}</ToastProvider>
        </SkipProvider>
      </ChainProvider>
    </QueryClientProvider>,
    options
  );
};

export const renderWithWeb3AuthProvider = (
  ui: React.ReactNode,
  context: Web3AuthContextType,
  options = {}
) => {
  return renderWithChainProvider(
    <Web3AuthContext.Provider value={context}>{ui}</Web3AuthContext.Provider>,
    options
  );
};
