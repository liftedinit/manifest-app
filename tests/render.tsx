import React from 'react';
import { render } from '@testing-library/react';
import { ChainProvider } from '@cosmos-kit/react';
import { ToastProvider } from '@/contexts';
import { defaultAssetLists, defaultChain } from '@/tests/mock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const defaultOptions = {
  chains: [defaultChain],
  assetLists: defaultAssetLists,
  wallets: [],
};

export const renderWithChainProvider = (ui: React.ReactElement, options = {}) => {
  const combinedOptions = { ...defaultOptions, ...options };
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <ChainProvider {...combinedOptions}>
        <ToastProvider>{ui}</ToastProvider>
      </ChainProvider>
    </QueryClientProvider>,
    options
  );
};
