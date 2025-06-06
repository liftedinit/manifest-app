import { ChainProvider } from '@cosmos-kit/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { assets as axelarAssets, chain as axelarChain } from 'chain-registry/testnet/axelartestnet';
import {
  assets as osmosisAssets,
  chain as osmosisChain,
} from 'chain-registry/testnet/osmosistestnet';
import React from 'react';

import { manifestAssets, manifestChain } from '@/config/manifestChain';
import { ToastProvider } from '@/contexts';
import { SkipProvider } from '@/contexts/skipGoContext';
import { Web3AuthContext, Web3AuthContextType } from '@/contexts/web3AuthContext';

const defaultOptions = {
  chains: [manifestChain, osmosisChain, axelarChain],
  assetLists: [manifestAssets, osmosisAssets, axelarAssets],
  wallets: [],
};

// Default Web3AuthContext for tests
const defaultWeb3AuthContext: Web3AuthContextType = {
  prompt: undefined,
  promptId: undefined,
  setPromptId: () => {},
  wallets: [],
  isSigning: false,
  setIsSigning: () => {},
};

export const renderWithChainProvider = (ui: React.ReactElement, options = {}) => {
  const combinedOptions = { ...defaultOptions, ...options };
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <ChainProvider throwErrors={false} {...combinedOptions}>
        <SkipProvider>
          <ToastProvider>
            <Web3AuthContext.Provider value={defaultWeb3AuthContext}>{ui}</Web3AuthContext.Provider>
          </ToastProvider>
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
