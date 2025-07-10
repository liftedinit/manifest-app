import { ChainProvider } from '@cosmos-kit/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import React from 'react';

import { manifestAssets, manifestChain } from '@/config/manifestChain';
import { osmosisAssets, osmosisChain } from '@/config/osmosisChain';
import { ToastProvider } from '@/contexts';
import { Web3AuthContext, Web3AuthContextType } from '@/contexts/web3AuthContext';

const defaultOptions = {
  chains: [manifestChain, osmosisChain],
  assetLists: [manifestAssets, osmosisAssets],
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
  resetWeb3AuthClients: () => {},
};

export const renderWithChainProvider = (ui: React.ReactElement, options = {}) => {
  const combinedOptions = { ...defaultOptions, ...options };
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <ChainProvider throwErrors={false} {...combinedOptions}>
        <ToastProvider>
          <Web3AuthContext.Provider value={defaultWeb3AuthContext}>{ui}</Web3AuthContext.Provider>
        </ToastProvider>
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
