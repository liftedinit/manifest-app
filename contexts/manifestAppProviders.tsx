import { Chain } from '@chain-registry/types';
import { Registry } from '@cosmjs/proto-signing';
import { AminoTypes, SigningStargateClientOptions } from '@cosmjs/stargate';
import { MainWalletBase } from '@cosmos-kit/core';
import { ChainProvider } from '@cosmos-kit/react';
import {
  cosmosAminoConverters,
  cosmosProtoRegistry,
  ibcAminoConverters,
  ibcProtoRegistry,
  liftedinitAminoConverters,
  liftedinitProtoRegistry,
  osmosisAminoConverters,
  osmosisProtoRegistry,
  strangeloveVenturesAminoConverters,
  strangeloveVenturesProtoRegistry,
} from '@liftedinit/manifestjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { assets as axelarAssets, chain as axelarChain } from 'chain-registry/testnet/axelartestnet';
import {
  assets as osmosisAssets,
  chain as osmosisChain,
} from 'chain-registry/testnet/osmosistestnet';
import { SignerOptions } from 'cosmos-kit';
import { ReactNode, useContext, useMemo } from 'react';

import { TailwindModal } from '@/components';
import env from '@/config/env';
import { manifestAssets, manifestChain } from '@/config/manifestChain';
import { SkipProvider } from '@/contexts/skipGoContext';
import { ThemeProvider } from '@/contexts/theme';
import { ToastProvider } from '@/contexts/toastContext';
import { Web3AuthContext, Web3AuthProvider } from '@/contexts/web3AuthContext';
import { ContactsProvider } from '@/hooks';

const ManifestChainProvider = ({ children }: { children: ReactNode }) => {
  const web3auth = useContext(Web3AuthContext);
  const combinedWallets = web3auth.wallets as MainWalletBase[];

  const endpointOptions = {
    isLazy: true,
    endpoints: {
      [env.chain]: {
        rpc: [env.rpcUrl],
        rest: [env.apiUrl],
      },
      ['osmosistestnet']: {
        rpc: [env.osmosisRpcUrl],
        rest: [env.osmosisApiUrl],
      },
    },
  };

  // signer options to support amino signing for all the different modules we use
  const signerOptions: SignerOptions = {
    signingStargate: (_chain: string | Chain): SigningStargateClientOptions | undefined => {
      const mergedRegistry = new Registry([
        ...cosmosProtoRegistry,
        ...osmosisProtoRegistry,
        ...strangeloveVenturesProtoRegistry,
        ...liftedinitProtoRegistry,
        ...ibcProtoRegistry,
      ]);
      const mergedAminoTypes = new AminoTypes({
        ...cosmosAminoConverters,
        ...liftedinitAminoConverters,
        ...osmosisAminoConverters,
        ...ibcAminoConverters,
        ...strangeloveVenturesAminoConverters,
      });
      return {
        aminoTypes: mergedAminoTypes,
        registry: mergedRegistry,
      };
    },
  };

  return (
    <ChainProvider
      chains={[manifestChain, osmosisChain, axelarChain]}
      assetLists={[manifestAssets, osmosisAssets, axelarAssets]}
      defaultChain={manifestChain}
      wallets={combinedWallets}
      logLevel={env.production ? 'NONE' : 'INFO'}
      endpointOptions={endpointOptions}
      walletConnectOptions={{
        signClient: {
          projectId: env.walletConnectKey,
          relayUrl: 'wss://relay.walletconnect.org',
          metadata: {
            name: 'Alberto',
            description: 'Manifest Network Web App',
            url: 'https://alberto.com',
            icons: [],
          },
        },
      }}
      signerOptions={signerOptions}
      // @ts-ignore
      walletModal={TailwindModal}
    >
      {children}
    </ChainProvider>
  );
};

export const ManifestAppProviders = ({ children }: { children: ReactNode }) => {
  const client = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={client}>
      <ReactQueryDevtools />
      <Web3AuthProvider>
        <ManifestChainProvider>
          <SkipProvider>
            <ThemeProvider>
              <ToastProvider>
                <ContactsProvider>{children}</ContactsProvider>
              </ToastProvider>
            </ThemeProvider>
          </SkipProvider>
        </ManifestChainProvider>
      </Web3AuthProvider>
    </QueryClientProvider>
  );
};
