import env from '@/config/env';

import '../styles/globals.css';
import '@interchain-ui/react/styles';
import '@fontsource/manrope';

import type { AppProps } from 'next/app';
import { createPortal } from 'react-dom';
import { useEffect, useMemo, useState } from 'react';
import SignModal from '@/components/react/authSignerModal';
import {
  assets as manifestAssets,
  chain as manifestChain,
} from 'chain-registry/testnet/manifesttestnet';
import {
  assets as osmosisAssets,
  chain as osmosisChain,
} from 'chain-registry/testnet/osmosistestnet';
import { assets as axelarAssets, chain as axelarChain } from 'chain-registry/testnet/axelartestnet';
import { SignerOptions, wallets } from 'cosmos-kit';

import { wallets as cosmosExtensionWallets } from '@cosmos-kit/cosmos-extension-metamask';
import { ChainProvider } from '@cosmos-kit/react';
import { Registry } from '@cosmjs/proto-signing';
import { TailwindModal } from '@/components';
import { ThemeProvider, ToastProvider, ContactsModalProvider } from '@/contexts';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import SideNav from '../components/react/sideNav';
import { Chain } from '@chain-registry/types';
import { SigningStargateClientOptions, AminoTypes } from '@cosmjs/stargate';
import {
  strangeloveVenturesAminoConverters,
  strangeloveVenturesProtoRegistry,
  liftedinitAminoConverters,
  liftedinitProtoRegistry,
  osmosisAminoConverters,
  osmosisProtoRegistry,
  cosmosAminoConverters,
  cosmosProtoRegistry,
  ibcAminoConverters,
  ibcProtoRegistry,
} from '@liftedinit/manifestjs';
import MobileNav from '@/components/react/mobileNav';

import { SkipProvider } from '@/contexts/skipGoContext';

type ManifestAppProps = AppProps & {
  Component: AppProps['Component'];
  pageProps: AppProps['pageProps'];
};

// TODO: remove asset list injections when chain registry is updated

function ManifestApp({ Component, pageProps }: ManifestAppProps) {
  const [isDrawerVisible, setIsDrawerVisible] = useState(() => {
    // Initialize from localStorage if available, otherwise default to true
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('isDrawerVisible');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  // Save to localStorage whenever the state changes
  useEffect(() => {
    localStorage.setItem('isDrawerVisible', JSON.stringify(isDrawerVisible));
  }, [isDrawerVisible]);

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
        // @ts-ignore
        registry: mergedRegistry,
      };
    },
  };

  // tanstack query client
  const client = new QueryClient();

  // combine the web3auth wallets with the other wallets
  const combinedWallets = [
    ...web3AuthWallets,
    ...wallets.for('keplr', 'cosmostation', 'leap', 'ledger'),
    ...cosmosExtensionWallets,
  ];

  // this is stop ssr errors when we render the web3auth signing modal
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

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

  return (
    <ToastProvider>
      <QueryClientProvider client={client}>
        <ReactQueryDevtools />
        {
          <ChainProvider
            chains={[manifestChain, osmosisChain, axelarChain]}
            assetLists={[manifestAssets, osmosisAssets, axelarAssets]}
            defaultChain={manifestChain}
            // @ts-ignore
            wallets={combinedWallets}
            logLevel="NONE"
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
            <SkipProvider>
              <ThemeProvider>
                <ContactsModalProvider>
                  <div className="flex min-h-screen bg-background-color relative">
                    <div className="hidden md:block">
                      <SideNav
                        isDrawerVisible={isDrawerVisible}
                        setDrawerVisible={setIsDrawerVisible}
                      />
                    </div>

                    <div
                      className={`flex-1 transition-all duration-300 ease-in-out 
                      ml-0 lg:ml-36 ${isDrawerVisible ? 'lg:ml-[17rem]' : ''} relative z-0`}
                    >
                      <div className="lg:hidden pt-12">
                        <MobileNav />
                      </div>
                      <main className="p-6 relative z-10">
                        <Component {...pageProps} />
                      </main>
                    </div>
                  </div>

                  {/* Web3auth signing modal */}
                  {isBrowser &&
                    createPortal(
                      <SignModal
                        visible={web3AuthPrompt !== undefined}
                        onClose={() => web3AuthPrompt?.resolve(false)}
                        data={web3AuthPrompt?.signData ?? ({} as SignData)}
                        approve={() => web3AuthPrompt?.resolve(true)}
                        reject={() => web3AuthPrompt?.resolve(false)}
                      />,
                      document.body
                    )}
                </ContactsModalProvider>
              </ThemeProvider>
            </SkipProvider>
          </ChainProvider>
        }
      </QueryClientProvider>
    </ToastProvider>
  );
}

export default ManifestApp;
