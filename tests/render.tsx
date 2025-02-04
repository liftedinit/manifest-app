import React from 'react';
import { render } from '@testing-library/react';
import { ChainProvider } from '@cosmos-kit/react';
import { ToastProvider } from '@/contexts';
import { defaultAssetLists, defaultChain, osmosisChain, osmosisAssetList } from '@/tests/mock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SkipProvider } from '@/contexts/skipGoContext';

const defaultOptions = {
  chains: [defaultChain, osmosisChain],
  assetLists: [...defaultAssetLists, ...osmosisAssetList],
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
