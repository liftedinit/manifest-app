import React from "react";
import {render} from "@testing-library/react";
import {ChainProvider} from "@cosmos-kit/react";
import {ToastProvider} from "@/contexts";
import {defaultAssetLists, defaultChain} from "@/tests/mock"

const defaultOptions = {
  chains: [defaultChain],
  assetLists: defaultAssetLists,
  wallets: [],
}

export const renderWithChainProvider = (ui: React.ReactElement, options = {}) => {
  const combinedOptions = { ...defaultOptions, ...options };
  return render(
    <ChainProvider {...combinedOptions}>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </ChainProvider>, options);
};

